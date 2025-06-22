import * as vscode from "vscode"
import {
	EvaluateParams,
	EvaluateResult,
	ExecuteStatementParams,
	WatchParams,
	UnwatchParams,
	GetReturnValueResult,
	DebuggerResponse,
} from "../IDebugController" // Adjust path as needed
import { outputChannel, stringifySafe } from "../vscodeUtils" // Use local outputChannel
import { currentTopFrameId as globalCurrentTopFrameId } from "../debug/events" // Import the global frame ID

/**
 * Evaluates an expression in the context of a specific stack frame.
 * Uses the DAP 'evaluate' request.
 * @param session The active debug session.
 * @param params Parameters specifying the frame, expression, and evaluation context.
 * @returns A promise resolving with the evaluation result.
 */
export async function evaluate(session: vscode.DebugSession, params: EvaluateParams): Promise<EvaluateResult> {
	try {
		const frameIdToUse = params.frameId ?? globalCurrentTopFrameId

		if (frameIdToUse === undefined) {
			const errorMessage =
				"Frame ID is required for evaluation, but none was provided and no current top frame ID is available."
			outputChannel.appendLine(`[ERROR] evaluate: ${errorMessage}`)
			return { success: false, errorMessage, result: "", variablesReference: 0 }
		}

		// DAP Request: evaluate
		const dapResponse = await session.customRequest("evaluate", {
			expression: params.expression,
			frameId: frameIdToUse,
			context: params.context ?? "repl", // Default context to 'repl' if not provided
		})

		// Check for successful evaluation (result might be empty string, but should exist)
		if (dapResponse === undefined || dapResponse === null || typeof dapResponse.result !== "string") {
			// Some debug adapters might return an error message within the response instead of throwing
			const errorMessage = dapResponse?.message || "Received invalid evaluation result from the debugger."
			outputChannel.appendLine(
				`[WARN] evaluate: Invalid response for expression "${params.expression}" in frame ${frameIdToUse}. Response: ${stringifySafe(dapResponse)}`,
			)
			return { success: false, errorMessage: errorMessage, result: "", variablesReference: 0 }
		}

		return {
			success: true,
			result: dapResponse.result,
			type: dapResponse.type, // Type might be undefined
			variablesReference: dapResponse.variablesReference ?? 0, // 0 indicates not expandable
		}
	} catch (error: any) {
		// DAP often throws an error for invalid expressions
		const frameIdForError = params.frameId ?? globalCurrentTopFrameId ?? "unknown"
		outputChannel.appendLine(
			`[ERROR] Error evaluating expression "${params.expression}" in frame ${frameIdForError}: ${error.message}`,
		)
		return {
			success: false,
			errorMessage: `Failed to evaluate expression: ${error.message}`,
			result: "",
			variablesReference: 0,
		}
	}
}

/**
 * Evaluates an expression, intended for pretty-printing by the caller.
 * Functionally identical to `evaluate`.
 * @param session The active debug session.
 * @param params Parameters specifying the frame, expression, and evaluation context.
 * @returns A promise resolving with the evaluation result.
 */
export async function prettyPrint(session: vscode.DebugSession, params: EvaluateParams): Promise<EvaluateResult> {
	// Simply delegate to the evaluate method
	return evaluate(session, params)
}

/**
 * Determines the type of an expression by evaluating it.
 * Delegates to `evaluate` and the caller can inspect the 'type' field of the result.
 * @param session The active debug session.
 * @param params Parameters specifying the frame and expression.
 * @returns A promise resolving with the evaluation result.
 */
export async function whatis(session: vscode.DebugSession, params: EvaluateParams): Promise<EvaluateResult> {
	// Simply delegate to the evaluate method
	return evaluate(session, params)
}

/**
 * Executes a statement in the context of a specific stack frame.
 * Uses the 'evaluate' request with 'repl' context.
 * @param session The active debug session.
 * @param params Parameters specifying the frame and statement to execute.
 * @returns A promise resolving with the result of the execution.
 */
export async function executeStatement(
	session: vscode.DebugSession,
	params: ExecuteStatementParams,
): Promise<EvaluateResult> {
	// Delegate to evaluate, ensuring the context is 'repl'
	// The evaluate function will handle the frameId logic (using globalCurrentTopFrameId if params.frameId is undefined)
	return evaluate(session, {
		frameId: params.frameId, // Pass it along; evaluate will use global if undefined
		expression: params.statement, // Use the statement as the expression
		context: "repl",
	})
}

/**
 * Acknowledges a request to watch an expression.
 * Actual watching logic (re-evaluation) is typically handled by the client.
 * @param session The active debug session.
 * @param params Parameters specifying the expression to watch.
 * @returns A promise resolving to a standard debugger response.
 */
export async function watch(_session: vscode.DebugSession, params: WatchParams): Promise<DebuggerResponse> {
	// No specific DAP action needed here, just acknowledge.
	// The frameId is optional, so we need to handle its potential undefined state for logging.
	const frameIdToLog = params.frameId ?? globalCurrentTopFrameId ?? "unknown (and no global default)"
	outputChannel.appendLine(`Watch requested for expression: "${params.expression}" in frame ${frameIdToLog}`)
	return { success: true }
}

/**
 * Acknowledges a request to unwatch an expression.
 * Actual watching logic is typically handled by the client.
 * @param session The active debug session.
 * @param params Parameters specifying the expression to unwatch.
 * @returns A promise resolving to a standard debugger response.
 */
export async function unwatch(session: vscode.DebugSession, params: UnwatchParams): Promise<DebuggerResponse> {
	// No specific DAP action needed here, just acknowledge.
	outputChannel.appendLine(`Unwatch requested for expression: "${params.expression}"`)
	return { success: true }
}

/**
 * Attempts to retrieve the return value of the most recently completed function call.
 * Note: Standard DAP support for this is limited and adapter-dependent.
 * @param _session The active debug session (currently unused).
 * @returns A promise resolving with the return value, if available.
 */
export async function getReturnValue(_session: vscode.DebugSession): Promise<GetReturnValueResult> {
	// There isn't a standard, universally supported DAP request for the last return value.
	// Some adapters might provide it in the 'variables' response for the returned frame,
	// or via custom events/requests.
	// For now, we return not supported.
	outputChannel.appendLine("[WARN] getReturnValue: Standard DAP support is limited; returning not supported.")
	return {
		success: false,
		errorMessage: "Getting the last return value is not reliably supported by the debugger adapter.",
	}
	// Potential future implementation might try specific adapter workarounds if needed.
}
