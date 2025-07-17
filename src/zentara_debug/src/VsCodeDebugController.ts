import * as vscode from "vscode"
import {
	IDebugController,
	LaunchParams,
	LaunchResult,
	DebuggerResponse,
	NavigationResult,
	JumpParams,
	UntilParams,
	SetBreakpointParams,
	SetBreakpointResult,
	RemoveBreakpointParams,
	ToggleBreakpointParams,
	IgnoreBreakpointParams,
	SetBreakpointConditionParams,
	GetActiveBreakpointsResult,
	StackTraceResult,
	ListSourceParams,
	ListSourceResult,
	GetSourceParams,
	GetSourceResult,
	GetStackFrameVariablesParams,
	GetStackFrameVariablesResult,
	EvaluateParams,
	EvaluateResult,
	ExecuteStatementParams,
	GotoFrameParams,
	GetLastStopInfoResult,
	SourceLocation,
	RemoveAllBreakpointsInFileParams,
} from "./IDebugController" // ESBuild handles this
import { launchSession, restartSession, quitSession, getActiveSession, ensureActiveSession } from "./controller/session" // ESBuild handles this
import { continueExecution, nextStep, stepIn, stepOut, jumpToLine } from "./controller/execution" // ESBuild handles this
import {
	lastKnownStopEventBody,
	lastKnownStopEventSessionId,
	updateCurrentTopFrameId,
	clearCurrentTopFrameId,
	currentTopFrameId as globalCurrentTopFrameId,
} from "./debug/events" // ESBuild handles this
import {
	setBreakpoint,
	removeAllBreakpointsInFile,
	getActiveBreakpoints,
	disableBreakpoint,
	enableBreakpoint,
	ignoreBreakpoint,
	setBreakpointCondition,
	setTempBreakpoint,
	removeBreakpointByLocation,
} from "./controller/breakpoints" // ESBuild handles this
import { stackTrace, getStackFrameVariables, listSource, up, down, getSource, gotoFrame } from "./controller/inspection" // ESBuild handles this
import { evaluate, prettyPrint, whatis, executeStatement } from "./controller/evaluation" // ESBuild handles this
import { debugEvents, DAP_STOPPED_EVENT } from "./debug/events" // ESBuild handles this

// Use the local outputChannel and stringifySafe from vscodeUtils
import { outputChannel, stringifySafe } from "./vscodeUtils"

// Concrete implementation using VS Code API
export class VsCodeDebugController implements IDebugController {
	// State to track temporary breakpoints
	private temporaryBreakpoints = new Set<string>() // Store locations as "path:line"

	// IV.B.2.a: Event emitter for captured debug output
	private readonly _onDidCaptureDebugOutput = new vscode.EventEmitter<{
		sessionId: string
		trigger: "stopEvent" | "sessionEnd"
		reason?: string
		dapOutput?: string
		rawTerminalOutput?: string
	}>()
	public get onDidCaptureDebugOutput(): vscode.Event<{
		sessionId: string
		trigger: "stopEvent" | "sessionEnd"
		reason?: string
		dapOutput?: string
		rawTerminalOutput?: string
	}> {
		return this._onDidCaptureDebugOutput.event
	}

	/**
	 * Public method to allow other components (like DapStopTracker or SessionManager)
	 * to trigger the onDidCaptureDebugOutput event.
	 */
	public notifyDebugOutputCaptured(payload: {
		sessionId: string
		trigger: "stopEvent" | "sessionEnd"
		reason?: string
		dapOutput?: string
		rawTerminalOutput?: string
	}): void {
		this._onDidCaptureDebugOutput.fire(payload)
	}

	constructor() {
		// Subscribe to DAP stop events to handle temporary breakpoint removal
		debugEvents.on(DAP_STOPPED_EVENT, this._handleDapStopEvent.bind(this))
		//outputChannel.appendLine("VsCodeDebugController: Subscribed to DAP_STOPPED_EVENT for temporary breakpoints.")
	}

	// --- Session Management ---

	async launch(params: LaunchParams): Promise<LaunchResult> {
		//outputChannel.appendLine(`[launch] Params: ${stringifySafe(params)}`)
		return launchSession(params)
	}

