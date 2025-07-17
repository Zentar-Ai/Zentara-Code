import * as vscode from "vscode"
import { DebuggerResponse, JumpParams, StackFrameInfo, NavigationResult } from "../IDebugController"
import { stackTrace } from "./inspection"
import { getActiveSession, getLastSessionDapOutput, rawTerminalOutputManager, waitForDapStop } from "./session" // StopWaitResult is an inline type, removed from import
import { processStopEvent } from "./eventProcessor"
import { outputChannel, stringifySafe } from "../vscodeUtils"
import {
	getActiveSessionDapOutput,
	lastKnownStopEventBody,
	lastKnownStopEventSessionId,
	clearLastKnownStopEvent,
	currentTopFrameId as globalCurrentTopFrameId,
} from "../debug/events"

// Define LaunchOperationInfo interface
export interface LaunchOperationInfo {
	stopOnEntryConfig: boolean
	initialActionSuccess: boolean
	initialActionErrorMessage?: string
}

const STEP_TIMEOUT_MS = 30000
const CONTINUE_TIMEOUT_MS = 300000
const POLL_INTERVAL_MS = 200
const EXCEPTION_CATCHUP_DELAY_MS = 200 // Renamed from the diff to match existing constant if any, or keep if new

function _buildNavigationResult(processedResult: Partial<NavigationResult>, operationName: string): NavigationResult {
	const resultToReturn: NavigationResult = {
		success: processedResult.success ?? false,
		errorMessage: processedResult.success
			? undefined
			: processedResult.errorMessage || `Error processing event for ${operationName}`,
		frame: processedResult.frame,
		exceptionMessage: processedResult.exceptionMessage,
		stopReason: processedResult.stopReason,
		capturedDapOutput: processedResult.capturedDapOutput,
		capturedRawTerminalOutput: processedResult.capturedRawTerminalOutput,
	}
	outputChannel.appendLine(
		`[${operationName}] Returning ${resultToReturn.success ? "success" : "error"} result: ${stringifySafe(resultToReturn)}`,
	)
	return resultToReturn
}

async function pollUntilStateChange(
	session: vscode.DebugSession,
	initialTopFrame: StackFrameInfo | undefined,
	operationName: string,
	timeoutMs: number,
): Promise<void> {
	const startTime = Date.now()
	outputChannel.appendLine(
		`[Polling Check] Starting polling for ${operationName} at ${new Date(startTime).toISOString()} with ${timeoutMs}ms timeout...`,
	)
	outputChannel.appendLine(`[Polling Check] Initial frame: ${stringifySafe(initialTopFrame)}`)
	while (Date.now() - startTime < timeoutMs) {
		const currentLoopActiveSession = getActiveSession()
		if (!currentLoopActiveSession || currentLoopActiveSession.id !== session.id) {
			outputChannel.appendLine(`[Polling Check] Session terminated during polling for ${operationName}.`)
			return
		}
		try {
			const traceResult = await stackTrace(currentLoopActiveSession)
			if (traceResult.success && traceResult.frames && traceResult.frames.length > 0) {
				const currentTopFrame = traceResult.frames[0]
				if (
					!initialTopFrame ||
					currentTopFrame.id !== initialTopFrame.id ||
					currentTopFrame.line !== initialTopFrame.line
				) {
					// Removed sourcePath check to match original
					const elapsed = Date.now() - startTime
					outputChannel.appendLine(
						`[Polling Check] State changed confirmed after ${elapsed}ms for ${operationName}. Initial: ${initialTopFrame?.id}/${initialTopFrame?.line}, Current: ${currentTopFrame.id}/${currentTopFrame.line}`,
					)
					return
				}
			} else if (!traceResult.success && traceResult.errorMessage?.includes("No active debug session")) {
				outputChannel.appendLine(
					`[Polling Check] Session terminated during stack trace attempt for ${operationName}.`,
				)
				return
			} else if (!traceResult.success) {
				outputChannel.appendLine(
					`[WARN][Polling Check] stackTrace failed during ${operationName}: ${traceResult.errorMessage}. Retrying...`,
				)
			} else {
				outputChannel.appendLine(
					`[Polling Check] stackTrace returned no frames after ${operationName}. Assuming completion or termination.`,
				)
				return
			}
		} catch (pollError: any) {
			outputChannel.appendLine(
				`[WARN][Polling Check] Error during stackTrace poll for ${operationName}: ${pollError.message}. Retrying...`,
			)
		}
		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
	}
	const elapsed = Date.now() - startTime
	outputChannel.appendLine(
		`[WARN][Polling Check] Timeout after ${elapsed}ms (limit: ${timeoutMs}ms) waiting for state change after ${operationName}.`,
	)
}

