// import { EventEmitter } from 'events'; // Unused
import * as vscode from "vscode"
import * as path from "path" // Import path module for file path operations
import { LaunchParams, LaunchResult, DebuggerResponse /*, StackFrameInfo*/ } from "../IDebugController" // Adjust path as needed, commented out StackFrameInfo
import { outputChannel, stringifySafe } from "../vscodeUtils" // Use local outputChannel and stringifySafe
import { RawTerminalOutputManager } from "../terminal/outputCapture" // Added for Raw Terminal Output Capture
import {
	debugEvents,
	DAP_STOPPED_EVENT,
	lastKnownStopEventSessionId,
	lastKnownStopEventBody,
	clearLastKnownStopEvent,
	clearFinalizedSessionDapOutput, // Added for DAP output capture
	clearActiveSessionDapOutputBuffer, // Added for DAP output capture
	finalizeActiveSessionDapOutput, // Added for DAP output capture
	getFinalizedSessionDapOutput, // Added for DAP output capture
	getActiveSessionDapOutput, // Added for launchSession refactor
} from "../debug/events" // Import shared emitter, event name, and last stop info
import { vsCodeDebugController } from "../VsCodeDebugController" // Added for IV.B
import { _executeDapRequestAndProcessOutcome, LaunchOperationInfo, continueExecution } from "./execution" // Added for launchSession refactor & continue
import { setBreakpoint, removeBreakpointByLocation } from "./breakpoints" // Added removeBreakpoint

// --- Session Helper Functions ---

// Store the active session globally within this module
let activeDebugSession: vscode.DebugSession | undefined = undefined
let lastUsedLaunchParams: LaunchParams | undefined = undefined // Added to store last launch params

// Instantiate RawTerminalOutputManager at the module level
// Its lifecycle (dispose) should be managed by the extension's context subscriptions, likely in extension.ts
export const rawTerminalOutputManager = new RawTerminalOutputManager()

// Add listeners for session start and termination
// IMPORTANT: These disposables should be managed by the extension's context subscriptions
/*const sessionStartListener = */ vscode.debug.onDidStartDebugSession((session) => {
	// Commented out unused variable
	//outputChannel.appendLine(
	//		`[Session Listener] onDidStartDebugSession fired for session ${session.id}. Name: "${session.name}", Type: "${session.type}"}`,
	//	)
	// Update the tracked active session when a new one starts
	// This ensures 'activeDebugSession' reflects the most recently started session.
	activeDebugSession = session
	//outputChannel.appendLine(
	//	`[Session Listener] Tracked activeDebugSession updated to: ${activeDebugSession.id} (${activeDebugSession.name})`,
	//)
	// --- DAP Output Capture: Clear previous session data ---
	clearFinalizedSessionDapOutput(session.id)
	clearActiveSessionDapOutputBuffer(session.id)
	//outputChannel.appendLine(
	//	`[Session Listener] Cleared DAP output buffers for new session ${session.id}.`,
	//)
	// --- End DAP Output Capture ---

	// --- Raw Terminal Output Capture: Clear previous and start new ---
	rawTerminalOutputManager.clearFinalizedSessionRawTerminalOutput(session.id)
	if (vscode.window.activeTerminal) {
		rawTerminalOutputManager.startCaptureForSession(session.id, vscode.window.activeTerminal)
		outputChannel.appendLine(
			`[Session Listener] Attempted to start raw terminal capture for session ${session.id} on active terminal "${vscode.window.activeTerminal.name}".`,
		)
	} else {
		outputChannel.appendLine(
			`[Session Listener] No active terminal found at session start for ${session.id}. Cannot start raw terminal capture.`,
		)
	}
	// --- End Raw Terminal Output Capture ---
})

