import * as vscode from "vscode"
import {
    debugEvents,
    DAP_STOPPED_EVENT,
    updateLastKnownStopEvent,
    appendActiveSessionDapOutput,
    getActiveSessionDapOutput,      // Added for IV.A.1
    clearActiveSessionDapOutputBuffer // Added for IV.A.1
} from "./events"
import { outputChannel } from "../vscodeUtils" // Use local outputChannel
// TODO: Refactor to avoid direct import if possible, or pass instance through factory/constructor
import { rawTerminalOutputManager } from "../controller/session" // Added for IV.A.1
import { json } from "stream/consumers"


/**
 * Tracks DAP messages for a specific debug session and emits an internal
 * event when a DAP 'stopped' event is detected.
 */
export class DapStopTracker implements vscode.DebugAdapterTracker {
	private sessionId: string

	constructor(private session: vscode.DebugSession) {
		this.sessionId = session.id
		outputChannel.appendLine(`[DapStopTracker] Created for session ${this.sessionId}`)
	}

	/**
	 * Called when a DAP message is sent from the debug adapter to VS Code.
	 * We listen here for the 'stopped' event.
	 * @param message The DAP message.
	 */
	async onDidSendMessage(message: any): Promise<void> {
		// Make async
		// Log all DAP messages from debug adapter to VS Code
		outputChannel.appendLine(`[DapStopTracker ${new Date().toISOString()}] [RECEIVED from DA] Session ${this.sessionId}:`);
		outputChannel.appendLine(JSON.stringify(message, null, 2));
		outputChannel.appendLine('-------------------');

		// Handle 'output' events for DAP console capture
		if (message.type === "event" && message.event === "output") {
			if (message.body && typeof message.body.output === 'string') {
				// The actual output string. It might include a newline.
				const outputLine = message.body.output;
				// const category = message.body.category || 'unknown'; // e.g., 'stdout', 'stderr', 'console'
				appendActiveSessionDapOutput(this.sessionId, outputLine);
				// Verbose logging, can be commented out
				// outputChannel.appendLine(`[DapStopTracker] Captured DAP output for session ${this.sessionId}, category ${category}: "${outputLine.trim()}"`);
			}
		}
		// Handle 'stopped' events
		else if (message.type === "event" && message.event === "stopped") {
			const eventBody = message.body || {} // Ensure body exists
			outputChannel.appendLine(
				`[DapStopTracker] DAP 'stopped' event received for session ${this.sessionId}. Reason: ${eventBody.reason}`,
			)

			// If stopped due to exception, try to get more details
			if (eventBody.reason === "exception" && eventBody.threadId !== undefined) {
				try {
					outputChannel.appendLine(
						`[DapStopTracker] Exception stop detected. Requesting exceptionInfo for thread ${eventBody.threadId}...`,
					)
					// Use the session associated with this tracker instance
					const exceptionInfoResponse = await this.session.customRequest("exceptionInfo", {
						threadId: eventBody.threadId,
					})
					outputChannel.appendLine(`[DapStopTracker] Received exceptionInfo response.`)
					// Attach the details to the event body we emit
					eventBody.exceptionInfoDetails = exceptionInfoResponse
				} catch (error: any) {
					outputChannel.appendLine(
						`[WARN][DapStopTracker] Failed to get exceptionInfo for thread ${eventBody.threadId}: ${error.message}`,
					)
					eventBody.exceptionInfoError = error.message || String(error) // Attach error info instead
				}
			}

			// --- Augment eventBody with captured output ---
			const dapOutputChunk = getActiveSessionDapOutput(this.sessionId);
			let rawTerminalOutputChunk = rawTerminalOutputManager.getActiveSessionRawTerminalOutput(this.sessionId);

			// If raw terminal output is initially empty, poll briefly
			if (!rawTerminalOutputChunk) {
			    outputChannel.appendLine(`[DapStopTracker] Initial raw terminal output empty for session ${this.sessionId}. Starting poll...`);
			    for (let i = 0; i < 5; i++) { // Poll up to 5 times
			        await new Promise(resolve => setTimeout(resolve, 30)); // 30ms interval
			        rawTerminalOutputChunk = rawTerminalOutputManager.getActiveSessionRawTerminalOutput(this.sessionId);
			        if (rawTerminalOutputChunk) {
			            outputChannel.appendLine(`[DapStopTracker] Raw terminal output captured after poll attempt ${i + 1}.`);
			            break;
			        }
			    }
			    if (!rawTerminalOutputChunk) {
			        outputChannel.appendLine(`[DapStopTracker] Raw terminal output still empty after polling for session ${this.sessionId}.`);
			    }
			}

			if (dapOutputChunk) {
				eventBody.capturedDapOutput = dapOutputChunk;
				outputChannel.appendLine(`[DapStopTracker] Added capturedDapOutput to eventBody for session ${this.sessionId}.`);
			}
			if (rawTerminalOutputChunk) {
				eventBody.capturedRawTerminalOutput = rawTerminalOutputChunk;
				outputChannel.appendLine(`[DapStopTracker] Added capturedRawTerminalOutput to eventBody for session ${this.sessionId}.`);
			}

			// Clear active buffers after their content has been added to eventBody
			if (dapOutputChunk || rawTerminalOutputChunk) {
				clearActiveSessionDapOutputBuffer(this.sessionId);
				rawTerminalOutputManager.clearActiveSessionRawTerminalOutput(this.sessionId);
				outputChannel.appendLine(`[DapStopTracker] Cleared active DAP and Raw Terminal output buffers for session ${this.sessionId} after adding to eventBody.`);
			}
			// --- End output augmentation ---

			// Update the globally tracked last stop event with the fully augmented body
			updateLastKnownStopEvent(this.sessionId, eventBody)
			outputChannel.appendLine(`[DapStopTracker] Updated lastKnownStopEventBody (with captured output) for session ${this.sessionId}.`)

			// Emit the internal event with session ID and the (now fully augmented) event body
			outputChannel.appendLine(`[DapStopTracker] Emitting internal DAP_STOPPED_EVENT.`)
			debugEvents.emit(DAP_STOPPED_EVENT, {
				sessionId: this.sessionId,
				body: eventBody, // Contains reason, threadId, and potentially exceptionInfoDetails/exceptionInfoError
			})
		}
	}