async function sendDapRequest(
	session: vscode.DebugSession,
	command: string,
	args: any,
	operationName: string,
): Promise<DebuggerResponse> {
	// Kept DebuggerResponse as return type
	// outputChannel.appendLine(`[DAP Send][${operationName}] Sending '${command}' with args: ${stringifySafe(args)}`); // Original didn't have this line here
	try {
		await new Promise<void>((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				reject(new Error(`DAP request '${command}' timed out after ${STEP_TIMEOUT_MS}ms`))
			}, STEP_TIMEOUT_MS)
			const thenable = session.customRequest(command, args)
			thenable.then(
				() => {
					clearTimeout(timeoutId)
					resolve()
				},
				(err: any) => {
					clearTimeout(timeoutId)
					reject(err)
				},
			)
		})
		// outputChannel.appendLine(`[DAP Send][${operationName}] DAP request '${command}' successful.`); // Original didn't have this
		return { success: true }
	} catch (error: any) {
		outputChannel.appendLine(`[ERROR] Error ${operationName} (DAP Send): ${error.message} ${stringifySafe(error)}`) // Original log
		if (error.message?.includes("session has been terminated")) {
			return {
				success: false,
				errorMessage: `Error ${operationName}: Debug session terminated unexpectedly during DAP request.`,
			}
		}
		return { success: false, errorMessage: `Error ${operationName} (DAP Send): ${error.message}` }
	}
}

async function getThreadId(session: vscode.DebugSession): Promise<number> {
	// outputChannel.appendLine(`[getThreadId] Attempting to get thread ID for session ${session.id}`); // Original didn't have this
	try {
		for (let attempts = 0; attempts < 5; attempts++) {
			await new Promise((resolve) => setTimeout(resolve, 150 * (attempts + 1)))
			const threadsResp = await new Promise<any>((resolveCustom, rejectCustom) => {
				const timeoutId = setTimeout(
					() => rejectCustom(new Error("DAP 'threads' request timed out")),
					STEP_TIMEOUT_MS,
				) // Original used STEP_TIMEOUT_MS
				const thenable = session.customRequest("threads")
				thenable.then(
					(response) => {
						clearTimeout(timeoutId)
						resolveCustom(response)
					},
					(err: any) => {
						clearTimeout(timeoutId)
						rejectCustom(err)
					},
				)
			})
			const threadId = threadsResp?.threads?.[0]?.id
			if (threadId !== undefined) {
				// outputChannel.appendLine(`[getThreadId] Successfully got thread ID: ${threadId}`); // Original didn't have this
				return threadId
			}
			outputChannel.appendLine(`[getThreadId] Attempt ${attempts + 1}: Failed to extract threadId. Retrying...`)
		}
		throw new Error("Could not determine thread ID after multiple attempts.")
	} catch (error: any) {
		outputChannel.appendLine(`[ERROR] Error getting thread ID: ${error.message} ${stringifySafe(error)}`) // Original log
		if (error.message?.includes("session has been terminated")) {
			throw new Error(`Could not get thread ID: Debug session terminated unexpectedly.`)
		}
		throw new Error(`Could not determine thread ID: ${error.message}`)
	}
}

