import * as vscode from "vscode"
import { debugTool } from "../core/tools/debugTool" // Path relative to this file in Debugging-roo-code
import type { DebugToolUse, AskApproval, HandleError, PushToolResult } from "../shared/tools" // Path relative to this file
import type { Task } from "../core/task/Task" // Path relative to this file
import { formatResponse } from "../core/prompts/responses" // Path relative to this file

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

export async function runDirectDebugToolLaunchTest() {
	const outputChannel = vscode.window.createOutputChannel("Direct DebugTool Launch Test (DRC)") // DRC for Debugging-roo-code
	outputChannel.appendLine("================================================================")
	outputChannel.appendLine("--- Starting Direct DebugTool Launch Test (stopOnEntry:true) ---")
	outputChannel.appendLine("--- For Debugging-roo-code Project ---")
	outputChannel.appendLine("================================================================")
	outputChannel.show(true)

	// 1. Mock Task and Callbacks
	const mockTask = {
		consecutiveMistakeCount: 0,
		recordToolError: (toolName: string) => {
			outputChannel.appendLine(`[Task Mock] recordToolError called for: ${toolName}`)
		},
		sayAndCreateMissingParamError: async (toolName: string, paramName: string) => {
			const errorMsg = `Missing parameter '${paramName}' for tool '${toolName}'.`
			outputChannel.appendLine(`[Task Mock] sayAndCreateMissingParamError: ${errorMsg}`)
			return formatResponse.toolError(errorMsg)
		},
		// Add the missing 'say' method
		say: async (type: string, content: string) => {
			outputChannel.appendLine(`[Task Mock] say called with type: ${type}, content: ${content}`)
		},
	} as unknown as Task

	const mockAskApproval: AskApproval = async (type, partialMessage) => {
		outputChannel.appendLine(`[Callback Mock] askApproval called. Type: ${type}, Message: ${partialMessage}`)
		outputChannel.appendLine(`[Callback Mock] ==> Auto-approving.`)
		return true
	}

	const mockHandleError: HandleError = async (action, error) => {
		outputChannel.appendLine(`[Callback Mock] handleError called. Action: ${action}`)
		outputChannel.appendLine(`[Callback Mock] Error: ${error.message}`)
		outputChannel.appendLine(`[Callback Mock] Error Stack: ${error.stack}`)
	}

	const mockPushToolResult: PushToolResult = (content) => {
		outputChannel.appendLine(`[Callback Mock] pushToolResult called.`)
		outputChannel.appendLine(`-------------------- RESULT --------------------`)
		if (typeof content === "string") {
			outputChannel.appendLine(content)
		} else {
			outputChannel.appendLine(stringifySafe(content))
		}
		outputChannel.appendLine(`----------------------------------------------`)
	}

	// 2. Define ToolUse block
	// Construct paths relative to the Debugging-roo-code workspace root when the extension runs
	let programPath = ""
	let programCwd = ""

	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		const workspaceUri = vscode.workspace.workspaceFolders[0].uri
		programPath = vscode.Uri.joinPath(workspaceUri, "testdata/sample_debug_program.py").fsPath
		programCwd = vscode.Uri.joinPath(workspaceUri, "testdata/").fsPath
	} else {
		// Fallback or error if no workspace is open - this shouldn't happen in Extension Host
		outputChannel.appendLine(
			"[Test Script] ERROR: No workspace folder found. Using hardcoded fallback (likely incorrect).",
		)
	}

	outputChannel.appendLine(`[Test Script] Resolved program path: ${programPath}`)
	outputChannel.appendLine(`[Test Script] Resolved program CWD: ${programCwd}`)

	const launchArgs = {
		program: programPath, // Use absolute path
		stopOnEntry: true,
		cwd: programCwd, // Explicitly set CWD
	}

	const launchToolUseBlock: DebugToolUse = {
		type: "tool_use",
		partial: false,
		name: "debug", // Stays "debug" for direct calls to debugTool
		params: {
			debug_operation: "launch",
			program: launchArgs.program,
			stopOnEntry: String(launchArgs.stopOnEntry), // Ensure boolean is string
			cwd: launchArgs.cwd, // Add cwd
		},
	}

	outputChannel.appendLine(`Attempting to run debugTool with: ${stringifySafe(launchToolUseBlock)}`)

	// 3. Call debugTool from Debugging-roo-code
	try {
		await debugTool(mockTask, launchToolUseBlock, mockAskApproval, mockHandleError, mockPushToolResult)
		outputChannel.appendLine("debugTool execution finished for LAUNCH.")

		// 4. Set a breakpoint
		outputChannel.appendLine("--- Attempting to set breakpoint ---")
		const setBreakpointToolUseBlock: DebugToolUse = {
			type: "tool_use",
			partial: false,
			name: "debug", // Stays "debug"
			params: {
				debug_operation: "set_breakpoint",
				path: programPath,
				line: "5", // Ensure number is string
			},
		}
		outputChannel.appendLine(`Attempting to run debugTool with: ${stringifySafe(setBreakpointToolUseBlock)}`)
		await debugTool(mockTask, setBreakpointToolUseBlock, mockAskApproval, mockHandleError, mockPushToolResult)
		outputChannel.appendLine("debugTool execution finished for SET BREAKPOINTS.")

		// 5. Get stack trace
		outputChannel.appendLine("--- Attempting to get stack trace ---")
		const stackTraceToolUseBlock: DebugToolUse = {
			type: "tool_use",
			partial: false,
			name: "debug", // Stays "debug"
			params: {
				debug_operation: "stack_trace",
				// No additional params needed for stack_trace
			},
		}
		outputChannel.appendLine(`Attempting to run debugTool with: ${stringifySafe(stackTraceToolUseBlock)}`)
		await debugTool(mockTask, stackTraceToolUseBlock, mockAskApproval, mockHandleError, mockPushToolResult)
		outputChannel.appendLine("debugTool execution finished for STACK TRACE.")

		// 6. Next (step over)
		outputChannel.appendLine("--- Attempting to execute next (step over) ---")
		const nextToolUseBlock: DebugToolUse = {
			type: "tool_use",
			partial: false,
			name: "debug", // Stays "debug"
			params: {
				debug_operation: "next",
				// No additional params needed for next
			},
		}
		outputChannel.appendLine(`Attempting to run debugTool with: ${stringifySafe(nextToolUseBlock)}`)
		await debugTool(mockTask, nextToolUseBlock, mockAskApproval, mockHandleError, mockPushToolResult)
		outputChannel.appendLine("debugTool execution finished for NEXT.")
	} catch (error: any) {
		outputChannel.appendLine(`--- Test FAILED with an unhandled exception from debugTool: ${error.message} ---`)
		outputChannel.appendLine(`Error details: ${error.stack || stringifySafe(error)}`)
	} finally {
		outputChannel.appendLine("================================================================")
		outputChannel.appendLine("--- Direct DebugTool Launch, Breakpoint, Stack Trace, and Next Test Finished ---")
		outputChannel.appendLine("================================================================")
	}
}