	async restart(): Promise<DebuggerResponse> {
		const session = getActiveSession()
		//outputChannel.appendLine(`[restart] Active session: ${session ? session.id : "None"}`)
		return restartSession()
	}

	async quit(): Promise<DebuggerResponse> {
		const session = getActiveSession()
		//outputChannel.appendLine(`[quit] Active session: ${session ? session.id : "None"}`)
		return quitSession(session)
	}

	// --- Execution Control ---

	async continue(): Promise<NavigationResult> {
		const session = ensureActiveSession("continue")
		//outputChannel.appendLine(`[continue] Active session: ${session ? session.id : "None"}`)
		return continueExecution(session)
	}

	async next(): Promise<NavigationResult> {
		const session = ensureActiveSession("step over")
		//outputChannel.appendLine(`[next] Active session: ${session ? session.id : "None"}`)
		return nextStep(session)
	}

	async stepIn(): Promise<NavigationResult> {
		const session = ensureActiveSession("step in")
		//outputChannel.appendLine(`[stepIn] Active session: ${session ? session.id : "None"}`)
		return stepIn(session)
	}

	async stepOut(): Promise<NavigationResult> {
		const session = ensureActiveSession("step out")
		//outputChannel.appendLine(`[stepOut] Active session: ${session ? session.id : "None"}`)
		return stepOut(session)
	}

	async jump(params: JumpParams): Promise<NavigationResult> {
		const session = ensureActiveSession("jump")
		//outputChannel.appendLine(`[jump] Params: ${stringifySafe(params)}, Session: ${session?.id}`)
		return jumpToLine(session, params)
	}

	async until(params: UntilParams): Promise<NavigationResult> {
		const operationName = "continue until"
		const session = ensureActiveSession(operationName)
		//outputChannel.appendLine(`[${operationName}] Params: ${stringifySafe(params)}, Session: ${session?.id}`)

		try {
			const traceResult = await this.stackTrace()
			if (!traceResult.success || traceResult.frames.length === 0) {
				outputChannel.appendLine(
					`[ERROR][${operationName}] Could not get current stack trace. ${traceResult.errorMessage || ""}`,
				)
				return {
					success: false,
					errorMessage: `Error ${operationName}: Could not get current stack trace. ${traceResult.errorMessage || ""}`,
				}
			}
			const currentFrame = traceResult.frames[0]
			if (!currentFrame.sourcePath) {
				outputChannel.appendLine(`[ERROR][${operationName}] Current stack frame has no source path.`)
				return {
					success: false,
					errorMessage: `Error ${operationName}: Current stack frame has no source path.`,
				}
			}

			const targetLocation: SourceLocation = {
				path: currentFrame.sourcePath,
				line: params.line,
			}

			outputChannel.appendLine(
				`[${operationName}] Setting temporary breakpoint at ${targetLocation.path}:${targetLocation.line}`,
			)
			const bpResult = await this.setTempBreakpoint({ location: targetLocation })

			if (!bpResult.success) {
				this.temporaryBreakpoints.delete(this._getLocationKey(targetLocation))
				outputChannel.appendLine(
					`[ERROR][${operationName}] Failed to set temporary breakpoint at ${targetLocation.path}:${targetLocation.line}. ${bpResult.errorMessage || ""}`,
				)
				return {
					success: false,
					errorMessage: `Error ${operationName}: Failed to set temporary breakpoint at ${targetLocation.path}:${targetLocation.line}. ${bpResult.errorMessage || ""}`,
				}
			}

			//outputChannel.appendLine(`[${operationName}] Temporary breakpoint set successfully.`)
			//outputChannel.appendLine(`[${operationName}] Continuing execution...`)
			const continueResult = await this.continue()

			if (!continueResult.success) {
				outputChannel.appendLine(
					`[WARN][${operationName}] Continue command failed after setting temp breakpoint: ${continueResult.errorMessage}`,
				)
			} else {
				outputChannel.appendLine(
					`[${operationName}] Continue completed. Final frame: ${continueResult.frame ? `${continueResult.frame.name}:${continueResult.frame.line}` : "N/A"}`,
				)
			}

			return continueResult
		} catch (error: any) {
			outputChannel.appendLine(`[ERROR] Error during ${operationName}: ${error.message} ${stringifySafe(error)}`)
			return { success: false, errorMessage: `Error ${operationName}: ${error.message}` }
		}
	}

