import * as vscode from "vscode"
import {
	StackTraceResult,
	StackFrameInfo,
	ListSourceParams,
	ListSourceResult,
	GetStackFrameVariablesParams,
	GetStackFrameVariablesResult,
	VariableInfo,
	DebuggerResponse,
	GetSourceParams,
	GetSourceResult,
	GotoFrameParams, // Import GotoFrameParams
} from "../IDebugController" // Adjust path as needed
import { outputChannel } from "../vscodeUtils" // Use local outputChannel
import { currentTopFrameId as globalCurrentTopFrameId } from "../debug/events" // Import the global frame ID
// fs/promises is not needed if we use vscode.workspace.fs
// import * as fs from 'fs/promises';

// Define different timeouts for different types of operations
const DEFAULT_DAP_REQUEST_TIMEOUT_MS = 30000 // 30 seconds default timeout
const VARIABLES_REQUEST_TIMEOUT_MS = 45000 // 45 seconds for variable requests (potentially large data)
const STACK_TRACE_TIMEOUT_MS = 20000 // 20 seconds for stack trace requests
// const STEP_REQUEST_TIMEOUT_MS = 15000;        // Unused constant

/**
 * Wraps a DAP customRequest with a timeout.
 * @param session The debug session.
 * @param request The DAP request type.
 * @param args The arguments for the DAP request.
 * @param timeoutMs The timeout in milliseconds.
 * @returns A promise that resolves with the DAP response or rejects on timeout/error.
 */
/**
 * Wraps a DAP customRequest with a timeout and retry logic.
 * @param session The debug session.
 * @param request The DAP request type.
 * @param args The arguments for the DAP request.
 * @param timeoutMs The timeout in milliseconds.
 * @param maxRetries Maximum number of retry attempts for timeouts.
 * @returns A promise that resolves with the DAP response or rejects on timeout/error.
 */
async function customRequestWithTimeout(
	session: vscode.DebugSession,
	request: string,
	args?: any,
	timeoutMs: number = DEFAULT_DAP_REQUEST_TIMEOUT_MS,
	maxRetries: number = 2,
): Promise<any> {
	let lastError: Error | null = null

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			//outputChannel.appendLine(`[customRequestWithTimeout] Sending DAP request '${request}'${attempt > 0 ? ` (retry ${attempt}/${maxRetries})` : ''}`);

			const result = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error(`DAP request '${request}' timed out after ${timeoutMs}ms`))
				}, timeoutMs)

				Promise.resolve(session.customRequest(request, args))
					.then((response) => {
						clearTimeout(timeoutId)
						resolve(response)
					})
					.catch((error: any) => {
						clearTimeout(timeoutId)
						reject(error)
					})
			})

			//outputChannel.appendLine(`[customRequestWithTimeout] DAP request '${request}' completed successfully`);
			return result
		} catch (error: any) {
			lastError = error
			const isTimeout = error.message.includes("timed out")

			if (isTimeout && attempt < maxRetries) {
				outputChannel.appendLine(
					`[WARN] DAP request '${request}' timed out after ${timeoutMs}ms, retrying (${attempt + 1}/${maxRetries})...`,
				)
				// Increase timeout for next retry to give it more time
				timeoutMs = Math.floor(timeoutMs * 1.5)
				continue
			}

			// Either not a timeout or we've exhausted retries
			outputChannel.appendLine(`[ERROR] DAP request '${request}' failed: ${error.message}`)
			throw error
		}
	}

	// This should never be reached due to the throw in the catch block,
	// but TypeScript needs this for type safety
	throw lastError || new Error(`Unknown error in customRequestWithTimeout for '${request}'`)
}

/**
 * Retrieves the current call stack trace for the primary thread of a debug session.
 * Uses DAP 'threads' and 'stackTrace' requests.
 * @param session The active debug session.
 * @returns A promise resolving with the stack trace result.
 */
