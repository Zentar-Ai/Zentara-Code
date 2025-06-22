import * as vscode from "vscode"
import { outputChannel } from "../vscodeUtils"

interface ActiveTerminalCapture {
	terminal: vscode.Terminal
	buffer: string[]
	dataListener: vscode.Disposable
	closeListener: vscode.Disposable
}

export class RawTerminalOutputManager {
	private activeSessionTerminalCaptures: Map<string, ActiveTerminalCapture> = new Map()
	private terminatedSessionRawTerminalOutput: Map<string, string> = new Map()
	private finalizingSessions: Set<string> = new Set() // Added to prevent re-entrancy
	private disposables: vscode.Disposable[] = []

	constructor() {
		// General handler for terminals closing unexpectedly,
		// though specific session-linked terminals are handled more directly.
		const generalCloseListener =
			typeof vscode.window.onDidCloseTerminal === "function"
				? vscode.window.onDidCloseTerminal((terminal) => {
						this.handleTerminalClose(terminal)
					})
				: { dispose: () => {} } // Fallback
		this.disposables.push(generalCloseListener)
	}

	public startCaptureForSession(sessionId: string, terminal: vscode.Terminal): void {
		this.clearActiveCapture(sessionId) // Clear any previous active capture for this session ID

		const buffer: string[] = []
		const onDidWriteTerminalData = (vscode.window as any).onDidWriteTerminalData
		const dataListener =
			typeof onDidWriteTerminalData === "function"
				? onDidWriteTerminalData((e: { terminal: vscode.Terminal; data: string }) => {
						if (e.terminal === terminal) {
							buffer.push(e.data)
							//outputChannel.appendLine(`[RawTerminalOutputManager]:line 33,  event data:  ${JSON.stringify(e.data)}`);
							//outputChannel.appendLine(`[RawTerminalOutputManager]:line 34,  buffer:  ${JSON.stringify(buffer)}`);
						}
					})
				: { dispose: () => {} } // Fallback

		// Listener for when this specific terminal is closed
		const onDidCloseTerminalSpecific = vscode.window.onDidCloseTerminal
		const closeListener =
			typeof onDidCloseTerminalSpecific === "function"
				? onDidCloseTerminalSpecific((closedTerminal) => {
						if (closedTerminal === terminal) {
							if (this.activeSessionTerminalCaptures.has(sessionId)) {
								outputChannel.appendLine(
									`RawTerminalOutputManager: Terminal for session ${sessionId} closed. Finalizing capture.`,
								)
								this.stopCaptureForSession(sessionId)
							}
						}
					})
				: { dispose: () => {} } // Fallback

		this.activeSessionTerminalCaptures.set(sessionId, {
			terminal,
			buffer,
			dataListener,
			closeListener,
		})
		outputChannel.appendLine(
			`RawTerminalOutputManager: Started capture for session ${sessionId} on terminal "${terminal.name}"`,
		)
	}

	public async stopCaptureForSession(sessionId: string): Promise<void> {
		if (this.finalizingSessions.has(sessionId)) {
			outputChannel.appendLine(
				`RawTerminalOutputManager: stopCaptureForSession already in progress for session ${sessionId}. Ignoring duplicate call.`,
			)
			return
		}
		this.finalizingSessions.add(sessionId)

		try {
			const capture = this.activeSessionTerminalCaptures.get(sessionId)
			if (capture) {
				outputChannel.appendLine(
					`RawTerminalOutputManager: stopCaptureForSession called for session ${sessionId}. Starting polling for final output.`,
				)

				let lastBufferSize = capture.buffer.length
				let noChangeStreak = 0
				const maxStreaks = 20 // Number of consecutive polls with no change to assume quiescence (User request: 5)
				const pollInterval = 50 // Milliseconds between polls
				const maxPollAttempts = maxStreaks * 2 // Max attempts to prevent indefinite waiting if data trickles slowly

				for (let i = 0; i < maxPollAttempts; i++) {
					await new Promise((resolve) => setTimeout(resolve, pollInterval))

					// Ensure capture still exists, as it might be cleared by an asynchronous close event
					const currentCapture = this.activeSessionTerminalCaptures.get(sessionId)
					if (!currentCapture) {
						outputChannel.appendLine(
							`RawTerminalOutputManager: Capture for session ${sessionId} was cleared during polling. Exiting poll.`,
						)
						return // Exits the try block, finally will still run
					}

					if (currentCapture.buffer.length === lastBufferSize) {
						noChangeStreak++
						if (noChangeStreak >= maxStreaks) {
							outputChannel.appendLine(
								`RawTerminalOutputManager: No new terminal data for ${noChangeStreak * pollInterval}ms for session ${sessionId}. Assuming output complete.`,
							)
							break
						}
					} else {
						lastBufferSize = currentCapture.buffer.length
						noChangeStreak = 0 // Reset streak
						outputChannel.appendLine(
							`RawTerminalOutputManager: New terminal data received for session ${sessionId}. Current buffer length: ${lastBufferSize}`,
						)
					}
				}
				if (noChangeStreak < maxStreaks) {
					outputChannel.appendLine(
						`RawTerminalOutputManager: Polling finished for session ${sessionId}, but output might still have been arriving or max poll attempts reached.`,
					)
				}

				// Re-fetch capture in case it was modified or to ensure we're acting on the latest state if it wasn't cleared
				const finalCapture = this.activeSessionTerminalCaptures.get(sessionId)
				if (finalCapture) {
					const output = finalCapture.buffer.join("")
					this.finalizeActiveSessionRawTerminalOutput(sessionId, output) // This also clears the active buffer
					//this.clearActiveCapture(sessionId); // This disposes listeners and removes from map
					outputChannel.appendLine(
						`RawTerminalOutputManager: Stopped and finalized capture for session ${sessionId} after polling. Output length: ${output.length}`,
					)
				} else {
					outputChannel.appendLine(
						`RawTerminalOutputManager: Capture for session ${sessionId} was cleared before final finalization. Output might have been finalized by a concurrent close event.`,
					)
				}
			} // End of if(capture)
		} finally {
			// This finally corresponds to the try at line 62
			this.finalizingSessions.delete(sessionId)
		}
	}