export async function _executeDapRequestAndProcessOutcome(
	activeSession: vscode.DebugSession,
	operationName: string,
	waitTimeoutForStopEvent: number,
	pollTimeoutForStateChange: number,
	initialTopFrameForPolling?: StackFrameInfo,
	actionFn?: () => Promise<{ success: boolean; errorMessage?: string }>, // For DAP commands
	launchInfo?: LaunchOperationInfo, // For launch operations
): Promise<NavigationResult> {
	outputChannel.appendLine(
		`[${operationName}] Core helper. Session: ${activeSession.id}, LaunchInfo: ${stringifySafe(launchInfo)}`,
	)

	try {
		let actionResult: { success: boolean; errorMessage?: string }

		if (launchInfo) {
			actionResult = {
				success: launchInfo.initialActionSuccess,
				errorMessage: launchInfo.initialActionErrorMessage,
			}
			// Log for using pre-completed action result (minimal change)
			if (actionResult.success) {
				outputChannel.appendLine(`[${operationName}] Using pre-completed launch action: Success.`)
			} else {
				outputChannel.appendLine(
					`[${operationName}] Using pre-completed launch action: Failed (${actionResult.errorMessage}).`,
				)
			}
		} else if (actionFn) {
			// outputChannel.appendLine(`[${operationName}] Executing provided actionFn...`); // Keep original logging style, which was no log here
			actionResult = await actionFn() // This will call sendDapRequest which has its own logging
			// outputChannel.appendLine(`[${operationName}] actionFn result: Success: ${actionResult.success}`); // No log here in original
		} else {
			outputChannel.appendLine(`[ERROR][${operationName}] No actionFn or launchInfo provided.`)
			const dapOutput = getLastSessionDapOutput(activeSession.id)
			const rawOutput = rawTerminalOutputManager.getFinalizedSessionRawTerminalOutput(activeSession.id)
			return _buildNavigationResult(
				{
					success: false,
					errorMessage: "Internal error: No action or launch information provided to outcome processor.",
					stopReason: "error",
					capturedDapOutput: dapOutput,
					capturedRawTerminalOutput: rawOutput,
				},
				operationName,
			)
		}

		if (!actionResult.success) {
			outputChannel.appendLine(
				`[${operationName}] DAP request failed: ${actionResult.errorMessage}. Allowing time for final output capture...`,
			) // Matched original log for dapRequestResult.success false
			const sessionId = activeSession.id
			await new Promise((resolve) => setTimeout(resolve, 500))
			const dapOutput = getLastSessionDapOutput(sessionId)
			const rawOutput = rawTerminalOutputManager.getFinalizedSessionRawTerminalOutput(sessionId)
			return _buildNavigationResult(
				{
					success: false,
					errorMessage:
						actionResult.errorMessage || `Session terminated during ${operationName} (DAP request failed).`, // Matched original
					stopReason: "terminated", // Matched original
					capturedDapOutput: dapOutput,
					capturedRawTerminalOutput: rawOutput,
				},
				operationName,
			)
		}
		// outputChannel.appendLine(`[${operationName}] DAP request '${dapCommand}' sent successfully, awaiting stop event...`); // Original log, dapCommand not available here

		let stopResult: { stopped: boolean; eventBody?: any } | undefined = undefined
		let bodyToProcess: any = undefined

		// if (launchInfo && !launchInfo.stopOnEntryConfig) {
		// 	outputChannel.appendLine(`[${operationName}] Launch with no stopOnEntry. Checking for immediate global stop...`);
		// 	if (lastKnownStopEventSessionId === activeSession.id && lastKnownStopEventBody) {
		// 		outputChannel.appendLine(`[${operationName}] Found pre-existing global stop event. Reason: ${lastKnownStopEventBody.reason}.`);
		// 		bodyToProcess = lastKnownStopEventBody;
		// 		clearLastKnownStopEvent();
		//         // Simulate a "stopped" event for the logic below
		//         stopResult = { stopped: true, eventBody: bodyToProcess };
		// 	} else {
		// 		outputChannel.appendLine(`[${operationName}] No pre-existing global stop. Program is considered running.`);
		// 		const dap = getActiveSessionDapOutput(activeSession.id);
		// 		const raw = rawTerminalOutputManager.getActiveSessionRawTerminalOutput(activeSession.id);
		// 		return _buildNavigationResult({
		// 			success: true,
		// 			stopReason: 'running',
		// 			capturedDapOutput: dap,
		// 			capturedRawTerminalOutput: raw,
		// 		}, operationName);
		// 	}
		// } else {
		// 	outputChannel.appendLine(`[${operationName}] Started DAP stop event listener.`);
		// 	stopResult = await waitForDapStop(activeSession, waitTimeoutForStopEvent);
		//     if (stopResult.stopped) {
		//         bodyToProcess = stopResult.eventBody;
		//     }
		// }

		outputChannel.appendLine(`[${operationName}] Started DAP stop event listener.`)
		stopResult = await waitForDapStop(activeSession, waitTimeoutForStopEvent)
		if (stopResult.stopped) {
			bodyToProcess = stopResult.eventBody
		}

		if (!stopResult || !stopResult.stopped) {
			// Covers termination or timeout from waitForDapStop
			outputChannel.appendLine(
				`[${operationName}] Session terminated during wait for stop event. Allowing time for final output capture...`,
			)
			const sessionId = activeSession.id
			await new Promise((resolve) => setTimeout(resolve, 2000))
			const dapOutput = getLastSessionDapOutput(sessionId)
			const rawOutput = rawTerminalOutputManager.getFinalizedSessionRawTerminalOutput(sessionId)
			return _buildNavigationResult(
				{
					success: false,
					errorMessage: `Session terminated during ${operationName}.`,
					stopReason: "terminated",
					capturedDapOutput: dapOutput,
					capturedRawTerminalOutput: rawOutput,
				},
				operationName,
			)
		}
		// At this point, stopResult.stopped is true and bodyToProcess has the eventBody

		outputChannel.appendLine(
			`[${operationName}] Initial stop event received. Delaying ${EXCEPTION_CATCHUP_DELAY_MS}ms for potential concurrent exception processing...`,
		)
		await new Promise((resolve) => setTimeout(resolve, EXCEPTION_CATCHUP_DELAY_MS))
		outputChannel.appendLine(`[${operationName}] Delay complete. Proceeding to check final stop event body.`)

		// Re-check global lastKnownStopEventBody
		// const { lastKnownStopEventBody: globalBody, lastKnownStopEventSessionId: globalSessionId } = await import('../debug/events'); // Already imported
		if (
			lastKnownStopEventBody && // Check if global one exists
			lastKnownStopEventSessionId === activeSession.id &&
			lastKnownStopEventBody.reason === "exception" &&
			lastKnownStopEventBody.exceptionInfoDetails &&
			(bodyToProcess?.reason !== "exception" || !bodyToProcess?.exceptionInfoDetails)
		) {
			outputChannel.appendLine(
				`[${operationName}] Overriding initial stop event body with more detailed global exception event. Initial reason: ${bodyToProcess?.reason}, Global reason: ${lastKnownStopEventBody.reason}`,
			)
			bodyToProcess = lastKnownStopEventBody // Update bodyToProcess
			clearLastKnownStopEvent() // Consumed the global one
		}

		outputChannel.appendLine(
			`[${operationName}] DAP Stop event received (Reason: ${bodyToProcess?.reason}), starting polling check...`,
		)
		await pollUntilStateChange(activeSession, initialTopFrameForPolling, operationName, pollTimeoutForStateChange)
		outputChannel.appendLine(`[${operationName}] Polling check complete.`)

 		const currentActiveSessionAfterPoll = getActiveSession()
/*		if (!currentActiveSessionAfterPoll || currentActiveSessionAfterPoll.id !== activeSession.id) {
			outputChannel.appendLine(
				`[${operationName}] Session terminated after polling check. Allowing time for final output capture...`,
			)
			const sessionId = activeSession.id
			await new Promise((resolve) => setTimeout(resolve, 500))
			const dapOutput = getLastSessionDapOutput(sessionId)
			const rawOutput = rawTerminalOutputManager.getFinalizedSessionRawTerminalOutput(sessionId)
			return _buildNavigationResult(
				{
					success: false,
					errorMessage: `Session terminated after ${operationName} polling/completion.`,
					stopReason: "terminated",
					capturedDapOutput: dapOutput,
					capturedRawTerminalOutput: rawOutput,
				},
				operationName,
			)
		}
 */
		// outputChannel.appendLine(`[${operationName}] DAP Stop event received (Reason: ${bodyToProcess?.reason}). Checking for more recent exception...`); // Already logged similar
		outputChannel.appendLine(
			`[${operationName}] Calling processStopEvent with body (Reason: ${bodyToProcess?.reason})...`,
		)
		const processedResult = await processStopEvent(currentActiveSessionAfterPoll, bodyToProcess, operationName)
		outputChannel.appendLine(
			`[${operationName}] Received processed result from processStopEvent: ${stringifySafe(processedResult)}`,
		)

		const finalDapOutput =
			getActiveSessionDapOutput(currentActiveSessionAfterPoll.id) ||
			getLastSessionDapOutput(currentActiveSessionAfterPoll.id)
		const finalRawOutput =
			rawTerminalOutputManager.getActiveSessionRawTerminalOutput(currentActiveSessionAfterPoll.id) ||
			rawTerminalOutputManager.getFinalizedSessionRawTerminalOutput(currentActiveSessionAfterPoll.id)

		return _buildNavigationResult(
			{
				...processedResult,
				capturedDapOutput: finalDapOutput,
				capturedRawTerminalOutput: finalRawOutput,
			},
			operationName,
		)
	} catch (error: any) {
		outputChannel.appendLine(
			`[ERROR][${operationName}] Unhandled error in _executeDapRequestAndProcessOutcome: ${error.message} ${stringifySafe(error)}.`,
		)
		const dapOutput = getLastSessionDapOutput(activeSession.id)
		const rawOutput = rawTerminalOutputManager.getFinalizedSessionRawTerminalOutput(activeSession.id)
		return _buildNavigationResult(
			{
				success: false,
				errorMessage: error instanceof Error ? error.message : String(error),
				stopReason: "error",
				capturedDapOutput: dapOutput,
				capturedRawTerminalOutput: rawOutput,
			},
			operationName,
		)
	}
}