	async setBreakpoint(params: SetBreakpointParams): Promise<SetBreakpointResult> {
		//outputChannel.appendLine(`[setBreakpoint] Params: ${stringifySafe(params)}`)
		return setBreakpoint(params)
	}

	async setTempBreakpoint(params: SetBreakpointParams): Promise<SetBreakpointResult> {
		outputChannel.appendLine(`[setTempBreakpoint] Params: ${stringifySafe(params)}`)
		const result = await setTempBreakpoint(params)
		if (result.success) {
			const locationKey = this._getLocationKey(params.location)
			this.temporaryBreakpoints.add(locationKey)
			//outputChannel.appendLine(`VsCodeDebugController: Registered temporary breakpoint at ${locationKey}`)
		}
		return result
	}

	async removeBreakpointByLocation(params: RemoveBreakpointParams): Promise<DebuggerResponse> {
		//outputChannel.appendLine(`[removeBreakpointByLocation] Params: ${stringifySafe(params)}`)
		return removeBreakpointByLocation(params)
	}

	async removeAllBreakpointsInFile(params: RemoveAllBreakpointsInFileParams): Promise<DebuggerResponse> {
		//outputChannel.appendLine(`[removeAllBreakpointsInFile] FilePath: ${params.filePath}`)
		return removeAllBreakpointsInFile({ location: { path: params.filePath } })
	}

	async disableBreakpoint(params: ToggleBreakpointParams): Promise<DebuggerResponse> {
		//outputChannel.appendLine(`[disableBreakpoint] Params: ${stringifySafe(params)}`)
		return disableBreakpoint(params)
	}

	async enableBreakpoint(params: ToggleBreakpointParams): Promise<DebuggerResponse> {
		//outputChannel.appendLine(`[enableBreakpoint] Params: ${stringifySafe(params)}`)
		return enableBreakpoint(params)
	}

	async ignoreBreakpoint(params: IgnoreBreakpointParams): Promise<DebuggerResponse> {
		//outputChannel.appendLine(`[ignoreBreakpoint] Params: ${stringifySafe(params)}`)
		return ignoreBreakpoint(params)
	}

	async setBreakpointCondition(params: SetBreakpointConditionParams): Promise<DebuggerResponse> {
		//outputChannel.appendLine(`[setBreakpointCondition] Params: ${stringifySafe(params)}`)
		return setBreakpointCondition(params)
	}

	async getActiveBreakpoints(
		waitForLocation?: { path: string; line: number },
		timeoutMs?: number,
	): Promise<GetActiveBreakpointsResult> {
		outputChannel.appendLine(
			`[getActiveBreakpoints] waitForLocation: ${stringifySafe(waitForLocation)}, timeoutMs: ${timeoutMs}`,
		)
		return getActiveBreakpoints(waitForLocation, timeoutMs)
	}

	async stackTrace(): Promise<StackTraceResult> {
		const session = ensureActiveSession("get stack trace")
		//outputChannel.appendLine(`[stackTrace] Session: ${session?.id}`)
		return stackTrace(session)
	}

	async listSource(params: ListSourceParams): Promise<ListSourceResult> {
		const session = ensureActiveSession("list source")
		//outputChannel.appendLine(`[listSource] Params: ${stringifySafe(params)}, Session: ${session?.id}`)
		return listSource(session, params)
	}

	async up(): Promise<DebuggerResponse> {
		const session = ensureActiveSession("move up stack")
		//outputChannel.appendLine(`[up] Session: ${session?.id}`)
		return up(session)
	}

	async down(): Promise<DebuggerResponse> {
		const session = ensureActiveSession("move down stack")
		//outputChannel.appendLine(`[down] Session: ${session?.id}`)
		return down(session)
	}

	async gotoFrame(params: GotoFrameParams): Promise<DebuggerResponse> {
		const session = ensureActiveSession("go to frame")
		//outputChannel.appendLine(`[gotoFrame] Params: ${stringifySafe(params)}, Session: ${session?.id}`)
		return gotoFrame(session, params)
	}