export async function stackTrace(session: vscode.DebugSession): Promise<StackTraceResult> {
	try {
		// DAP Request: threads
		const threadsResponse = await customRequestWithTimeout(session, "threads")
		if (!threadsResponse?.threads?.length) {
			// This might happen if the program is not paused or has terminated unexpectedly.
			outputChannel.appendLine("[WARN] stackTrace: No active threads found.")
			// Return success: false with an empty frames array and the errorMessage.
			return { success: false, errorMessage: "No active threads found to retrieve stack trace.", frames: [] }
		}
		// Assume the first thread is the primary one for now.
		// TODO: Consider allowing thread selection via IDebugController interface?
		const threadId = threadsResponse.threads[0].id

		// DAP Request: stackTrace
		// Requesting a reasonable number of levels. Could be parameterized later.
		const dapResponse = await customRequestWithTimeout(
			session,
			"stackTrace",
			{ threadId: threadId, startFrame: 0, levels: 20 },
			STACK_TRACE_TIMEOUT_MS,
		)

		if (!dapResponse?.stackFrames) {
			// Handle cases where the response is malformed or empty unexpectedly
			outputChannel.appendLine("[WARN] stackTrace: Invalid or empty stackFrames received from DAP request.")
			// Return success: false with an empty frames array and the errorMessage.
			return { success: false, errorMessage: "Received invalid stack trace data from the debugger.", frames: [] }
		}

		// Map DAP StackFrame[] to our StackFrameInfo[]
		// Note: DAP frame fields might vary slightly between debug adapters.
		const frames: StackFrameInfo[] = dapResponse.stackFrames.map((frame: any) => ({
			// Using 'any' for DAP frame type flexibility
			id: frame.id,
			name: frame.name || "<unknown>", // Provide default for missing names
			// Ensure sourcePath is always a string, even if undefined in DAP response
			sourcePath: frame.source?.path ?? "",
			sourceName: frame.source?.name || frame.source?.path?.split(/[\\/]/).pop() || "<unknown>", // Use filename as fallback name, handle windows/unix paths
			line: frame.line ?? 0, // Default to 0 if line is missing
			column: frame.column ?? 0, // Default to 0 if column is missing
		}))

		// Add totalFrames if available in the response
		const totalFrames = dapResponse.totalFrames

		return { success: true, frames: frames, totalFrames: totalFrames }
	} catch (error: any) {
		outputChannel.appendLine(`[ERROR] Error getting stack trace: ${error.message}`)
		// Return success: false with an empty frames array and the errorMessage.
		return { success: false, errorMessage: `Failed to retrieve stack trace: ${error.message}`, frames: [] }
	}
}

/**
 * Retrieves scopes and variables for a specific stack frame.
 * Uses DAP 'scopes' and 'variables' requests.
 * @param session The active debug session.
 * @param params Parameters specifying the frame ID and optional scope filters.
 * @returns A promise resolving with the scopes and their variables.
 */
