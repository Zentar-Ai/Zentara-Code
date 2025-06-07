import * as vscode from "vscode"
import { presentAssistantMessage } from "../core/assistant-message/presentAssistantMessage"
import type { Task } from "../core/task/Task"
import { formatResponse } from "../core/prompts/responses"

// Helper to stringify with circular reference handling
const stringifySafe = (obj: any, indent: number = 2) => {
	const cache = new Set()
	return JSON.stringify(
		obj,
		(key, value) => {
			if (typeof value === "object" && value !== null) {
				if (cache.has(value)) {
					return "[Circular]"
				}
				cache.add(value)
			}
			return value
		},
		indent,
	)
}

export async function runToolFlowDebugSequenceTest() {
	const outputChannel = vscode.window.createOutputChannel("Tool Flow Debug Sequence Test")
	outputChannel.appendLine("================================================================")
	outputChannel.appendLine("--- Starting Tool Flow Debug Sequence Test ---")
	outputChannel.appendLine("================================================================")
	outputChannel.show(true)

	// 1. Mock Task
	const mockTask = {
		taskId: "test-task",
		instanceId: "test-instance",
		consecutiveMistakeCount: 0,
		abort: false,
		presentAssistantMessageLocked: false,
		presentAssistantMessageHasPendingUpdates: false,
		currentStreamingContentIndex: 0,
		didCompleteReadingStream: false,
		didRejectTool: false,
		didAlreadyUseTool: false,
		userMessageContentReady: false,
		diffEnabled: true,
		recordToolError: (toolName: string) => {
			outputChannel.appendLine(`[Task Mock] recordToolError called for: ${toolName}`)
		},
		recordToolUsage: (toolName: string) => {
			outputChannel.appendLine(`[Task Mock] recordToolUsage called for: ${toolName}`)
		},
		say: async (type: string, content: string) => {
			outputChannel.appendLine(`[Task Mock] say called with type: ${type}, content: ${content}`)
		},
		ask: async (type: string, message?: string) => {
			outputChannel.appendLine(`[Task Mock] ask called with type: ${type}, message: ${message}`)
			return { response: "yesButtonClicked" } // Auto-approve
		},
		browserSession: {
			closeBrowser: async () => {},
		},
		providerRef: {
			deref: () => ({
				getState: async () => ({ mode: "debug", customModes: [] }),
			}),
		},
		toolRepetitionDetector: {
			check: () => ({ allowExecution: true }),
		},
		fileContextTracker: {
			getAndClearCheckpointPossibleFile: () => [],
		},
		sayAndCreateMissingParamError: async (toolName: string, paramName: string) => {
			const errorMsg = `Missing parameter '${paramName}' for tool '${toolName}'.`
			outputChannel.appendLine(`[Task Mock] sayAndCreateMissingParamError: ${errorMsg}`)
			return formatResponse.toolError(errorMsg)
		},
		assistantMessageContent: [],
		userMessageContent: [],
	} as unknown as Task

	// 2. Get workspace paths
	let programPath = ""
	let programCwd = ""

	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		const workspaceUri = vscode.workspace.workspaceFolders[0].uri
		programPath = vscode.Uri.joinPath(workspaceUri, "testdata/sample_debug_program.py").fsPath
		programCwd = vscode.Uri.joinPath(workspaceUri, "testdata/").fsPath
	} else {
		outputChannel.appendLine("[Test Script] ERROR: No workspace folder found!")
		return
	}

	outputChannel.appendLine(`[Test Script] Using program path: ${programPath}`)
	outputChannel.appendLine(`[Test Script] Using program CWD: ${programCwd}`)

	try {
		// 3. Launch Debug Session
		outputChannel.appendLine("\n=== Step 1: Launch Debug Session ===")
		const launchArgs = {
			program: programPath,
			stopOnEntry: "true", // Changed to string
			cwd: programCwd,
		}
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				partial: false,
				name: "debug_launch",
				params: launchArgs,
			},
		]
		await presentAssistantMessage(mockTask)
		outputChannel.appendLine("Launch operation completed.")
		outputChannel.appendLine("--- Launch User Message Content ---")
		mockTask.userMessageContent.forEach((content, index) => {
			outputChannel.appendLine(`[Launch Content ${index + 1}] ${stringifySafe(content)}`)
		})

		// Reset task state for the next operation
		mockTask.userMessageContent = []
		mockTask.currentStreamingContentIndex = 0
		mockTask.didCompleteReadingStream = false
		mockTask.didRejectTool = false
		mockTask.didAlreadyUseTool = false

		// 4. Set Breakpoint
		outputChannel.appendLine("\n=== Step 2: Set Breakpoint ===")
		// For debug_set_breakpoint, arguments are path, line, condition, etc.
		// setBreakpointArgs was { location: { path: programPath, line: 5 } }
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				partial: false,
				name: "debug_set_breakpoint",
				params: {
					path: programPath,
					line: "5", // Changed to string
					// condition: undefined, // No condition in this test
				},
			},
		]
		await presentAssistantMessage(mockTask)
		outputChannel.appendLine("Set breakpoint operation completed.")
		outputChannel.appendLine("--- Set Breakpoint User Message Content ---")
		mockTask.userMessageContent.forEach((content, index) => {
			outputChannel.appendLine(`[Breakpoint Content ${index + 1}] ${stringifySafe(content)}`)
		})

		// Reset task state for the next operation
		mockTask.userMessageContent = []
		mockTask.currentStreamingContentIndex = 0
		mockTask.didCompleteReadingStream = false
		mockTask.didRejectTool = false
		mockTask.didAlreadyUseTool = false

		// 5. Get Stack Trace
		outputChannel.appendLine("\n=== Step 3: Get Stack Trace ===")
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				partial: false,
				name: "debug_stack_trace",
				params: {}, // No arguments needed
			},
		]
		await presentAssistantMessage(mockTask)
		outputChannel.appendLine("Stack trace operation completed.")
		outputChannel.appendLine("--- Stack Trace User Message Content ---")
		mockTask.userMessageContent.forEach((content, index) => {
			outputChannel.appendLine(`[StackTrace Content ${index + 1}] ${stringifySafe(content)}`)
		})

		// Reset task state for the next operation
		mockTask.userMessageContent = []
		mockTask.currentStreamingContentIndex = 0
		mockTask.didCompleteReadingStream = false
		mockTask.didRejectTool = false
		mockTask.didAlreadyUseTool = false

		// 6. Step Over (Next)
		outputChannel.appendLine("\n=== Step 4: Step Over (Next) ===")
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				partial: false,
				name: "debug_next",
				params: {}, // No arguments needed
			},
		]
		await presentAssistantMessage(mockTask)
		outputChannel.appendLine("Next operation completed.")
		outputChannel.appendLine("--- Next User Message Content ---")
		mockTask.userMessageContent.forEach((content, index) => {
			outputChannel.appendLine(`[Next Content ${index + 1}] ${stringifySafe(content)}`)
		})

		// Reset task state for the next operation
		mockTask.userMessageContent = []
		mockTask.currentStreamingContentIndex = 0
		mockTask.didCompleteReadingStream = false
		mockTask.didRejectTool = false
		mockTask.didAlreadyUseTool = false

		// 7. Continue execution
		outputChannel.appendLine("\n=== Step 5: Continue ===")
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				partial: false,
				name: "debug_continue",
				params: {}, // No arguments needed
			},
		]
		await presentAssistantMessage(mockTask)
		outputChannel.appendLine("Continue operation completed.")
		outputChannel.appendLine("--- Continue User Message Content ---")
		mockTask.userMessageContent.forEach((content, index) => {
			outputChannel.appendLine(`[Continue Content ${index + 1}] ${stringifySafe(content)}`)
		})

		// Reset task state for the next operation
		mockTask.userMessageContent = []
		mockTask.currentStreamingContentIndex = 0
		mockTask.didCompleteReadingStream = false
		mockTask.didRejectTool = false
		mockTask.didAlreadyUseTool = false

		// 8. Get Stack Trace (to find frameId at breakpoint)
		outputChannel.appendLine("\n=== Step 6: Get Stack Trace (at breakpoint) ===")
		mockTask.assistantMessageContent = [
			{
				type: "tool_use",
				partial: false,
				name: "debug_stack_trace",
				params: {}, // No arguments needed
			},
		]
		await presentAssistantMessage(mockTask)
		outputChannel.appendLine("Stack trace (at breakpoint) operation completed.")
		outputChannel.appendLine("--- Stack Trace (at breakpoint) User Message Content ---")
		let frameIdForVariables: number | undefined
		mockTask.userMessageContent.forEach((content, index) => {
			outputChannel.appendLine(`[StackTrace@BP Content ${index + 1}] ${stringifySafe(content)}`)
			if (content.type === "text" && content.text.includes('"frames":')) {
				try {
					const result = JSON.parse(content.text)
					if (result.frames && result.frames.length > 0) {
						// Assuming the program stops at the breakpoint in the main script,
						// the top frame related to sample_debug_program.py should be what we need.
						// Python debugpy often puts the user's code frame not necessarily at index 0.
						// We'll find the first frame that is in our sample_debug_program.py
						const targetFrame = result.frames.find((f: any) =>
							f.sourcePath?.includes("sample_debug_program.py"),
						)
						if (targetFrame) {
							frameIdForVariables = targetFrame.id
							outputChannel.appendLine(`Found frameId ${frameIdForVariables} for sample_debug_program.py`)
						} else if (result.frames.length > 0) {
							// Fallback to top frame if specific one not found (less reliable)
							frameIdForVariables = result.frames[0].id
							outputChannel.appendLine(`Fallback: Using top frameId ${frameIdForVariables}`)
						}
					}
				} catch (e) {
					outputChannel.appendLine(`Error parsing stack trace for frameId: ${e}`)
				}
			}
		})

		if (frameIdForVariables === undefined) {
			outputChannel.appendLine("ERROR: Could not determine frameId for get_stack_frame_variables.")
		} else {
			// Reset task state for the next operation
			mockTask.userMessageContent = []
			mockTask.currentStreamingContentIndex = 0
			mockTask.didCompleteReadingStream = false
			mockTask.didRejectTool = false
			mockTask.didAlreadyUseTool = false

			// 9. Get Stack Frame Variables
			outputChannel.appendLine("\n=== Step 7: Get Stack Frame Variables ===")
			mockTask.assistantMessageContent = [
				{
					type: "tool_use",
					partial: false,
					name: "debug_get_stack_frame_variables",
					params: { frameId: String(frameIdForVariables) }, // Changed to string
				},
			]
			await presentAssistantMessage(mockTask)
			outputChannel.appendLine("Get stack frame variables operation completed.")
			outputChannel.appendLine("--- Get Stack Frame Variables User Message Content ---")
			mockTask.userMessageContent.forEach((content, index) => {
				outputChannel.appendLine(`[Variables Content ${index + 1}] ${stringifySafe(content)}`)
			})
		}

		// Reset task state
		mockTask.userMessageContent = []
		mockTask.currentStreamingContentIndex = 0
		mockTask.didCompleteReadingStream = false
		mockTask.didRejectTool = false
		mockTask.didAlreadyUseTool = false

		// Final log
		outputChannel.appendLine("\n=== Final User Message Content (should be empty) ===")
		mockTask.userMessageContent.forEach((content, index) => {
			outputChannel.appendLine(`[Final Content ${index + 1}] ${stringifySafe(content)}`)
		})
	} catch (error: any) {
		outputChannel.appendLine(`\n=== ERROR: Tool request execution failed ===`)
		outputChannel.appendLine(`Error message: ${error.message}`)
		outputChannel.appendLine(`Error stack: ${error.stack || stringifySafe(error)}`)
	} finally {
		outputChannel.appendLine("\n================================================================")
		outputChannel.appendLine("--- Tool Flow Debug Sequence Test Finished ---")
		outputChannel.appendLine("================================================================\n")
	}
}

// Registration instructions for the test command:
/*
To register this test in your extension:

1. In src/extension.ts, add:

import { runToolFlowDebugSequenceTest } from './test-scripts/toolFlowDebugSequenceTest';

2. In the activate() function, register the command:

let disposableTestRunner = vscode.commands.registerCommand(
    'debugging-roo-code.runToolFlowSequenceTest', 
    () => {
        runToolFlowDebugSequenceTest();
    }
);
context.subscriptions.push(disposableTestRunner);

3. To run the test:
   - Start the extension in debug mode (F5)
   - Open Command Palette (Ctrl+Shift+P)
   - Run "Debugging Roo Code: Run Tool Flow Sequence Test"
   - Check the "Tool Flow Debug Sequence Test" output channel
*/