/*const sessionTerminationListener = */ vscode.debug.onDidTerminateDebugSession(async (session) => {
	// Made async
	// Commented out unused variable
	//outputChannel.appendLine(
	//	`[Session Listener] onDidTerminateDebugSession fired for session ${session.id}. Current tracked: ${activeDebugSession?.id}, Last stop session: ${lastKnownStopEventSessionId}`,
	//)

	// --- Raw Terminal Output Capture: Stop and finalize (awaiting the internal delay) ---
	// This needs to happen BEFORE we try to get the finalRawTerminalOutput for the payload.
	await rawTerminalOutputManager.stopCaptureForSession(session.id)
	//outputChannel.appendLine(
	//		`[Session Listener] Stopped and finalized raw terminal output capture for terminated session ${session.id}.`,
	//);
	// --- End Raw Terminal Output Capture ---

	// --- DAP Output Capture: Finalize active buffer ---
	// This will take what's in the active buffer (which is finalDapOutput) and store it, then clear active.
	await finalizeActiveSessionDapOutput(session.id) // Added await
	//outputChannel.appendLine(
	//	`[Session Listener] Finalized DAP output buffer for terminated session ${session.id}.`,
	//)

	// --- IV.A.2: Automatic Output Provisioning on Session Termination ---
	// Now that raw terminal output is finalized, retrieve it.
	//const finalDapOutput = getActiveSessionDapOutput(session.id);
	const finalDapOutput = getLastSessionDapOutput(session.id)
	// Get the *finalized* raw terminal output after stopCaptureForSession has completed.
	//outputChannel.appendLine(
	//	`[Session Listener] Captured finalDapOutput for session ${session.id}:\n${finalDapOutput}`,
	//)
	const finalRawTerminalOutput = rawTerminalOutputManager.getFinalizedSessionRawTerminalOutput(session.id)

	if (finalDapOutput || finalRawTerminalOutput) {
		const outputPayload = {
			sessionId: session.id,
			trigger: "sessionEnd" as const, // Type assertion for discriminated union
			dapOutput: finalDapOutput || undefined,
			rawTerminalOutput: finalRawTerminalOutput || undefined,
		}
		//outputChannel.appendLine(`[Session Listener] Preparing to send debug output for session ${session.id} on termination: ${stringifySafe(outputPayload)}`);
		vsCodeDebugController.notifyDebugOutputCaptured(outputPayload)
		//outputChannel.appendLine(`[Session Listener] Notified controller of captured debug output for session termination.`);
	} else {
		outputChannel.appendLine(
			`[Session Listener] No DAP or Raw Terminal output captured for session ${session.id} on termination.`,
		)
	}
	// --- End IV.A.2 ---

	// --- End DAP Output Capture ---

	// Note: Raw terminal output is already stopped and finalized above.

	// Retrieve and log DAP output for testing purposes
	const dapOutput = getLastSessionDapOutput(session.id)
	if (dapOutput) {
		//outputChannel.appendLine(
		//	`[Session Listener] Captured DAP Output for session ${session.id}:\n${dapOutput}`,
		//)
	} else {
		outputChannel.appendLine(`[Session Listener] No DAP Output captured for session ${session.id}.`)
	}

	// Retrieve and log Raw Terminal output for testing purposes
	const rawOutput = rawTerminalOutputManager.getFinalizedSessionRawTerminalOutput(session.id)
	if (rawOutput) {
		outputChannel.appendLine(
			`[Session Listener] Captured Raw Terminal Output for session ${session.id}:\n${rawOutput}`,
		)
	} else {
		outputChannel.appendLine(`[Session Listener] No Raw Terminal Output captured for session ${session.id}.`)
	}

	if (activeDebugSession && session.id === activeDebugSession.id) {
		activeDebugSession = undefined
	}
	// Also clear last stop event if it belongs to the terminated session
	if (session.id === lastKnownStopEventSessionId) {
		clearLastKnownStopEvent()
	} else if (!activeDebugSession && !lastKnownStopEventSessionId) {
		// If no active session and no last stop session, ensure it's cleared (e.g. if quitSession was called without an active session)
		clearLastKnownStopEvent()
	} else {
		outputChannel.appendLine(
			`[Session Listener] Termination for ${session.id} does NOT match tracked session ${activeDebugSession?.id} or last stop session ${lastKnownStopEventSessionId}. No specific clear for last stop based on this event.`,
		)
	}
})

// --- DAP Output Retrieval ---

/**
 * Retrieves the finalized DAP output for a given session ID.
 * @param sessionId The ID of the debug session.
 * @returns The captured DAP output as a single string, or undefined if not found.
 */
export function getLastSessionDapOutput(sessionId: string): string | undefined {
	const output = getFinalizedSessionDapOutput(sessionId)
	// if (output) {
	// 	outputChannel.appendLine(`[Session] Retrieved finalized DAP output for session ${sessionId}. Length: ${output.length}`)
	// } else {
	// 	outputChannel.appendLine(`[Session] No finalized DAP output found for session ${sessionId}.`)
	// }
	return output
}

// --- End DAP Output Retrieval ---

// --- Raw Terminal Output Retrieval ---

/**
 * Retrieves the finalized Raw Terminal output for a given session ID.
 * @param sessionId The ID of the debug session.
 * @returns The captured Raw Terminal output as a single string, or undefined if not found.
 */
export function getLastSessionRawTerminalOutput(sessionId: string): string | undefined {
	const output = rawTerminalOutputManager.getFinalizedSessionRawTerminalOutput(sessionId)
	/* 	   if (output) {
	       outputChannel.appendLine(`[Session] Retrieved finalized Raw Terminal output for session ${sessionId}. Length: ${output.length}`);
	   } else {
	       outputChannel.appendLine(`[Session] No finalized Raw Terminal output found for session ${sessionId}.`);
	   } */
	return output
}

// --- End Raw Terminal Output Retrieval ---

// Timeout for waiting for stop event (can be overridden)
// Timeout values for different operations
const STOP_EVENT_TIMEOUT_MS = 86400000 // 24 hours - essentially "forever" for debugging purposes
const WAIT_FOR_ACTIVE_SESSION_TIMEOUT_MS = 30000 // 30 seconds (increased from 10s)
const LAUNCH_SESSION_POLL_TIMEOUT_MS = 30000 // Timeout for polling after a stop during launch

/**
 * Waits for the debugger to signal a stop event (breakpoint, step completion, pause)
 * or session termination for the specified session.
 * @param session The debug session to monitor.
 * @param timeoutMs Optional timeout duration in milliseconds. Defaults to STOP_EVENT_TIMEOUT_MS.
 * Waits for the DAP 'stopped' event (via the internal emitter) or session termination.
 * @param session The debug session to monitor.
 * @param timeoutMs Optional timeout duration in milliseconds. Defaults to STOP_EVENT_TIMEOUT_MS.
 * @returns A promise that resolves with an object: `{ stopped: true, eventBody: any }` if a DAP stop event occurred, `{ stopped: false }` if the session terminated, or rejects on timeout.
 */