	public getActiveSessionRawTerminalOutput(sessionId: string): string | undefined {
		const capture = this.activeSessionTerminalCaptures.get(sessionId)
		return capture ? capture.buffer.join("") : undefined
	}

	public clearActiveSessionRawTerminalOutput(sessionId: string): void {
		const capture = this.activeSessionTerminalCaptures.get(sessionId)
		if (capture) {
			capture.buffer = []
			outputChannel.appendLine(`RawTerminalOutputManager: Cleared active buffer for session ${sessionId}`)
		}
	}

	public finalizeActiveSessionRawTerminalOutput(sessionId: string, output?: string): void {
		const currentOutput = output ?? this.getActiveSessionRawTerminalOutput(sessionId)
		if (currentOutput !== undefined) {
			this.terminatedSessionRawTerminalOutput.set(sessionId, currentOutput)
			outputChannel.appendLine(
				`RawTerminalOutputManager: Finalized output for session ${sessionId}. current Output: ${JSON.stringify(currentOutput)} Length: ${currentOutput.length}`,
			)
		}
		// Ensure active buffer is cleared after finalization if it wasn't already via stopCapture
		//this.clearActiveSessionRawTerminalOutput(sessionId);
	}

	public getFinalizedSessionRawTerminalOutput(sessionId: string): string | undefined {
		const finalOutput = this.terminatedSessionRawTerminalOutput.get(sessionId)
		outputChannel.appendLine(
			`[RawTerminalOutputManger] all output :${JSON.stringify(Array.from(this.terminatedSessionRawTerminalOutput.entries()))}`,
		)
		outputChannel.appendLine(`[RawTerminalOutputManger] final output :${finalOutput} for session ID: ${sessionId}`)
		return finalOutput
	}

	public clearFinalizedSessionRawTerminalOutput(sessionId: string): void {
		if (this.terminatedSessionRawTerminalOutput.has(sessionId)) {
			this.terminatedSessionRawTerminalOutput.delete(sessionId)
			outputChannel.appendLine(`RawTerminalOutputManager: Cleared finalized output for session ${sessionId}`)
		}
	}

	private clearActiveCapture(sessionId: string): void {
		const capture = this.activeSessionTerminalCaptures.get(sessionId)
		if (capture) {
			capture.dataListener.dispose()
			capture.closeListener.dispose()
			this.activeSessionTerminalCaptures.delete(sessionId)
			outputChannel.appendLine(
				`RawTerminalOutputManager: Cleared active capture resources for session ${sessionId}`,
			)
		}
	}

	private handleTerminalClose(closedTerminal: vscode.Terminal): void {
		// Iterate over active captures to see if this closed terminal was one of them
		for (const [sessionId, capture] of this.activeSessionTerminalCaptures.entries()) {
			if (capture.terminal === closedTerminal) {
				outputChannel.appendLine(
					`RawTerminalOutputManager: Associated terminal "${closedTerminal.name}" for session ${sessionId} closed. Finalizing capture.`,
				)
				// The specific closeListener in startCaptureForSession should handle this,
				// but this is a fallback.
				this.stopCaptureForSession(sessionId)
				break
			}
		}
	}

	public dispose(): void {
		this.disposables.forEach((d) => d.dispose())
		this.activeSessionTerminalCaptures.forEach((_, sessionId) => {
			this.clearActiveCapture(sessionId)
		})
		this.activeSessionTerminalCaptures.clear()
		this.terminatedSessionRawTerminalOutput.clear()
		outputChannel.appendLine("RawTerminalOutputManager: Disposed all resources.")
	}
}