export async function getStackFrameVariables(
	session: vscode.DebugSession,
	params: GetStackFrameVariablesParams,
): Promise<GetStackFrameVariablesResult> {
	try {
		outputChannel.appendLine(
			`[GETSTACKFRAMEVARIABLES] getStackFrameVariables called with params: ${JSON.stringify(params)}`,
		)
		outputChannel.appendLine(`[GETSTACKFRAMEVARIABLES] Current top frame ID: ${globalCurrentTopFrameId}`)
		const frameIdToUse = params.frameId ?? globalCurrentTopFrameId
		if (frameIdToUse === undefined) {
			const errorMessage =
				"Frame ID is required for getStackFrameVariables, but none was provided and no current top frame ID is available."
			outputChannel.appendLine(`[ERROR] getStackFrameVariables: ${errorMessage}`)
			return { success: false, errorMessage, scopes: [] }
		}
		outputChannel.appendLine(`[GETSTACKFRAMEVARIABLES] Using frame ID: ${frameIdToUse}`)

		// DAP Request: scopes
		const scopesResponse = await customRequestWithTimeout(
			session,
			"scopes",
			{ frameId: frameIdToUse },
			VARIABLES_REQUEST_TIMEOUT_MS,
		)
		if (!scopesResponse?.scopes) {
			outputChannel.appendLine(
				"[WARN] getStackFrameVariables: Invalid or empty scopes received from DAP request.",
			)
			return { success: false, errorMessage: "Received invalid scope data from the debugger.", scopes: [] }
		}

		const resultScopes: { name: string; variables: VariableInfo[] }[] = []

		// Filter scopes if requested
		const scopesToFetch = params.scopeFilter
			? scopesResponse.scopes.filter((scope: any) => params.scopeFilter!.includes(scope.name))
			: scopesResponse.scopes

		// DAP Request: variables (for each scope)
		for (const scope of scopesToFetch) {
			// Skip scopes that don't have variables (variablesReference === 0)
			if (scope.variablesReference === 0) {
				resultScopes.push({ name: scope.name, variables: [] })
				continue
			}

			const variablesResponse = await customRequestWithTimeout(
				session,
				"variables",
				{ variablesReference: scope.variablesReference },
				VARIABLES_REQUEST_TIMEOUT_MS,
			)
			if (!variablesResponse?.variables) {
				outputChannel.appendLine(
					`[WARN] getStackFrameVariables: Invalid or empty variables received for scope '${scope.name}' (ref: ${scope.variablesReference}).`,
				)
				// Add scope with empty variables instead of failing entirely
				resultScopes.push({ name: scope.name, variables: [] })
				continue // Continue to the next scope
			}

			// Map DAP Variable[] to our VariableInfo[] and filter out unnamed return values
			const variables: VariableInfo[] = variablesResponse.variables
				.map((variable: any) => ({
					name: variable.name,
					value: variable.value ?? "<unavailable>", // Provide default
					type: variable.type,
					variablesReference: variable.variablesReference ?? 0, // 0 indicates not expandable
				}))
				.filter((variable: VariableInfo) => !variable.name.startsWith("(return) ")) // Filter applied here

			resultScopes.push({ name: scope.name, variables: variables })
		}

		return { success: true, scopes: resultScopes }
	} catch (error: any) {
		const frameIdForError = params.frameId ?? globalCurrentTopFrameId ?? "unknown"
		outputChannel.appendLine(
			`[ERROR] Error getting stack frame variables for frame ${frameIdForError}: ${error.message}`,
		)
		return { success: false, errorMessage: `Failed to retrieve variables: ${error.message}`, scopes: [] }
	}
}

/**
 * Retrieves source code context around the current execution point in a specific frame.
 * @param session The active debug session.
 * @param params Parameters specifying the frame ID and desired context size.
 * @returns A promise resolving with the source code snippet.
 */