export async function waitForDapStop(
	session: vscode.DebugSession,
	timeoutMs: number = STOP_EVENT_TIMEOUT_MS,
): Promise<{ stopped: boolean; eventBody?: any }> {
	//outputChannel.appendLine(`[waitForDapStop] Waiting for DAP stop or termination on session ${session.id}...`)
	const sessionId = session.id // Store ID for comparison


	// Stop for any session that has stop events already captured as there are many concurrent sessions and we do not know which one to monitor
	// Initial check: if the session is already inactive, resolve immediately.
/* 	const currentTrackedSession = getActiveSession() // Use our tracked session for consistency
	if (!currentTrackedSession || currentTrackedSession.id !== sessionId) {
		outputChannel.appendLine(
			`[waitForDapStop] Session ${sessionId} appears terminated or is not the tracked active session (currentTracked: ${currentTrackedSession?.id}). Resolving as not stopped.`,
		)
		return Promise.resolve({ stopped: false }) // Indicate termination or mismatch
	}
 */
	// Check if the stop event for this session has ALREADY been captured globally
	// lastKnownStopEventSessionId and lastKnownStopEventBody are imported from '../debug/events'
	//if (lastKnownStopEventSessionId === sessionId && lastKnownStopEventBody) {
	if (lastKnownStopEventBody) {
		// outputChannel.appendLine(
		// 	`[waitForDapStop] Found PRE-EXISTING stop event for session ${sessionId}. Reason: ${lastKnownStopEventBody.reason}.`,
		// )
		const body = lastKnownStopEventBody
		// IMPORTANT FIX: Clear the event once it's been consumed here to prevent staleness
		clearLastKnownStopEvent()
		// outputChannel.appendLine(
		// 	`[waitForDapStop] Cleared pre-existing stop event for session ${sessionId} after consumption.`,
		// )
		return Promise.resolve({ stopped: true, eventBody: body })
	}

	const startTime = Date.now()
	outputChannel.appendLine(
		`[waitForDapStop] No pre-existing stop event found for ${sessionId}. Setting up listeners with ${timeoutMs}ms timeout at ${new Date(startTime).toISOString()}...`,
	)
	return new Promise((resolve, reject) => {
		const disposables: vscode.Disposable[] = []
		let finished = false // Flag to prevent double resolution/rejection

		// Only set up timeout if a positive timeout value is provided
		const timeout =
			timeoutMs > 0
				? setTimeout(() => {
						if (finished) return
						finished = true
						const elapsed = Date.now() - startTime
						outputChannel.appendLine(
							`[WARN] [waitForDapStop] Timeout after ${elapsed}ms waiting for DAP stop/termination on session ${sessionId}. Started at ${new Date(startTime).toISOString()}, now ${new Date().toISOString()}`,
						)
						disposeListeners()
						reject(new Error(`Timeout waiting for DAP stop/termination event after ${timeoutMs}ms`))
					}, timeoutMs)
				: null

		const disposeListeners = () => {
			if (timeout) clearTimeout(timeout)
			// Remove the specific listeners we added
			debugEvents.removeListener(DAP_STOPPED_EVENT, dapStoppedListener)
			disposables.forEach((d) => d.dispose()) // Dispose VS Code listeners
		}

		// Listener for our internal DAP 'stopped' event
		const dapStoppedListener = (eventData: { sessionId: string; body: any }) => {
			if (finished) return
			// if (eventData.sessionId === sessionId) {
			// 	finished = true
			// 	const elapsed = Date.now() - startTime
			// 	// Log the received event body with timing info
			// 	// outputChannel.appendLine(
			// 	// 	`[waitForDapStop] Received internal DAP_STOPPED_EVENT after ${elapsed}ms for session ${sessionId}. Reason: ${eventData.body?.reason}. Started at ${new Date(startTime).toISOString()}, now ${new Date().toISOString()}. Body: ${stringifySafe(eventData.body)}`,
			// 	// )
			// 	disposeListeners()
			// 	resolve({ stopped: true, eventBody: eventData.body }) // Resolve with true and the event body
			// }
			// Listen for the internal DAP 'stopped' event regardless of session ID
			finished = true
			const elapsed = Date.now() - startTime
			// Log the received event body with timing info
			// outputChannel.appendLine(
			// 	`[waitForDapStop] Received internal DAP_STOPPED_EVENT after ${elapsed}ms for session ${sessionId}. Reason: ${eventData.body?.reason}. Started at ${new Date(startTime).toISOString()}, now ${new Date().toISOString()}. Body: ${stringifySafe(eventData.body)}`,
			// )
			disposeListeners()
			resolve({ stopped: true, eventBody: eventData.body }) // Resolve with true and the event body
			
		}
		debugEvents.on(DAP_STOPPED_EVENT, dapStoppedListener)

		// Listener for VS Code's session termination event
		disposables.push(
			vscode.debug.onDidTerminateDebugSession((terminatedSession) => {
				if (finished) return
				if (terminatedSession.id === sessionId) {
					finished = true
					const elapsed = Date.now() - startTime
					// outputChannel.appendLine(
					// 	`[waitForDapStop] Session ${sessionId} terminated after ${elapsed}ms (detected via onDidTerminateDebugSession event). Started at ${new Date(startTime).toISOString()}, now ${new Date().toISOString()}`,
					// )
					disposeListeners()
					resolve({ stopped: false }) // Resolve with false for termination
				}
			}),
		)
	})
}