async function _executeNavigationDapCommand(
	sessionFromArg: vscode.DebugSession | undefined,
	dapCommand: "continue" | "next" | "stepIn" | "stepOut" | "goto",
	dapArgs: any,
	operationName: string,
): Promise<NavigationResult> {
	const activeSession = getActiveSession()
	if (!sessionFromArg || !activeSession || sessionFromArg.id !== activeSession.id) {
		// Minimal change: Keep existing log for this specific error path
		return _buildNavigationResult(
			{ success: false, errorMessage: `Error ${operationName}: No active debug session.` },
			operationName,
		)
	}

	try {
		let initialTopFrameForPolling: StackFrameInfo | undefined = undefined
		const isSteppingOperation = dapCommand === "next" || dapCommand === "stepIn" || dapCommand === "stepOut"

		if (isSteppingOperation || dapCommand === "goto") {
			const initialTrace = await stackTrace(activeSession)
			if (initialTrace.success && initialTrace.frames && initialTrace.frames.length > 0) {
				initialTopFrameForPolling = initialTrace.frames[0]
			} else {
				outputChannel.appendLine(`[WARN][${operationName}] Could not get initial stack trace for polling.`)
			}
		}

		let finalDapArgs = { ...dapArgs }
		if (dapCommand !== "goto") {
			const threadId = await getThreadId(activeSession)
			finalDapArgs.threadId = threadId
		} else {
			if (finalDapArgs.targetId === undefined) {
				outputChannel.appendLine(`[ERROR][${operationName}] targetId is required for 'goto' command.`)
				throw new Error("targetId is required for 'goto' command.")
			}
			if (!finalDapArgs.threadId) {
				const threadId = await getThreadId(activeSession)
				finalDapArgs.threadId = threadId
			}
		}

		const actionFn = () => sendDapRequest(activeSession, dapCommand, finalDapArgs, operationName)
		const timeoutForStop =
			dapCommand === "continue" || dapCommand === "goto" ? CONTINUE_TIMEOUT_MS : STEP_TIMEOUT_MS
		const timeoutForPoll = STEP_TIMEOUT_MS

		return _executeDapRequestAndProcessOutcome(
			activeSession,
			operationName,
			timeoutForStop, // Use full timeout for stop event
			timeoutForPoll,
			initialTopFrameForPolling,
			actionFn,
			undefined, // No launchInfo
		)
	} catch (error: any) {
		outputChannel.appendLine(`[ERROR][${operationName}] Setup error: ${error.message}`)
		const dapOutput = getActiveSessionDapOutput(activeSession.id) || getLastSessionDapOutput(activeSession.id)
		const rawOutput =
			rawTerminalOutputManager.getActiveSessionRawTerminalOutput(activeSession.id) ||
			rawTerminalOutputManager.getFinalizedSessionRawTerminalOutput(activeSession.id)
		return _buildNavigationResult(
			{
				success: false,
				errorMessage: error.message || `Setup failed for ${operationName}`,
				stopReason: "error",
				capturedDapOutput: dapOutput,
				capturedRawTerminalOutput: rawOutput,
			},
			operationName,
		)
	}
}