export async function listSource(session: vscode.DebugSession, params: ListSourceParams): Promise<ListSourceResult> {
	try {
		const frameIdToUse = params.frameId ?? globalCurrentTopFrameId
		if (frameIdToUse === undefined) {
			const errorMessage =
				"Frame ID is required for listSource, but none was provided and no current top frame ID is available."
			outputChannel.appendLine(`[ERROR] listSource: ${errorMessage}`)
			return { success: false, errorMessage }
		}

		// First, get the stack trace to find the frame
		const traceResult = await stackTrace(session)
		if (!traceResult.success || !traceResult.frames) {
			return {
				success: false,
				errorMessage: traceResult.errorMessage || "Failed to get stack trace to list source.",
			}
		}

		const frame = traceResult.frames.find((f) => f.id === frameIdToUse)
		if (!frame) {
			return { success: false, errorMessage: `Frame ID ${frameIdToUse} not found in stack trace.` }
		}

		if (!frame.sourcePath || frame.line <= 0) {
			return {
				success: false,
				errorMessage: `Frame ${frameIdToUse} does not have a valid source path or line number.`,
			}
		}

		// Read the source file content
		let fileContent: string
		try {
			// Use vscode.workspace.fs for potentially virtual file systems
			let fileUri: vscode.Uri
			if (frame.sourcePath.includes("://")) {
				fileUri = vscode.Uri.parse(frame.sourcePath)
			} else {
				fileUri = vscode.Uri.file(frame.sourcePath)
			}
			const fileBytes = await vscode.workspace.fs.readFile(fileUri)
			fileContent = Buffer.from(fileBytes).toString("utf-8")
		} catch (readError: any) {
			outputChannel.appendLine(`[ERROR] Error reading source file ${frame.sourcePath}: ${readError.message}`)
			return { success: false, errorMessage: `Could not read source file: ${frame.sourcePath}` }
		}

		const lines = fileContent.split(/\r?\n/)
		const linesAround = params.linesAround ?? 5 // Default context lines
		const currentLineIndex = frame.line - 1 // frame.line is 1-based

		const startLine = Math.max(0, currentLineIndex - linesAround)
		const endLine = Math.min(lines.length, currentLineIndex + linesAround + 1)

		let sourceCode = ""
		for (let i = startLine; i < endLine; i++) {
			const lineNum = i + 1
			const prefix = i === currentLineIndex ? "-> " : "   "
			sourceCode += `${prefix}${lineNum.toString().padStart(4)}: ${lines[i]}\n`
		}

		return { success: true, sourceCode: sourceCode, currentLine: frame.line }
	} catch (error: any) {
		const frameIdForError = params.frameId ?? globalCurrentTopFrameId ?? "unknown"
		outputChannel.appendLine(`[ERROR] Error listing source for frame ${frameIdForError}: ${error.message}`)
		return { success: false, errorMessage: `Failed to list source: ${error.message}` }
	}
}

/**
 * Moves the debugger's focus up one level in the call stack (conceptual).
 * In this implementation, it simply returns success, assuming the client manages the active frame index.
 * @param _session The active debug session (currently unused).
 * @returns A promise resolving to a standard debugger response.
 */
export async function up(_session: vscode.DebugSession): Promise<DebuggerResponse> {
	// No DAP request needed here as frame selection is managed client-side based on stackTrace result.
	// We just acknowledge the request.
	return { success: true }
}

/**
 * Moves the debugger's focus down one level in the call stack (conceptual).
 * In this implementation, it simply returns success, assuming the client manages the active frame index.
 * @param _session The active debug session (currently unused).
 * @returns A promise resolving to a standard debugger response.
 */
export async function down(_session: vscode.DebugSession): Promise<DebuggerResponse> {
	// No DAP request needed here as frame selection is managed client-side based on stackTrace result.
	// We just acknowledge the request.
	return { success: true }
}

/**
 * Attempts to find the source code definition location for a given object/expression via DAP 'gotoTargets'.
 * @param session The active debug session.
 * @param params Parameters specifying the frame and expression.
 * @returns A promise resolving with the source location if found.
 */
