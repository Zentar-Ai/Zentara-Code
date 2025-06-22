import { EventEmitter } from "events"
import { outputChannel } from "../vscodeUtils"

/**
 * Shared event emitter for internal debug-related events,
 * particularly for communication between the DebugAdapterTracker and waiting functions.
 */
export const debugEvents = new EventEmitter()

// Add logging for DAP_STOPPED_EVENT emission
const originalEmit = debugEvents.emit
debugEvents.emit = function (event: string, ...args: any[]): boolean {
	if (event === DAP_STOPPED_EVENT) {
		const [eventData] = args
		outputChannel.appendLine(
			`[Debug Events ${new Date().toISOString()}] Emitting ${event} for session ${eventData.sessionId}. Stop reason: ${eventData.body?.reason}. Event body: ${JSON.stringify(eventData.body, null, 2)}`,
		)
	}
	return originalEmit.apply(this, [event, ...args])
}

/**
 * Event name emitted when a DAP 'stopped' event is detected by the tracker.
 * The event data should include { sessionId: string, body: any }
 */
export const DAP_STOPPED_EVENT = "dapStopped"

/**
 * Stores the body of the last DAP 'stopped' event received across any session.
 * This can be used to retrieve information about the last stop point,
 * especially if a command like 'continue' times out.
 */
export let lastKnownStopEventBody: any | undefined = undefined

/**
 * Stores the session ID associated with the lastKnownStopEventBody.
 */
export let lastKnownStopEventSessionId: string | undefined = undefined

/**
 * Stores the ID of the top-most stack frame from the last DAP 'stopped' event.
 */
export let currentTopFrameId: number | undefined = undefined

/**
 * Updates the last known stop event details.
 * @param sessionId The ID of the session that stopped.
 * @param body The body of the DAP 'stopped' event.
 */
export function updateLastKnownStopEvent(sessionId: string, body: any): void {
	outputChannel.appendLine(
		`[Debug Events ${new Date().toISOString()}] Updating last known stop event for session ${sessionId}. Previous session: ${lastKnownStopEventSessionId}. Stop reason: ${body?.reason}. Body: ${JSON.stringify(body, null, 2)}`,
	)
	lastKnownStopEventBody = body
	lastKnownStopEventSessionId = sessionId
}

/**
 * Clears the last known stop event details, typically on session termination.
 */
export function clearLastKnownStopEvent(): void {
	const previous = lastKnownStopEventSessionId
	outputChannel.appendLine(
		`[Debug Events ${new Date().toISOString()}] Clearing last known stop event. Previous session: ${previous}`,
	)
	lastKnownStopEventBody = undefined
	lastKnownStopEventSessionId = undefined
}

/**
 * Updates the current top frame ID.
 * @param frameId The ID of the top stack frame, or undefined to clear it.
 */
export function updateCurrentTopFrameId(frameId: number | undefined): void {
	const previousFrameId = currentTopFrameId
	currentTopFrameId = frameId
	if (previousFrameId !== frameId) {
		outputChannel.appendLine(
			`[Debug Events ${new Date().toISOString()}] Updated currentTopFrameId from ${previousFrameId} to ${frameId}.`,
		)
	}
}

/**
 * Clears the current top frame ID.
 */
export function clearCurrentTopFrameId(): void {
	if (currentTopFrameId !== undefined) {
		outputChannel.appendLine(
			`[Debug Events ${new Date().toISOString()}] Clearing currentTopFrameId. Previous value: ${currentTopFrameId}.`,
		)
		currentTopFrameId = undefined
	}
}

// --- DAP Output Capture Buffers and Functions ---

/**
 * Stores active DAP output buffers for ongoing debug sessions.
 * Key: session ID, Value: array of output strings.
 */
export const activeSessionDapOutputBuffers = new Map<string, string[]>()

/**
 * Stores finalized DAP output for terminated debug sessions.
 * Key: session ID, Value: concatenated string of all output.
 */
export const terminatedSessionDapOutput = new Map<string, string>()

/**
 * Appends a line of output to the active buffer for a given session.
 * @param sessionId The ID of the debug session.
 * @param outputLine The line of output to append.
 */
export function appendActiveSessionDapOutput(sessionId: string, outputLine: string): void {
	if (!activeSessionDapOutputBuffers.has(sessionId)) {
		activeSessionDapOutputBuffers.set(sessionId, [])
	}
	activeSessionDapOutputBuffers.get(sessionId)?.push(outputLine)
	// Optional: Log verbose output if needed
	// outputChannel.appendLine(`[DAP Output Buffer ${new Date().toISOString()}] Appended to session ${sessionId}: "${outputLine}"`);
}

/**
 * Retrieves the current content of the active DAP output buffer for a session.
 * This does NOT clear or finalize the buffer.
 * @param sessionId The ID of the debug session.
 * @returns The concatenated DAP output string from the active buffer, or undefined if no buffer exists.
 */