	/**
	 * Called before a DAP message is sent from VS Code to the debug adapter.
	 * (Not needed for stop detection)
	 * @param _message The DAP message (currently unused).
	 */
	onWillReceiveMessage?(message: any): void {
		// Log all DAP messages from VS Code to debug adapter
		outputChannel.appendLine(
			`[DapStopTracker ${new Date().toISOString()}] [SENDING to DA] Session ${this.sessionId}:`,
		)
		if (message && message.command) {
			outputChannel.appendLine(message.command);
			outputChannel.appendLine(JSON.stringify(message, null, 2));
		}
		outputChannel.appendLine("-------------------")
	}

	/**
	 * Called when the debug adapter encounters an error.
	 * @param error The error object.
	 */
	onError(error: Error): void {
		outputChannel.appendLine(
			`[DapStopTracker] Error in debug adapter for session ${this.sessionId}: ${error.message}`,
		)
	}

	/**
	 * Called when the debug adapter process exits.
	 * @param code Optional exit code.
	 * @param signal Optional signal name.
	 */
	onExit(code: number | undefined, signal: string | undefined): void {
		outputChannel.appendLine(
			`[DapStopTracker] Debug adapter exited for session ${this.sessionId}. Code: ${code}, Signal: ${signal}`,
		)
		// Note: Session termination is handled separately by onDidTerminateDebugSession listener in waitForDapStop
	}
}

/**
 * Factory for creating DapStopTracker instances for new debug sessions.
 */
export class DapStopTrackerFactory implements vscode.DebugAdapterTrackerFactory {
	/**
	 * Creates a new tracker for the given debug session.
	 * @param session The debug session.
	 * @returns A new DapStopTracker instance.
	 */
	createDebugAdapterTracker(session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterTracker> {
		outputChannel.appendLine(
			`[DapStopTrackerFactory] Creating tracker for session ${session.id} (Type: ${session.type})`,
		)
		return new DapStopTracker(session)
	}
}