// Comment out the old function to avoid conflicts
/*
export async function waitForStopEvent(session: vscode.DebugSession, timeoutMs: number = STOP_EVENT_TIMEOUT_MS): Promise<void> {
    log.debug(`Waiting for stop event on session ${session.id}...`);
    return new Promise((resolve, reject) => {
        const disposables: vscode.Disposable[] = [];

        const timeout = setTimeout(() => {
            log.warn(`Timeout waiting for stop event on session ${session.id}`);
            disposeAll();
            reject(new Error(`Timeout waiting for stop event after ${timeoutMs}ms`));
        }, timeoutMs);

        const disposeAll = () => {
            clearTimeout(timeout);
            disposables.forEach(d => d.dispose());
        };

        disposables.push(
            vscode.debug.onDidReceiveDebugSessionCustomEvent(event => {
                if (event.session.id === session.id && event.event === 'stopped') {
                    log.debug(`Received stopped event for session ${session.id}`);
                    disposeAll();
                    resolve();
                }
            }),
            vscode.debug.onDidTerminateDebugSession(terminatedSession => {
                if (terminatedSession.id === session.id) {
                    log.debug(`Session ${session.id} terminated while waiting for stop event.`);
                    disposeAll();
                    resolve(); // Resolve even if terminated, as the execution flow has stopped.
                }
            })
        );
    });
}
*/

/**
 * Gets the currently active debug session tracked by this controller.
 * @returns The active vscode.DebugSession or undefined.
 */
export function getActiveSession(): vscode.DebugSession | undefined {
	activeDebugSession = vscode.debug.activeDebugSession 
	// Log the current state before returning
/* 	if (activeDebugSession) {
		// Check if VS Code still considers it active (optional sanity check)
		const vscodeActive = vscode.debug.activeDebugSession
		if (vscodeActive && vscodeActive.id === activeDebugSession.id) {
			outputChannel.appendLine(
				`[getActiveSession] Returning tracked session ${activeDebugSession.id} (Matches VS Code active session).`,
			)
		} else {
			outputChannel.appendLine(
				`[getActiveSession] Old tracked session ${activeDebugSession.id} update to new VS Code active: ${vscodeActive?.id ?? "none"}).`,
			)
			// Consider if we should clear activeDebugSession here if VS Code doesn't know about it anymore?
			// For now, let's trust our explicit tracking via launch/quit/terminate listener.
			activeDebugSession = vscodeActive // Update to VS Code's active session if it exists
		}
	} else {
		activeDebugSession = vscode.debug.activeDebugSession // Update to VS Code's active session if it exists
		outputChannel.appendLine(`[getActiveSession] No tracked session. Returning undefined.`)
	}
		*/
	return activeDebugSession 
}

/**
 * Ensures an active debug session exists, throwing an error if not.
 * @param operationName User-friendly name of the operation requiring a session.
 * @returns The active debug session.
 * @throws If no active session is found.
 */
export function ensureActiveSession(operationName: string): vscode.DebugSession {
	const session = getActiveSession()
	if (!session) {
		throw new Error(`Cannot ${operationName}: No active debug session found.`)
	}
	return session
}

/**
 * Waits for an active debug session with polling.
 * @param timeoutMs Timeout in milliseconds.
 * @returns The active debug session.
 * @throws If timeout occurs.
 */
export function waitForActiveSession(
	timeoutMs: number = WAIT_FOR_ACTIVE_SESSION_TIMEOUT_MS,
): Promise<vscode.DebugSession> {
	//outputChannel.appendLine(`[waitForActiveSession] Starting wait for active session (timeout: ${timeoutMs}ms)...`)
	return new Promise((resolve, reject) => {
		const startTime = Date.now()
		const checkSession = () => {
			// Directly check VS Code's active session
			const session = vscode.debug.activeDebugSession
			if (session) {
				//outputChannel.appendLine(`[waitForActiveSession] Found active session: ${session.id}`)
				resolve(session)
			} else if (Date.now() - startTime >= timeoutMs) {
				//outputChannel.appendLine(`[waitForActiveSession] Timeout reached.`)
				reject(new Error(`Timeout waiting for active debug session after ${timeoutMs}ms`))
			} else {
				setTimeout(checkSession, 100) // Check every 100ms
			}
		}
		checkSession()
	})
}

// --- Session Management Functions ---