export async function continueExecution(session: vscode.DebugSession | undefined): Promise<NavigationResult> {
	return _executeNavigationDapCommand(session, "continue", {}, "continuing execution")
}

export async function nextStep(session: vscode.DebugSession | undefined): Promise<NavigationResult> {
	return _executeNavigationDapCommand(session, "next", {}, "stepping over (next)")
}

export async function stepIn(session: vscode.DebugSession | undefined): Promise<NavigationResult> {
	return _executeNavigationDapCommand(session, "stepIn", {}, "stepping in")
}

export async function stepOut(session: vscode.DebugSession | undefined): Promise<NavigationResult> {
	return _executeNavigationDapCommand(session, "stepOut", {}, "stepping out")
}

export async function jumpToLine(
	session: vscode.DebugSession | undefined,
	params: JumpParams,
): Promise<NavigationResult> {
	const operationName = "jumping execution"
	const activeSession = getActiveSession()
	if (!session || !activeSession || session.id !== activeSession.id) {
		return _buildNavigationResult(
			{ success: false, errorMessage: `Error ${operationName}: No active debug session.` },
			operationName,
		)
	}

	try {
		const frameIdToUse = params.frameId ?? globalCurrentTopFrameId
		if (frameIdToUse === undefined) {
			const errorMessage = `Error ${operationName}: Frame ID is required, but none was provided and no current top frame ID is available.`
			outputChannel.appendLine(`[ERROR][${operationName}] ${errorMessage}`)
			return _buildNavigationResult({ success: false, errorMessage }, operationName)
		}

		const traceResult = await stackTrace(activeSession)
		if (!traceResult.success || !traceResult.frames || traceResult.frames.length === 0) {
			const errMessage = traceResult.errorMessage?.includes("No active debug session")
				? "Failed to get stack trace for jump: Debug session ended."
				: traceResult.errorMessage || "Failed to get stack trace for jump."
			return _buildNavigationResult(
				{ success: false, errorMessage: errMessage, stopReason: "terminated" },
				operationName,
			)
		}
		const frame = traceResult.frames.find((f) => f.id === frameIdToUse)
		if (!frame) {
			return _buildNavigationResult(
				{ success: false, errorMessage: `Frame ID ${frameIdToUse} not found in stack trace.` },
				operationName,
			)
		}
		if (!frame.sourcePath) {
			return _buildNavigationResult(
				{ success: false, errorMessage: `Frame ${frameIdToUse} does not have a source path.` },
				operationName,
			)
		}

		const gotoTargetsArgs = { source: { path: frame.sourcePath }, line: params.line }
		outputChannel.appendLine(
			`[${operationName}] Attempting to get 'gotoTargets' for ${frame.sourcePath}:${params.line}`,
		)

		const targetsResponse = await new Promise<any>((resolveCustom, rejectCustom) => {
			const timeoutId = setTimeout(
				() => rejectCustom(new Error("DAP 'gotoTargets' request timed out")),
				STEP_TIMEOUT_MS,
			)
			activeSession.customRequest("gotoTargets", gotoTargetsArgs).then(
				(response) => {
					clearTimeout(timeoutId)
					resolveCustom(response)
				},
				(err: any) => {
					clearTimeout(timeoutId)
					rejectCustom(err)
				},
			)
		})
		outputChannel.appendLine(`[${operationName}] 'gotoTargets' response: ${stringifySafe(targetsResponse)}`)

		if (!targetsResponse?.targets?.length) {
			return _buildNavigationResult(
				{
					success: false,
					errorMessage: `Could not find a valid jump target at ${frame.sourcePath}:${params.line}. Debugger might not support jumping to this location.`,
				},
				operationName,
			)
		}
		const targetId = targetsResponse.targets[0].id
		if (targetId === undefined) {
			return _buildNavigationResult(
				{ success: false, errorMessage: "Found jump target but it lacked a required ID." },
				operationName,
			)
		}

		const navOutcome = await _executeNavigationDapCommand(activeSession, "goto", { targetId }, operationName)

		if (navOutcome.success && navOutcome.frame) {
			outputChannel.appendLine(
				`[${operationName}] Jump processed. Stopped at: ${navOutcome.frame.sourcePath}:${navOutcome.frame.line} (Targeted ${params.line})`,
			)
			if (navOutcome.frame.sourcePath === frame.sourcePath && Math.abs(navOutcome.frame.line - params.line) > 2) {
				outputChannel.appendLine(
					`[WARN][${operationName}] Stopped line ${navOutcome.frame.line} differs significantly from target ${params.line}.`,
				)
			}
		} else if (!navOutcome.success) {
			outputChannel.appendLine(
				`[ERROR][${operationName}] Jump command failed or session ended: ${navOutcome.errorMessage}`,
			)
		}
		return navOutcome
	} catch (error: any) {
		const frameIdForError = params.frameId ?? globalCurrentTopFrameId ?? "unknown"
		outputChannel.appendLine(
			`[ERROR][${operationName}] Error during jump to line ${params.line} in frame ${frameIdForError}: ${error.message}`,
		)
		const dapOutput = activeSession
			? getActiveSessionDapOutput(activeSession.id) || getLastSessionDapOutput(activeSession.id)
			: undefined
		const rawOutput = activeSession
			? rawTerminalOutputManager.getActiveSessionRawTerminalOutput(activeSession.id) ||
				rawTerminalOutputManager.getFinalizedSessionRawTerminalOutput(activeSession.id)
			: undefined
		let specificErrorMessage = `Failed to jump: ${error.message}`
		if (
			error.message?.includes("session has been terminated") ||
			error.message?.includes("No active debug session")
		) {
			specificErrorMessage = `Failed to jump: Debug session terminated unexpectedly.`
		} else if (error.message?.includes("not supported") || error.message?.includes("unknown request")) {
			specificErrorMessage = `Debugger does not support jumping execution ('goto' or 'gotoTargets' failed).`
		}
		return _buildNavigationResult(
			{
				success: false,
				errorMessage: specificErrorMessage,
				stopReason: "error",
				capturedDapOutput: dapOutput,
				capturedRawTerminalOutput: rawOutput,
			},
			operationName,
		)
	}
}
// Removed continueUntil stub as the logic is now implemented directly in VsCodeDebugController.ts