export async function getSource(session: vscode.DebugSession, params: GetSourceParams): Promise<GetSourceResult> {
	try {
		const frameIdToUse = params.frameId ?? globalCurrentTopFrameId
		if (frameIdToUse === undefined) {
			const errorMessage =
				"Frame ID is required for getSource, but none was provided and no current top frame ID is available."
			outputChannel.appendLine(`[ERROR] getSource: ${errorMessage}`)
			return { success: false, errorMessage }
		}

		// Find the frame to get context
		const traceResult = await stackTrace(session)
		if (!traceResult.success || !traceResult.frames) {
			return {
				success: false,
				errorMessage: traceResult.errorMessage || "Failed to get stack trace to find source.",
			}
		}
		const frame = traceResult.frames.find((f) => f.id === frameIdToUse)
		if (!frame) {
			return { success: false, errorMessage: `Frame ID ${frameIdToUse} not found in stack trace.` }
		}
		if (!frame.sourcePath || frame.line <= 0) {
			return {
				success: false,
				errorMessage: `Frame ${frameIdToUse} does not have a valid source path or line number.`,
			}
		}

		// DAP Request: gotoTargets
		const dapArgs = {
			source: { path: frame.sourcePath },
			line: frame.line, // Current line in the frame
			column: frame.column, // Current column in the frame
			expression: params.expression,
		}

		// Note: gotoTargets is not a standard DAP request. Some adapters might support it as custom.
		// A more standard approach might be 'evaluate' with context 'variables' or similar,
		// then trying to find a source reference, but let's try a custom request first.
		// If this fails, we might need to use 'evaluate'.
		// UPDATE: Checking DAP spec, 'gotoTargets' IS standard. It's used for "Go to Definition".

		const dapResponse = await customRequestWithTimeout(session, "gotoTargets", dapArgs)

		if (!dapResponse?.targets?.length) {
			outputChannel.appendLine(
				`[WARN] getSource: No goto targets found for expression "${params.expression}" in frame ${frameIdToUse}.`,
			)
			return { success: false, errorMessage: `Could not find definition for "${params.expression}".` }
		}

		// Use the first target found
		const target = dapResponse.targets[0]
		if (!target.source?.path || target.line === undefined) {
			outputChannel.appendLine(
				`[WARN] getSource: Invalid target received from gotoTargets request: ${JSON.stringify(target)}`,
			)
			return { success: false, errorMessage: "Received invalid definition location data." }
		}

		return {
			success: true,
			sourcePath: target.source.path,
			line: target.line, // DAP line is 1-based
		}
	} catch (error: any) {
		const frameIdForError = params.frameId ?? globalCurrentTopFrameId ?? "unknown"
		outputChannel.appendLine(
			`[ERROR] Error getting source for expression "${params.expression}" in frame ${frameIdForError}: ${error.message}`,
		)
		// Check if the error indicates the request is not supported
		if (error.message?.includes("not supported") || error.message?.includes("unknown request")) {
			return {
				success: false,
				errorMessage: `Debugger does not support finding source for expression ('gotoTargets' failed).`,
			}
		}
		return { success: false, errorMessage: `Failed to get source definition: ${error.message}` }
	}
}

/**
 * Moves the debugger's focus to a specific frame ID (conceptual).
 * In this implementation, it simply returns success, assuming the client manages the active frame index.
 * @param session The active debug session.
 * @param params Parameters specifying the target frame ID.
 * @returns A promise resolving to a standard debugger response.
 */
export async function gotoFrame(session: vscode.DebugSession, params: GotoFrameParams): Promise<DebuggerResponse> {
	// No DAP request needed here as frame selection is managed client-side based on stackTrace result.
	// We just acknowledge the request and verify the frame exists conceptually.
	try {
		const frameIdToUse = params.frameId ?? globalCurrentTopFrameId
		if (frameIdToUse === undefined) {
			const errorMessage =
				"Frame ID is required for gotoFrame, but none was provided and no current top frame ID is available."
			outputChannel.appendLine(`[ERROR] gotoFrame: ${errorMessage}`)
			return { success: false, errorMessage }
		}

		const traceResult = await stackTrace(session)
		if (!traceResult.success || !traceResult.frames) {
			return {
				success: false,
				errorMessage: traceResult.errorMessage || "Failed to get stack trace to validate frame ID.",
			}
		}
		const frameExists = traceResult.frames.some((f) => f.id === frameIdToUse)
		if (!frameExists) {
			return { success: false, errorMessage: `Frame ID ${frameIdToUse} not found in current stack trace.` }
		}
		outputChannel.appendLine(
			`gotoFrame: Conceptually moving focus to frame ${frameIdToUse}. Client should use this ID for subsequent requests.`,
		)
		return { success: true }
	} catch (error: any) {
		const frameIdForError = params.frameId ?? globalCurrentTopFrameId ?? "unknown"
		outputChannel.appendLine(
			`[ERROR] Error during gotoFrame validation for frame ${frameIdForError}: ${error.message}`,
		)
		return { success: false, errorMessage: `Failed during gotoFrame validation: ${error.message}` }
	}
}
