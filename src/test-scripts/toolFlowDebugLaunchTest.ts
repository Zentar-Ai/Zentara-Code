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

export async function runToolFlowDebugLaunchTest() {
	const outputChannel = vscode.window.createOutputChannel("Tool Flow Debug Launch Test")
	outputChannel.appendLine("================================================================")
	outputChannel.appendLine("--- Starting Tool Flow Debug Launch Test (stopOnEntry:true) ---")
	outputChannel.appendLine("================================================================")
	outputChannel.show(true)

	// 1. Mock Task
	// Create a more complete mock Task object
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

	// 3. Simulate LLM tool request for launch
	const launchArgs = {
		program: programPath,
		stopOnEntry: true,
		cwd: programCwd,
	}

	// Construct the XML string for the new debug_launch tool format
	const toolRequest = `<debug_launch>
        <program>${launchArgs.program}</program>
        <stopOnEntry>${launchArgs.stopOnEntry ? "true" : "false"}</stopOnEntry>
        <cwd>${launchArgs.cwd}</cwd>
    </debug_launch>`

	outputChannel.appendLine("\n=== Simulating LLM Tool Request ===")
	outputChannel.appendLine(toolRequest)

	// 4. Add the tool request to Task's assistantMessageContent
	//    This should reflect the new individual tool structure
	mockTask.assistantMessageContent = [
		{
			type: "tool_use",
			partial: false,
			name: "debug_launch", // Updated tool name
			params: {
				// Params are now direct arguments
				program: launchArgs.program,
				stopOnEntry: launchArgs.stopOnEntry ? "true" : "false", // Ensure this is a string "true" or "false"
				cwd: launchArgs.cwd,
			},
		},
	]

	// 5. Process the tool request through presentAssistantMessage
	try {
		outputChannel.appendLine("\n=== Executing Tool Request Through presentAssistantMessage ===")
		await presentAssistantMessage(mockTask)

		outputChannel.appendLine("\n=== Tool Response Analysis ===")
		outputChannel.appendLine("User Message Content:")
		mockTask.userMessageContent.forEach((content, index) => {
			outputChannel.appendLine(`\n[Content Block ${index + 1}]`)
			outputChannel.appendLine(stringifySafe(content))
		})
	} catch (error: any) {
		outputChannel.appendLine(`\n=== ERROR: Tool request execution failed ===`)
		outputChannel.appendLine(`Error message: ${error.message}`)
		outputChannel.appendLine(`Error stack: ${error.stack || stringifySafe(error)}`)
	} finally {
		outputChannel.appendLine("\n================================================================")
		outputChannel.appendLine("--- Tool Flow Debug Launch Test Finished ---")
		outputChannel.appendLine("================================================================")
	}
}

// Registration instructions for the test command:
/*
To register this test in your extension:

1. In src/extension.ts, add:

import { runToolFlowDebugLaunchTest } from './test-scripts/toolFlowDebugLaunchTest';

2. In the activate() function, register the command:

let disposableTestRunner = vscode.commands.registerCommand(
    'debugging-roo-code.runToolFlowLaunchTest', 
    () => {
        runToolFlowDebugLaunchTest();
    }
);
context.subscriptions.push(disposableTestRunner);

3. To run the test:
   - Start the extension in debug mode (F5)
   - Open Command Palette (Ctrl+Shift+P)
   - Run "Debugging Roo Code: Run Tool Flow Launch Test"
   - Check the "Tool Flow Debug Launch Test" output channel
*/