// To run this test script (within Debugging-roo-code project):
// 1. Ensure this file (directDebugToolLaunchTest.ts) is compiled as part of your
//    Debugging-roo-code extension (e.g., included in your tsconfig.json).
//    The output should typically go to a 'dist' or 'out' folder.
//
// 2. In your Debugging-roo-code extension's main activation file (e.g., src/extension.ts),
//    register a VS Code command that will execute this test function.
//
//    Example for your Debugging-roo-code/src/extension.ts:
//    --------------------------------------------------------------------------------
//    import * as vscode from 'vscode';
//    import { runDirectDebugToolLaunchTest } from './test-scripts/directDebugToolLaunchTest'; // Adjust path
//
//    export function activate(context: vscode.ExtensionContext) {
//        // ... your other activation code ...
//
//        let disposableTestRunner = vscode.commands.registerCommand('debugging-roo-code.runDirectLaunchTest', () => {
//            runDirectDebugToolLaunchTest();
//        });
//        context.subscriptions.push(disposableTestRunner);
//
//        // ... your other activation code ...
//    }
//    --------------------------------------------------------------------------------
//
// 3. Run your Debugging-roo-code extension from VS Code (e.g., by pressing F5,
//    which usually starts an Extension Development Host).
//
// 4. In the new VS Code window (the Extension Development Host) that opens:
//    a. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P).
//    b. Type and run the command you registered (e.g., "Debugging Roo Code: Run Direct Launch Test").
//
// 5. Observe the output in the "Direct DebugTool Launch Test (DRC)" output channel.
//    This output will show what the debugTool reported via the pushToolResult callback.