	async getSource(params: GetSourceParams): Promise<GetSourceResult> {
		const session = ensureActiveSession("get source")
		//outputChannel.appendLine(`[getSource] Params: ${stringifySafe(params)}, Session: ${session?.id}`)
		return getSource(session, params)
	}

	async getStackFrameVariables(params: GetStackFrameVariablesParams): Promise<GetStackFrameVariablesResult> {
		const session = ensureActiveSession("get stack frame variables")
		//outputChannel.appendLine(`[getStackFrameVariables] Params: ${stringifySafe(params)}, Session: ${session?.id}`)
		return getStackFrameVariables(session, params)
	}

	async getArgs(params: { frameId?: number }): Promise<GetStackFrameVariablesResult> {
		const operationName = "getArgs"
		const frameIdToUse = params.frameId ?? globalCurrentTopFrameId

		//outputChannel.appendLine(`[${operationName}] Effective Frame ID: ${frameIdToUse}, Original Params: ${stringifySafe(params)}`)

		if (frameIdToUse === undefined) {
			const errorMessage = `Error ${operationName}: Frame ID is required, but none was provided and no current top frame ID is available.`
			outputChannel.appendLine(`[ERROR][${operationName}] ${errorMessage}`)
			return { success: false, errorMessage, scopes: [] }
		}

		const allScopesResult = await this.getStackFrameVariables({ frameId: frameIdToUse })

		if (!allScopesResult.success || !allScopesResult.scopes) {
			return allScopesResult
		}

		const commonArgScopeNames = ["Arguments", "Args", "Parameters"]
		let argsScope = allScopesResult.scopes.find((s) => commonArgScopeNames.includes(s.name))

		if (!argsScope) {
			outputChannel.appendLine(`getArgs: Standard argument scope not found. Checking for 'Locals'...`)
			argsScope = allScopesResult.scopes.find((s) => s.name === "Locals")
			if (argsScope) {
				outputChannel.appendLine(`getArgs: Found arguments within 'Locals' scope.`)
			}
		}

		if (!argsScope) {
			const foundScopeNames = allScopesResult.scopes.map((s) => s.name).join(", ")
			const triedScopeNames = [...commonArgScopeNames, "Locals"]
			const errorMessage = `Could not find an arguments scope (tried: ${triedScopeNames.join(", ")}). Found scopes: [${foundScopeNames || "None"}]`
			outputChannel.appendLine(`[WARN][getArgs] ${errorMessage}`)
			return {
				success: false,
				errorMessage,
				scopes: [],
			}
		}
		return {
			success: true,
			scopes: [argsScope],
		}
	}

	async evaluate(params: EvaluateParams): Promise<EvaluateResult> {
		const session = ensureActiveSession("evaluate expression")
		//outputChannel.appendLine(`[evaluate] Params: ${stringifySafe(params)}, Session: ${session?.id}`)
		return evaluate(session, params)
	}

	async prettyPrint(params: EvaluateParams): Promise<EvaluateResult> {
		const session = ensureActiveSession("pretty print expression")
		//outputChannel.appendLine(`[prettyPrint] Params: ${stringifySafe(params)}, Session: ${session?.id}`)
		return prettyPrint(session, params)
	}

	async whatis(params: EvaluateParams): Promise<EvaluateResult> {
		const session = ensureActiveSession("get type of expression")
		//outputChannel.appendLine(`[whatis] Params: ${stringifySafe(params)}, Session: ${session?.id}`)
		return whatis(session, params)
	}

	async executeStatement(params: ExecuteStatementParams): Promise<EvaluateResult> {
		const session = ensureActiveSession("execute statement")
		//outputChannel.appendLine(`[executeStatement] Params: ${stringifySafe(params)}, Session: ${session?.id}`)
		return executeStatement(session, params)
	}

