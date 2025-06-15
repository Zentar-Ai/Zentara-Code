import * as vscode from "vscode"
import { StackFrameInfo, NavigationResult } from "../IDebugController"
import { getActiveSession } from "./session" // Assuming session.ts is in the same directory
import { stackTrace } from "./inspection" // Assuming inspection.ts is in the same directory
import { outputChannel, stringifySafe } from "../vscodeUtils" // Use local outputChannel and stringifySafe
import { clearLastKnownStopEvent, lastKnownStopEventBody } from "../debug/events" // Import the clearer and the variable

/**
 * Processes a DAP stop event to extract stack frame and exception information.
 * @param session The active debug session.
 * @param stopEventBody The body of the DAP 'stopped' event.
 * @param operationName For logging purposes, the name of the operation that led to this stop.
 * @returns A Promise resolving to a NavigationResult like object.
 */
export async function processStopEvent(
	session: vscode.DebugSession,
	stopEventBody: any, // Body from waitForDapStop
	operationName: string = "processing stop event",
): Promise<Partial<NavigationResult>> {
	// Returns parts of NavigationResult
	outputChannel.appendLine(
		`[processStopEvent][${operationName}] Processing stop event. Initial reason: ${stopEventBody?.reason}. Initial body: ${stringifySafe(stopEventBody)}`,
	)

	// Ensure session is still active before proceeding
	const currentActiveSession = getActiveSession()
	if (!currentActiveSession || currentActiveSession.id !== session.id) {
		outputChannel.appendLine(
			`[processStopEvent][${operationName}] Session ${session.id} terminated before/during stop event processing.`,
		)
		return { success: false, errorMessage: `Session terminated during ${operationName}.` }
	}

	let finalFrame: StackFrameInfo | undefined = undefined
	let exceptionMessage: string | undefined = undefined
	let effectiveStopEventBody = stopEventBody // Use the passed-in body by default

	// If the initial stop reason is 'exception', check if lastKnownStopEventBody has more detailed info
	if (
		stopEventBody?.reason === "exception" &&
		lastKnownStopEventBody?.reason === "exception" &&
		lastKnownStopEventBody?.exceptionInfoDetails
	) {
		outputChannel.appendLine(
			`[processStopEvent][${operationName}] Initial stop is exception. Checking lastKnownStopEventBody for more details.`,
		)
		// If the lastKnownStopEventBody has exceptionInfoDetails and the initial one doesn't (or has less), prefer lastKnownStopEventBody.
		if (
			!stopEventBody.exceptionInfoDetails ||
			(lastKnownStopEventBody.exceptionInfoDetails.message && !stopEventBody.exceptionInfoDetails.message) ||
			(lastKnownStopEventBody.exceptionInfoDetails.stackTrace && !stopEventBody.exceptionInfoDetails.stackTrace)
		) {
			outputChannel.appendLine(
				`[processStopEvent][${operationName}] Using lastKnownStopEventBody as it has more detailed exception info.`,
			)
			effectiveStopEventBody = lastKnownStopEventBody
		} else {
			outputChannel.appendLine(
				`[processStopEvent][${operationName}] Initial stopEventBody seems to have sufficient/better exception details. Using it.`,
			)
		}
	}
	outputChannel.appendLine(
		`[processStopEvent][${operationName}] Effective stop event body for processing: ${stringifySafe(effectiveStopEventBody)}`,
	)

	try {
		// Get stack trace
		const traceResult = await stackTrace(currentActiveSession)
		if (traceResult.success && traceResult.frames) {
			finalFrame = traceResult.frames[0]
		} else {
			outputChannel.appendLine(
				`[WARN][processStopEvent][${operationName}] Failed to get stack trace: ${traceResult.errorMessage}`,
			)
			// Don't make it a hard failure, exception info might still be useful
		}

		// Check for exception using the effectiveStopEventBody
		if (effectiveStopEventBody?.reason === "exception") {
			const exInfoDetails = effectiveStopEventBody.exceptionInfoDetails?.details // Corrected path
			const type = effectiveStopEventBody.exceptionInfoDetails?.exceptionId || effectiveStopEventBody.text || ""
			const description = exInfoDetails?.message || effectiveStopEventBody.description || "" // Use exInfoDetails.message first
			const formattedTraceback = exInfoDetails?.stackTrace || "" // Use exInfoDetails.stackTrace
			const exInfoError = effectiveStopEventBody.exceptionInfoError

			if (exInfoError) {
				outputChannel.appendLine(
					`[WARN][processStopEvent][${operationName}] DapStopTracker reported an error getting full exceptionInfo: ${exInfoError}. Using basic info from stop event.`,
				)
			}

			outputChannel.appendLine(
				`[processStopEvent][${operationName}] Exception Details: Type='${type}', Desc='${description}', Trace='${formattedTraceback ? "Exists" : "Empty"}'`,
			)

			let messageParts = []
			if (formattedTraceback) {
				messageParts.push(`Traceback (most recent call last):\n${formattedTraceback}`)
				// The type and description are often part of the traceback itself.
				// Only add them if they provide new information.
				if (type && !formattedTraceback.includes(type)) messageParts.push(`Type: ${type}`)
				if (description && !formattedTraceback.includes(description))
					messageParts.push(`Description: ${description}`)
			} else {
				// If no formatted traceback, construct from parts
				if (type) messageParts.push(`Type: ${type}`)
				if (description) messageParts.push(`Description: ${description}`)
				// Fallback to event's top-level description if specific parts are missing
				if (messageParts.length === 0 && effectiveStopEventBody.description) {
					messageParts.push(`Event Description: ${effectiveStopEventBody.description}`)
				}
			}
			exceptionMessage =
				messageParts.join("\n").trim() || "Exception occurred (no specific details found in stop event)"
			outputChannel.appendLine(
				`[processStopEvent][${operationName}] Exception detected. Formatted Message: ${exceptionMessage}`,
			)
		}

		outputChannel.appendLine(
			`[processStopEvent][${operationName}] Preparing to return result with frame: ${finalFrame ? stringifySafe(finalFrame) : "undefined"}, Exception: ${exceptionMessage || "None"}`,
		)

		// Extract additional fields from the effectiveStopEventBody
		const stopReason = effectiveStopEventBody?.reason
		const capturedDapOutput = effectiveStopEventBody?.capturedDapOutput
		const capturedRawTerminalOutput = effectiveStopEventBody?.capturedRawTerminalOutput

		const result = {
			success: true,
			frame: finalFrame,
			exceptionMessage: exceptionMessage,
			stopReason: stopReason,
			capturedDapOutput: capturedDapOutput,
			capturedRawTerminalOutput: capturedRawTerminalOutput,
		}
		outputChannel.appendLine(`[processStopEvent][${operationName}] Returning result: ${stringifySafe(result)}`)
		return result
	} catch (error: any) {
		outputChannel.appendLine(
			`[ERROR][processStopEvent][${operationName}] Error processing stop event: ${error.message || String(error)}`,
		)
		return { success: false, errorMessage: `Error processing stop event: ${error.message || String(error)}` }
	} finally {
		outputChannel.appendLine(`[processStopEvent][${operationName}][finally] Entering finally block`)
		// Clear the globally stored stop event now that it has been processed or attempted to be processed.
		// This prevents it from being re-processed by a subsequent waitForDapStop call
		// if no new stop event has occurred in the interim.
		// IMPORTANT: Clear based on the effectiveStopEventBody that was actually processed or attempted.
		if (effectiveStopEventBody === lastKnownStopEventBody) {
			outputChannel.appendLine(
				`[processStopEvent][${operationName}][finally] Clearing last known stop event as it was (attempted to be) processed.`,
			)
			clearLastKnownStopEvent()
		} else if (stopEventBody === lastKnownStopEventBody) {
			// If the original stopEventBody was the last known one, but we used a different effective body
			// still clear the original one as it's now stale.
			outputChannel.appendLine(
				`[processStopEvent][${operationName}][finally] Clearing original lastKnownStopEventBody as a newer/different one was processed or it was used as base.`,
			)
			clearLastKnownStopEvent()
		} else {
			outputChannel.appendLine(
				`[WARN][processStopEvent][${operationName}][finally] Neither initial nor effective stopEventBody matches lastKnownStopEventBody. This might be okay if a new event arrived during processing. LastKnown: ${stringifySafe(lastKnownStopEventBody)}`,
			)
		}
		outputChannel.appendLine(`[processStopEvent][${operationName}][finally] Exiting finally block`)
	}
}