export async function launchSession(params: LaunchParams): Promise<LaunchResult> {
	// Create a deep copy of the original incoming params to store if launch is successful.
	// This ensures that any modifications to 'params' within this function (e.g., params.stopOnEntry)
	// do not affect the parameters stored for a potential restart.
	const originalParamsSnapshot: LaunchParams = JSON.parse(JSON.stringify(params)) as LaunchParams
	outputChannel.appendLine(
		`[Session] launchSession called with params: ${stringifySafe(params)} (snapshot for restart: ${stringifySafe(originalParamsSnapshot)})`,
	)

	// Check and quit any existing debug session first
	const currentSession = getActiveSession()
	if (currentSession) {
		outputChannel.appendLine(`[Session] Found existing debug session ${currentSession.id}. Quitting before launch.`)
		try {
			const quitResult = await quitSession(currentSession)
			if (!quitResult.success) {
				outputChannel.appendLine(`[WARN] [Session] Failed to quit existing session: ${quitResult.errorMessage}`)
			}
		} catch (error: any) {
			outputChannel.appendLine(`[WARN] [Session] Error while quitting existing session: ${error.message}`)
		}
	}

	const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
	let configToUse: vscode.DebugConfiguration | undefined = undefined
	let folderToUse: vscode.WorkspaceFolder | undefined = workspaceFolder
	let configName = params.configName

	// --- Attempt to find config in launch.json first ---
	if (configName && folderToUse) {
		const launchConfigs = vscode.workspace.getConfiguration("launch", folderToUse.uri)
		const configurations = launchConfigs.get<vscode.DebugConfiguration[]>("configurations")
		if (configurations) {
			configToUse = configurations.find((cfg) => cfg.name === configName)
			if (configToUse) {
				outputChannel.appendLine(`[Session] Found configuration named "${configName}" in launch.json.`)
			} else {
				outputChannel.appendLine(
					`[WARN] [Session] Configuration named "${configName}" not found in launch.json. Will attempt dynamic config.`,
				)
			}
		}
	} else if (folderToUse) {
		outputChannel.appendLine(
			`[Session] No config name provided . Will attempt dynamic config.`,
		)
	} else
	{
		outputChannel.appendLine(
			`[Session]  No workspace folder. Will attempt dynamic config.`,
		)
	}
	// --- End Find Config ---

	// --- Dynamic Config Generation ---
	if (!configToUse) {
		const program = params.program
		const pfile = program?.split(/[\\\/]/).pop()

		// Zentara-Debugger: Custom logic for stopOnEntry
		// If stopOnEntry is true, set a breakpoint at the program's first line
		// and then change stopOnEntry to false. This is to avoid stopping
		// in debugger internals (e.g., pytest plugin) when stopOnEntry is used.
		// Modified: Always attempt to set an entry breakpoint if a program is specified,
		// to ensure stability with fast-finishing scripts.
		if (params.program) {
			outputChannel.appendLine(
				`[Session] Program specified. Attempting to set entry breakpoint at ${params.program}:1. Original params.stopOnEntry: ${params.stopOnEntry}. Will set params.stopOnEntry=false for debug config.`,
			)
			try {
				const setBpResult = await setBreakpoint({
					location: { path: params.program, line: 1 },
				})
				if (setBpResult.success) {
					outputChannel.appendLine(`[Session] Successfully set entry breakpoint for ${params.program}:1.`)
					params.stopOnEntry = false // Modify the incoming params , we always set stopOnEntry to false after setting the breakpoint
					outputChannel.appendLine(`[Session] params.stopOnEntry is now false.`)
				} else {
					outputChannel.appendLine(
						`[WARN] [Session] Failed to set entry breakpoint for ${params.program}:1. params.stopOnEntry will remain true. Error: ${setBpResult.errorMessage}`,
					)
				}
			} catch (bpError: any) {
				outputChannel.appendLine(
					`[ERROR] [Session] Error during attempt to set entry breakpoint for ${params.program}:1. params.stopOnEntry will remain true. Error: ${bpError.message}`,
				)
			}
		}
		// End Zentara-Debugger custom logic

		if (params.mode === "pytest") {
			const extensionId = "ZentarAI.zentara-code"
			const extension = vscode.extensions.getExtension(extensionId)
			if (!extension) {
				outputChannel.appendLine(`[ERROR] [Session] Could not find extension with ID: ${extensionId}`)
				return { success: false, errorMessage: `Could not find extension ${extensionId}.`, stopReason: "error" }
			}
			const extensionPath = extension.extensionPath
			if (!extensionPath) {
				outputChannel.appendLine(
					`[ERROR] [Session] Could not determine extension path for ${extensionId} to load pytest plugin.`,
				)
				return {
					success: false,
					errorMessage: `Could not determine extension path for ${extensionId}.`,
					stopReason: "error",
				}
			}
			const pluginPath = vscode.Uri.file(extensionPath).with({
				path: vscode.Uri.joinPath(
					vscode.Uri.file(extensionPath),
					"dist",
					"debug_helper", // Corrected path based on current file content
					"pytest_raise_plugin.py",
				).path,
			}).fsPath
			const relativePluginPath = path.relative(extensionPath, pluginPath)
			const pluginModule = relativePluginPath.replace(/\\/g, ".").replace(/\//g, ".").replace(/\.py$/, "")
			outputChannel.appendLine(`[Session] Attempting to load pytest plugin from path: ${pluginPath}`)
			outputChannel.appendLine(`[Session] Converted to module format: ${pluginModule}`)
			const basePytestArgs = ["-x", "--full-trace", "-p", `no:faulthandler`, "-p", pluginModule]
			const userProvidedArgs = params.args ?? ["-s"]
			const filteredUserArgs = userProvidedArgs.filter((arg) => arg !== "-s")
			const pytestArgs = [...(params.program ? [params.program] : []), ...basePytestArgs, ...filteredUserArgs]
			outputChannel.appendLine(`[Session] Pytest effective args: ${stringifySafe(pytestArgs)}`)
			configToUse = {
				name: "Debug – pytest",
				type: "python",
				request: "launch",
				module: "pytest",
				args: pytestArgs,
				console: "internalConsole",
				justMyCode: true,
				cwd: params.cwd ?? workspaceFolder?.uri.fsPath,
				env: {
					...params.env,
					PYTHONPATH: params.env?.PYTHONPATH
						? `${extensionPath}${path.delimiter}${params.env.PYTHONPATH}`
						: extensionPath,
					PYDEVD_USE_FRAME_EVAL: "NO",
					_PYTEST_RAISE: "1",
					PYTHONNOUSERSITE: "1",
				},
				stopOnEntry: false,
				uncaughtExceptions: true,
			} as vscode.DebugConfiguration
			configName = configToUse.name // Update configName for logging
		} else if (program?.endsWith(".py")) {
			configToUse = {
				name: `Python: ${pfile}`,
				type: "python",
				request: "launch",
				program: program,
				console: "internalConsole",
				justMyCode: true,
				cwd: params.cwd ?? workspaceFolder?.uri.fsPath ?? (program ? path.dirname(program) : undefined),
				env: params.env ?? undefined,
				stopOnEntry: false,
				args: params.args,
			} as vscode.DebugConfiguration
			configName = configToUse.name
		} else if (program?.endsWith(".ts")) {
			configToUse = {
				name: `Debug TypeScript: ${pfile}`,
				type: "node",
				request: "launch",
				runtimeExecutable: "tsx",
				program: program, // Use tsx to run TypeScript files directly
				sourceMaps: true,
				args: params.args ?? [],
				console: "internalConsole",
				cwd: params.cwd ?? workspaceFolder?.uri.fsPath ?? (program ? path.dirname(program) : undefined),
				stopOnEntry: false,
				env: params.env,
			} as vscode.DebugConfiguration
			configName = configToUse.name
		} else if (program?.endsWith(".js") || program?.endsWith(".mjs")) {
			configToUse = {
				name: `Node: ${pfile}`,
				type: "pwa-node",
				request: "launch",
				program,
				args: params.args ?? [],
				console: "internalConsole",
				cwd: params.cwd ?? workspaceFolder?.uri.fsPath ?? (program ? path.dirname(program) : undefined),
				stopOnEntry: false, // Defaulting to true as per original
				env: params.env,
			} as vscode.DebugConfiguration
			configName = configToUse.name
		} else {
			outputChannel.appendLine(
				`[ERROR] [Session] Unsupported program type: ${program}. Cannot generate dynamic config.`,
			)
			return { success: false, errorMessage: `Unsupported program type: ${program}`, stopReason: "error" }
		}
		outputChannel.appendLine(`[Session] Dynamically generated configuration: ${stringifySafe(configToUse)}`)
	}
	// --- End Dynamic Config Generation ---

	if (!configToUse) {
		outputChannel.appendLine(`[ERROR] [Session] No debug configuration resolved. Cannot start session.`)
		return {
			success: false,
			errorMessage: "Could not find or generate a suitable debug configuration.",
			stopReason: "error",
		}
	}

	// Apply overrides from params if they exist, otherwise use configToUse's values or defaults
	configToUse.cwd = params.cwd ?? configToUse.cwd ?? workspaceFolder?.uri.fsPath
	configToUse.args = params.args ?? configToUse.args ?? []
	configToUse.env = { ...(configToUse.env || {}), ...(params.env || {}) }

	// Apply any other overrides from params
	for (const key in params) {
		if (Object.prototype.hasOwnProperty.call(params, key)) {
			// These are already handled above with specific logic
			if (key === "cwd" || key === "args" || key === "env") {
				continue
			}
			const value = params[key as keyof typeof params]
			if (value !== undefined) {
				(configToUse as any)[key] = value
			}
		}
	}
	// stopOnEntry: if params.stopOnEntry is defined, use it. Otherwise, use configToUse.stopOnEntry. If that's also undefined, default to true.
	//configToUse.stopOnEntry = params.stopOnEntry !== undefined ? params.stopOnEntry : (configToUse.stopOnEntry !== undefined ? configToUse.stopOnEntry : true);
	configToUse.stopOnEntry = false // Force stopOnEntry to false for all sessions as per original logic. Instead use setBreakpoint for entry-like stops, so that it stops at our program, not in the plugin internals.

	outputChannel.appendLine(`[Session] Launching with effective args: ${stringifySafe(configToUse.args)}`)
	outputChannel.appendLine(`[Session] Launching with effective env: ${stringifySafe(configToUse.env)}`)
	outputChannel.appendLine(`[Session] Starting debug session with config: ${stringifySafe(configToUse)}`)

	// --- Prepare for Launch Operation ---
	let launchActionSuccess = false
	let launchActionErrorMessage: string | undefined
	let activeSessionAfterLaunch: vscode.DebugSession | undefined

	try {
		// Activate relevant extension if needed (Python example)
		if (configToUse.type === "python" || configToUse.type === "debugpy") {
			// Added debugpy
			const pythonExtension = vscode.extensions.getExtension("ms-python.python")
			if (pythonExtension) {
				try {
					outputChannel.appendLine("[Session] Activating Python extension...")
					await pythonExtension.activate()
					outputChannel.appendLine("[Session] Python extension activated.")
				} catch (activationError: any) {
					outputChannel.appendLine(
						`[WARN] [Session] Failed to activate Python extension: ${activationError.message}`,
					)
				}
			} else {
				outputChannel.appendLine("[WARN] [Session] Python extension (ms-python.python) not found.")
			}
		}

		const vsCodeStartSuccess = await vscode.debug.startDebugging(folderToUse, configToUse)
		outputChannel.appendLine(
			`[Session] vscode.debug.startDebugging for '${configName}' returned: ${vsCodeStartSuccess}`,
		)
		if (!vsCodeStartSuccess) {
			launchActionErrorMessage = `vscode.debug.startDebugging returned false for '${configName}'. Check debug console.`
			outputChannel.appendLine(`[WARN] [Session] ${launchActionErrorMessage}`)
		} else {
			outputChannel.appendLine(`[Session] Waiting for active session to be established for '${configName}'...`)
			// Brief delay before polling, allows onDidStartDebugSession to fire for quick starting sessions
			await new Promise((resolve) => setTimeout(resolve, 2000))
			activeSessionAfterLaunch = await waitForActiveSession(WAIT_FOR_ACTIVE_SESSION_TIMEOUT_MS)
			outputChannel.appendLine(
				`[Session] Active session ${activeSessionAfterLaunch.id} (${activeSessionAfterLaunch.name}) established for '${configName}'.`,
			)
			launchActionSuccess = true
		}
	} catch (error: any) {
		launchActionErrorMessage = error.message || "Unknown error during debug session startup."
		outputChannel.appendLine(
			`[ERROR] [Session] Error during debug session startup: ${launchActionErrorMessage} ${stringifySafe(error)}`,
		)
	}

	if (!launchActionSuccess || !activeSessionAfterLaunch) {
		const sessionIdForOutput = activeSessionAfterLaunch?.id || configToUse?.name || "unknown_session_launch_fail"
		// Ensure outputs are captured even on failure
		const dapOutput = getActiveSessionDapOutput(sessionIdForOutput) || getLastSessionDapOutput(sessionIdForOutput)
		const rawOutput =
			rawTerminalOutputManager.getActiveSessionRawTerminalOutput(sessionIdForOutput) ||
			getLastSessionRawTerminalOutput(sessionIdForOutput)
		return {
			success: false,
			errorMessage: launchActionErrorMessage || "Failed to start or activate debug session.",
			capturedDapOutput: dapOutput,
			capturedRawTerminalOutput: rawOutput,
			stopReason: activeSessionAfterLaunch ? "error" : "terminated",
		}
	}

	// --- Use _executeDapRequestAndProcessOutcome to handle stop event or running state ---
	const launchOpInfo: LaunchOperationInfo = {
		stopOnEntryConfig: configToUse.stopOnEntry!, // configToUse.stopOnEntry is guaranteed to be boolean here
		initialActionSuccess: launchActionSuccess,
		initialActionErrorMessage: launchActionErrorMessage, // Will be undefined if launchActionSuccess is true
	}

	outputChannel.appendLine(
		`[Session] Calling _executeDapRequestAndProcessOutcome for launch. Session: ${activeSessionAfterLaunch.id}, StopOnEntryConfig: ${launchOpInfo.stopOnEntryConfig}`,
	)

	const navigationResult = await _executeDapRequestAndProcessOutcome(
		activeSessionAfterLaunch,
		"launching session",
		STOP_EVENT_TIMEOUT_MS,
		LAUNCH_SESSION_POLL_TIMEOUT_MS,
		undefined, // initialTopFrameForPolling (not applicable for launch)
		undefined, // actionFn (launchInfo is provided)
		launchOpInfo,
	)

	outputChannel.appendLine(
		`[Session] Result from _executeDapRequestAndProcessOutcome: ${stringifySafe(navigationResult)}`,
	)

	if (navigationResult.success) {
		lastUsedLaunchParams = originalParamsSnapshot
		outputChannel.appendLine(
			`[Session] Initial launch/stop successful. Stored lastUsedLaunchParams for restart: ${stringifySafe(lastUsedLaunchParams)}`,
		)

		// Check if this stop is an entry-like stop where we should remove the breakpoint and continue
		if (
			navigationResult.frame &&
			navigationResult.frame.sourcePath && // Changed from navigationResult.frame.source.path
			(navigationResult.stopReason === "breakpoint" ||
				navigationResult.stopReason === "entry" ||
				navigationResult.stopReason === "step")
		) {
			const pathToRemoveBp = navigationResult.frame.sourcePath // Changed from navigationResult.frame.source.path
			const lineToRemoveBp = navigationResult.frame.line
			const weSetThisExplicitly = params.program && params.program === pathToRemoveBp && lineToRemoveBp === 1

			outputChannel.appendLine(
				`[Session] Stopped at entry-like point (${pathToRemoveBp}:${lineToRemoveBp}, reason: ${navigationResult.stopReason}). Explicitly set by us: ${weSetThisExplicitly}. Attempting to remove breakpoint and continue.`,
			)

			try {
				const removeBpResult = await removeBreakpointByLocation({
					// Changed from removeBreakpoint
					location: { path: pathToRemoveBp, line: lineToRemoveBp },
				})
				if (removeBpResult.success) {
					outputChannel.appendLine(
						`[Session] Successfully removed breakpoint at ${pathToRemoveBp}:${lineToRemoveBp}. Session remains paused.`,
					)
				} else {
					outputChannel.appendLine(
						`[WARN] [Session] Failed to remove breakpoint at ${pathToRemoveBp}:${lineToRemoveBp}: ${removeBpResult.errorMessage}. Session remains paused.`,
					)
				}
				// Do not continue. Return the original navigation result, as the session is still paused at this point.
				// The side effect of removing the breakpoint has occurred.
			} catch (error: any) {
				outputChannel.appendLine(
					`[ERROR] [Session] Error during post-entry-breakpoint processing (remove): ${error.message}`,
				)
				// Fall through to return the original navigationResult if post-processing fails
			}
		}
	}
	// If the "remove and continue" logic was not hit, or if it fell through due to an error,
	// or if navigationResult.success was false initially.
	return {
		success: navigationResult.success,
		sessionId: navigationResult.success ? activeSessionAfterLaunch.id : undefined,
		errorMessage: navigationResult.errorMessage,
		stopReason: navigationResult.stopReason,
		frame: navigationResult.frame,
		exceptionMessage: navigationResult.exceptionMessage,
		capturedDapOutput: navigationResult.capturedDapOutput,
		capturedRawTerminalOutput: navigationResult.capturedRawTerminalOutput,
	}
}

export async function restartSession(): Promise<DebuggerResponse> {
	// Removed activeSession parameter
	outputChannel.appendLine(`[Session] restartSession called.`)

	if (!lastUsedLaunchParams) {
		outputChannel.appendLine(`[Session] Cannot restart: previous launch parameters are unknown.`)
		return {
			success: false,
			errorMessage: "Cannot restart session: previous launch parameters are unknown. Launch a session first.",
		}
	}

	outputChannel.appendLine(`[Session] Restarting with last used LaunchParams: ${stringifySafe(lastUsedLaunchParams)}`)

	// Call launchSession with the stored parameters
	// Create a new copy to avoid launchSession modifying the stored params (e.g. stopOnEntry logic)
	const paramsForRestart = { ...lastUsedLaunchParams }
	return launchSession(paramsForRestart)
}

export async function quitSession(sessionToQuit: vscode.DebugSession | undefined): Promise<DebuggerResponse> {
	const session = sessionToQuit ?? getActiveSession()
	outputChannel.appendLine(`[quitSession] Attempting to quit session ${session?.id ?? "none"}.`)
	try {
		if (session) {
			const sessionIdToQuit = session.id

			// Promise to wait for termination event
			const terminationPromise = new Promise<void>((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					outputChannel.appendLine(
						`[quitSession] Timeout waiting for termination event for session ${sessionIdToQuit}.`,
					)
					disposable.dispose() // Clean up listener
					reject(new Error(`Timeout waiting for session ${sessionIdToQuit} to terminate.`))
				}, 10000) // 10-second timeout for termination

				const disposable = vscode.debug.onDidTerminateDebugSession((terminatedSession) => {
					if (terminatedSession.id === sessionIdToQuit) {
						outputChannel.appendLine(
							`[quitSession] Termination event received for session ${sessionIdToQuit}.`,
						)
						clearTimeout(timeoutId)
						disposable.dispose()
						resolve()
					}
				})
			})

			// Clear our tracked session *before* stopping,
			// as stopDebugging might trigger the termination listener.
			if (activeDebugSession && activeDebugSession.id === sessionIdToQuit) {
				outputChannel.appendLine(
					`[quitSession] Clearing tracked active session ${sessionIdToQuit} before stopping.`,
				)
				activeDebugSession = undefined
			}
			// Clear last stop info if it belongs to the session being quit
			if (sessionIdToQuit === lastKnownStopEventSessionId) {
				outputChannel.appendLine(
					`[quitSession] Session to quit ${sessionIdToQuit} matches lastKnownStopEventSessionId. Clearing last stop info.`,
				)
				clearLastKnownStopEvent()
			}

			const stopDebuggingSuccess = await vscode.debug.stopDebugging(session)
			// stopDebugging itself might throw or return false if it fails to initiate termination
			// but VS Code API docs say it's a Thenable<void> that resolves when debugging has stopped.
			// However, it's safer to rely on onDidTerminateDebugSession.

			if (stopDebuggingSuccess === undefined || stopDebuggingSuccess === true) {
				// VS Code API says Thenable<void> but sometimes returns boolean
				outputChannel.appendLine(
					`[quitSession] vscode.debug.stopDebugging called for ${sessionIdToQuit}. Waiting for termination event...`,
				)
				await terminationPromise // Wait for the actual termination
				outputChannel.appendLine(
					`[quitSession] Successfully quit and confirmed termination for session ${sessionIdToQuit}.`,
				)
				return { success: true }
			} else {
				outputChannel.appendLine(
					`[quitSession] vscode.debug.stopDebugging returned false for session ${sessionIdToQuit}.`,
				)
				// Attempt to clean up our state anyway
				if (activeDebugSession && activeDebugSession.id === sessionIdToQuit) activeDebugSession = undefined
				if (lastKnownStopEventSessionId === sessionIdToQuit) clearLastKnownStopEvent()
				return {
					success: false,
					errorMessage: `vscode.debug.stopDebugging returned false for session ${sessionIdToQuit}.`,
				}
			}
		} else {
			outputChannel.appendLine(`[quitSession] No active session found to quit.`)
			// Ensure tracked session is clear if we somehow got here without one
			if (activeDebugSession) {
				outputChannel.appendLine(
					`[quitSession] Clearing potentially stale tracked active session ${activeDebugSession.id}.`,
				)
				activeDebugSession = undefined
			}
			// Also clear last stop info if no session was found to quit (belt and braces)
			if (lastKnownStopEventSessionId) {
				outputChannel.appendLine(
					`[quitSession] No active session, but clearing potentially stale last stop info for session ${lastKnownStopEventSessionId}.`,
				)
				clearLastKnownStopEvent()
			}
			return { success: true } // No session to stop, considered success
		}
	} catch (error: any) {
		const sessionIdOnError = session?.id
		// Also clear tracked session on error
		if (activeDebugSession && sessionIdOnError && activeDebugSession.id === sessionIdOnError) {
			outputChannel.appendLine(`[quitSession] Clearing tracked active session ${sessionIdOnError} due to error.`)
			activeDebugSession = undefined
		}
		// Clear last stop info if it belongs to the session that errored
		if (sessionIdOnError && sessionIdOnError === lastKnownStopEventSessionId) {
			outputChannel.appendLine(
				`[quitSession] Session ${sessionIdOnError} (errored) matches lastKnownStopEventSessionId. Clearing last stop info.`,
			)
			clearLastKnownStopEvent()
		}
		outputChannel.appendLine(`[ERROR] Error stopping debugging: ${error.message}`)
		return { success: false, errorMessage: `Error stopping debugging: ${error.message}` }
	}
}

// --- Resource Disposal ---

/**
 * Disposes resources managed by the session module, specifically the RawTerminalOutputManager.
 * This should be called by the extension's deactivate function.
 */
export function disposeSessionOutputManagerResources(): void {
	outputChannel.appendLine("[Session] Disposing RawTerminalOutputManager resources...")
	rawTerminalOutputManager.dispose()
	outputChannel.appendLine("[Session] RawTerminalOutputManager resources disposed.")
}