export function getActiveSessionDapOutput(sessionId: string): string | undefined {
	const buffer = activeSessionDapOutputBuffers.get(sessionId)
	if (buffer && buffer.length > 0) {
		return buffer.join("")
	}
	return undefined
}
/**
 * Clears the active DAP output buffer for a specific session.
 * Typically called when a new session starts or an old one is fully processed.
 * @param sessionId The ID of the debug session.
 */
export function clearActiveSessionDapOutputBuffer(sessionId: string): void {
	if (activeSessionDapOutputBuffers.has(sessionId)) {
		activeSessionDapOutputBuffers.delete(sessionId)
		outputChannel.appendLine(
			`[DAP Output Buffer ${new Date().toISOString()}] Cleared active DAP output buffer for session ${sessionId}.`,
		)
	}
}

/**
 * Moves the content of the active DAP output buffer for a session to the
 * finalized storage, joining it into a single string.
 * Polls briefly to catch trailing output before finalizing.
 * Typically called when a session terminates.
 * @param sessionId The ID of the debug session.
 */
export async function finalizeActiveSessionDapOutput(sessionId: string): Promise<void> {
	const DAP_OUTPUT_QUIESCENCE_POLL_INTERVAL_MS = 200
	const DAP_OUTPUT_QUIESCENCE_MAX_POLLS = 5 // Max 5 interval wait for quiescence

	let buffer = activeSessionDapOutputBuffers.get(sessionId)
	let lastLength = buffer ? buffer.length : 0

	outputChannel.appendLine(
		`[DAP Output Buffer ${new Date().toISOString()}] Starting finalization for session ${sessionId}. Initial buffer length: ${lastLength}. Polling for quiescence...`,
	)

	for (let i = 0; i < DAP_OUTPUT_QUIESCENCE_MAX_POLLS; i++) {
		await new Promise((resolve) => setTimeout(resolve, DAP_OUTPUT_QUIESCENCE_POLL_INTERVAL_MS))
		buffer = activeSessionDapOutputBuffers.get(sessionId) // Re-fetch buffer
		const currentLength = buffer ? buffer.length : 0

		// Break if data has arrived and then stopped arriving (quiescence with data).
		// If buffer is still empty, continue polling.
		if (currentLength === lastLength && currentLength > 0) {
			outputChannel.appendLine(
				`[DAP Output Buffer ${new Date().toISOString()}] DAP output quiesced with data for session ${sessionId} after ${i + 1} poll(s). Length: ${currentLength}.`,
			)
			break
		}

		lastLength = currentLength

		if (i === DAP_OUTPUT_QUIESCENCE_MAX_POLLS - 1) {
			outputChannel.appendLine(
				`[DAP Output Buffer ${new Date().toISOString()}] DAP output polling reached max attempts for session ${sessionId}. Proceeding with finalization. Final length: ${currentLength}.`,
			)
		} else if (currentLength === 0) {
			// No "else if lastLength === 0" needed, as lastLength would be 0 if currentLength is 0 and it's not the first iteration.
			outputChannel.appendLine(
				`[DAP Output Buffer ${new Date().toISOString()}] DAP output buffer still empty for session ${sessionId} after ${i + 1} poll(s). Continuing to poll.`,
			)
		}
	}

	// Final processing after polling
	buffer = activeSessionDapOutputBuffers.get(sessionId) // Re-fetch buffer one last time
	if (buffer && buffer.length > 0) {
		const fullOutput = buffer.join("") // Join with no separator, assuming lines already have newlines if needed
		terminatedSessionDapOutput.set(sessionId, fullOutput)
		outputChannel.appendLine(
			`[DAP Output Buffer ${new Date().toISOString()}] Finalized DAP output for session ${sessionId}. Length: ${fullOutput.length}`,
		)
	} else {
		outputChannel.appendLine(
			`[DAP Output Buffer ${new Date().toISOString()}] No active DAP output to finalize for session ${sessionId} after polling.`,
		)
		// Ensure an entry exists even if empty, so getFinalizedSessionDapOutput doesn't imply "never seen"
		if (!terminatedSessionDapOutput.has(sessionId)) {
			terminatedSessionDapOutput.set(sessionId, "")
		}
	}
	// Clear the active buffer after finalizing
	clearActiveSessionDapOutputBuffer(sessionId)
}

/**
 * Retrieves the finalized DAP output for a terminated session.
 * @param sessionId The ID of the debug session.
 * @returns The concatenated DAP output string, or undefined if not found.
 */
export function getFinalizedSessionDapOutput(sessionId: string): string | undefined {
	return terminatedSessionDapOutput.get(sessionId)
}

/**
 * Clears the stored finalized DAP output for a specific session.
 * Typically called when a new session for the same ID starts or after the output has been consumed.
 * @param sessionId The ID of the debug session.
 */
export function clearFinalizedSessionDapOutput(sessionId: string): void {
	if (terminatedSessionDapOutput.has(sessionId)) {
		terminatedSessionDapOutput.delete(sessionId)
		outputChannel.appendLine(
			`[DAP Output Buffer ${new Date().toISOString()}] Cleared finalized DAP output for session ${sessionId}.`,
		)
	}
}