	async getLastStopInfo(): Promise<GetLastStopInfoResult> {
		const operationName = "get last stop info"
		//outputChannel.appendLine(`[${operationName}] Attempting to retrieve last known stop event body.`)

		const currentSession = getActiveSession()

		if (!lastKnownStopEventBody || !lastKnownStopEventSessionId) {
			outputChannel.appendLine(`[WARN][${operationName}] No last stop event body or session ID recorded.`)
			return { success: false, errorMessage: "No last stop event information has been recorded." }
		}

		if (!currentSession) {
			outputChannel.appendLine(
				`[WARN][${operationName}] No active debug session. Last stop info for session ${lastKnownStopEventSessionId} might be stale.`,
			)
			return {
				success: true,
				sessionId: lastKnownStopEventSessionId,
				stopInfo: lastKnownStopEventBody,
				errorMessage: "No active debug session; this stop info may be from a previous session.",
			}
		}

		if (currentSession.id === lastKnownStopEventSessionId) {
			outputChannel.appendLine(
				`[INFO][${operationName}] Found last stop event for current session ${currentSession.id}.`,
			)
			return {
				success: true,
				sessionId: lastKnownStopEventSessionId,
				stopInfo: lastKnownStopEventBody,
			}
		} else {
			const errorMessage = `Last recorded stop event (for session ${lastKnownStopEventSessionId}) does not match the current active session (${currentSession.id}).`
			outputChannel.appendLine(`[WARN][${operationName}] ${errorMessage}`)
			return {
				success: false,
				errorMessage,
			}
		}
	}

	private _getLocationKey(location: SourceLocation): string {
		try {
			return `${vscode.Uri.file(location.path).toString()}:${location.line}`
		} catch (e: any) {
			outputChannel.appendLine(`[ERROR] Error creating location key for path: ${location.path}: ${e.message}`)
			return `${location.path}:${location.line}`
		}
	}

	private async _handleDapStopEvent(eventData: { sessionId: string; body: any }): Promise<void> {
		const activeSession = getActiveSession()

/* 		if (!activeSession || activeSession.id !== eventData.sessionId) {
			clearCurrentTopFrameId() // Clear if session is not active or doesn't match
			return
		} */

		//outputChannel.appendLine(
		//	`VsCodeDebugController: Handling DAP stop event for session ${eventData.sessionId}. Reason: ${eventData.body?.reason}`,
		//)

		const framesResult = await stackTrace(activeSession)
		if (!framesResult.success || !framesResult.frames.length) {
			outputChannel.appendLine(
				`VsCodeDebugController: Could not get stack frames for stop event. Clearing top frame ID.`,
			)
			clearCurrentTopFrameId()
			return
		}

		const topFrame = framesResult.frames[0]
		// Ensure topFrame and its id are valid before updating
		if (topFrame && typeof topFrame.id === "number") {
			updateCurrentTopFrameId(topFrame.id)
			outputChannel.appendLine(`VsCodeDebugController: Updated currentTopFrameId to ${topFrame.id}`)
		} else {
			outputChannel.appendLine(
				`VsCodeDebugController: Top frame or top frame ID is invalid. Clearing top frame ID.`,
			)
			clearCurrentTopFrameId()
			// We might still proceed if only sourcePath is missing but ID was set,
			// but for temporary breakpoint removal, sourcePath is crucial.
		}

		// Temporary breakpoint removal logic (requires sourcePath)
		if (eventData.body?.reason === "breakpoint" && this.temporaryBreakpoints.size > 0) {
			if (!topFrame.sourcePath) {
				outputChannel.appendLine(
					`VsCodeDebugController: Top stack frame has no source path, cannot process temporary breakpoint removal.`,
				)
				return // Cannot proceed with temp bp logic without source path
			}

			const locationKey = this._getLocationKey({
				path: topFrame.sourcePath,
				line: topFrame.line,
			})

			if (this.temporaryBreakpoints.has(locationKey)) {
				//outputChannel.appendLine(`VsCodeDebugController: Removing temporary breakpoint at ${locationKey}`)
				await removeBreakpointByLocation({
					location: {
						path: topFrame.sourcePath,
						line: topFrame.line,
					},
				})
				this.temporaryBreakpoints.delete(locationKey)
			}
		}
	}

	public dispose(): void {
		//outputChannel.appendLine("VsCodeDebugController: Disposing...")
		this._onDidCaptureDebugOutput.dispose()
		// Remove event listener for DAP_STOPPED_EVENT to prevent memory leaks
		debugEvents.removeListener(DAP_STOPPED_EVENT, this._handleDapStopEvent)
		outputChannel.appendLine("VsCodeDebugController: Disposed.")
	}
}

/**
 * Singleton instance of the VsCodeDebugController.
 */
export const vsCodeDebugController = new VsCodeDebugController()
