// Mock the vscode module BEFORE all other imports
jest.mock("vscode", () => {
	const mockDisposable = { dispose: jest.fn() }
	return {
		window: {
			createOutputChannel: jest.fn(() => ({
				appendLine: jest.fn(),
				show: jest.fn(),
				dispose: jest.fn(),
				clear: jest.fn(),
				hide: jest.fn(),
				name: "mockOutputChannel",
				append: jest.fn(),
				replace: jest.fn(),
			})),
		},
		debug: {
			onDidStartDebugSession: jest.fn(() => mockDisposable),
			onDidTerminateDebugSession: jest.fn(() => mockDisposable),
			onDidReceiveDebugSessionCustomEvent: jest.fn(() => mockDisposable),
			breakpoints: jest.fn(() => []),
			addBreakpoints: jest.fn(),
			removeBreakpoints: jest.fn(),
			startDebugging: jest.fn().mockResolvedValue(true),
			stopDebugging: jest.fn().mockResolvedValue(undefined), // Assuming stopDebugging might be used
			activeDebugSession: undefined, // Mock as initially undefined
			activeDebugConsole: {
				// Mock activeDebugConsole
				appendLine: jest.fn(),
				append: jest.fn(),
			},
		},
		// Add other VS Code API mocks if needed by other imports
		// For example, if commands are used:
		commands: {
			executeCommand: jest.fn(),
			registerCommand: jest.fn(() => mockDisposable),
		},
		Uri: {
			parse: jest.fn((path) => ({ fsPath: path, path, scheme: "file" })), // Basic Uri.parse mock
			file: jest.fn((path) => ({ fsPath: path, path, scheme: "file" })), // Basic Uri.file mock
		},
		workspace: {
			getConfiguration: jest.fn(() => ({
				get: jest.fn(),
				update: jest.fn(),
			})),
			workspaceFolders: [], // Mock workspace folders if needed
			fs: {
				// Mock workspace.fs if used for file operations
				readFile: jest.fn(),
				writeFile: jest.fn(),
				delete: jest.fn(),
				stat: jest.fn(),
				readDirectory: jest.fn(),
				createDirectory: jest.fn(),
			},
		},
		// Mock other necessary vscode parts as errors arise
	}
})

import { Task } from "../../task/Task"
import { debugTool } from "../../tools/debugTool"
import type { ToolUse, DebugToolUse, ToolResponse } from "../../../shared/tools"
import type { ClineAsk, ToolProgressStatus } from "@roo-code/types"

// Mock dependencies
jest.mock("../../tools/debugTool")

// As presentAssistantMessage is a large file, we are testing handleIndividualDebugTool.
// To do this, we need to extract it or make it accessible. For now, let's assume it's exported
// or we can test it via a wrapper if it's not directly exportable.
// For this example, let's assume we have a way to invoke it.
// We'll need to simulate the relevant parts of presentAssistantMessage or make handleIndividualDebugTool standalone.

// Placeholder for the actual function if it's not directly exported.
// In a real scenario, you might need to refactor presentAssistantMessage.ts
// to export handleIndividualDebugTool or test it through presentAssistantMessage itself.
async function handleIndividualDebugTool(
	cline: Task,
	block: ToolUse,
	askApproval: (type: ClineAsk, partialMessage?: string, progressStatus?: ToolProgressStatus) => Promise<boolean>,
	handleError: (action: string, error: Error) => Promise<void>,
	pushToolResult: (content: ToolResponse) => void,
): Promise<void> {
	const operationName = block.name.substring("debug_".length)
	const reconstructedBlock: DebugToolUse = {
		type: "tool_use",
		name: "debug",
		params: {
			...block.params,
			debug_operation: operationName,
		},
		partial: block.partial,
	}
	// console.log(`[Test] Calling mocked debugTool with: ${JSON.stringify(reconstructedBlock)}`);
	await debugTool(cline, reconstructedBlock, askApproval, handleError, pushToolResult)
}

describe("handleIndividualDebugTool - Invocation Bridge Logic", () => {
	let mockTask: Task
	let mockAskApproval: jest.Mock
	let mockHandleError: jest.Mock
	let mockPushToolResult: jest.Mock

	beforeEach(() => {
		// Reset mocks before each test
		;(debugTool as jest.Mock).mockClear()

		mockAskApproval = jest.fn().mockResolvedValue(true)
		mockHandleError = jest.fn().mockResolvedValue(undefined)
		mockPushToolResult = jest.fn()

		// Mock Task instance
		mockTask = {
			// Populate with minimal required Task properties and mocks
			// This will depend on what debugTool and other functions actually use from Task
			taskId: "test-task",
			instanceId: 1,
			// ... other necessary Task properties or mocks
		} as any // Use 'as any' for simplicity in this example, or create a more complete mock
	})

	it("should correctly transform a debug_launch call and invoke debugTool", async () => {
		const launchToolUse: ToolUse = {
			type: "tool_use",
			name: "debug_launch",
			params: {
				program: "test.py",
				stopOnEntry: "true",
				arg: "--version",
			},
			partial: false,
		}

		await handleIndividualDebugTool(mockTask, launchToolUse, mockAskApproval, mockHandleError, mockPushToolResult)

		expect(debugTool).toHaveBeenCalledTimes(1)
		const calledWithBlock = (debugTool as jest.Mock).mock.calls[0][1] as DebugToolUse

		expect(calledWithBlock.name).toBe("debug")
		expect(calledWithBlock.params.debug_operation).toBe("launch")
		expect(calledWithBlock.params.program).toBe("test.py")
		expect(calledWithBlock.params.stopOnEntry).toBe("true")
		expect(calledWithBlock.params.arg).toBe("--version")
		expect(calledWithBlock.partial).toBe(false)
	})

	it("should correctly transform a debug_set_breakpoint call and invoke debugTool", async () => {
		const setBreakpointToolUse: ToolUse = {
			type: "tool_use",
			name: "debug_set_breakpoint",
			params: {
				path: "src/app.ts",
				line: "42",
				condition: "i > 10",
			},
			partial: false,
		}

		await handleIndividualDebugTool(
			mockTask,
			setBreakpointToolUse,
			mockAskApproval,
			mockHandleError,
			mockPushToolResult,
		)

		expect(debugTool).toHaveBeenCalledTimes(1)
		const calledWithBlock = (debugTool as jest.Mock).mock.calls[0][1] as DebugToolUse

		expect(calledWithBlock.name).toBe("debug")
		expect(calledWithBlock.params.debug_operation).toBe("set_breakpoint")
		expect(calledWithBlock.params.path).toBe("src/app.ts")
		expect(calledWithBlock.params.line).toBe("42")
		expect(calledWithBlock.params.condition).toBe("i > 10")
		expect(calledWithBlock.partial).toBe(false)
	})

	it("should correctly transform a debug_evaluate call with an expression and invoke debugTool", async () => {
		const evaluateToolUse: ToolUse = {
			type: "tool_use",
			name: "debug_evaluate",
			params: {
				expression: "myVar + 10",
				frameId: "1",
				context: "watch",
			},
			partial: false,
		}

		await handleIndividualDebugTool(mockTask, evaluateToolUse, mockAskApproval, mockHandleError, mockPushToolResult)

		expect(debugTool).toHaveBeenCalledTimes(1)
		const calledWithBlock = (debugTool as jest.Mock).mock.calls[0][1] as DebugToolUse

		expect(calledWithBlock.name).toBe("debug")
		expect(calledWithBlock.params.debug_operation).toBe("evaluate")
		expect(calledWithBlock.params.expression).toBe("myVar + 10")
		expect(calledWithBlock.params.frameId).toBe("1")
		expect(calledWithBlock.params.context).toBe("watch")
		expect(calledWithBlock.partial).toBe(false)
	})

	it("should handle a tool call with no extra parameters (e.g., debug_continue)", async () => {
		const continueToolUse: ToolUse = {
			type: "tool_use",
			name: "debug_continue",
			params: {}, // No additional parameters
			partial: false,
		}

		await handleIndividualDebugTool(mockTask, continueToolUse, mockAskApproval, mockHandleError, mockPushToolResult)

		expect(debugTool).toHaveBeenCalledTimes(1)
		const calledWithBlock = (debugTool as jest.Mock).mock.calls[0][1] as DebugToolUse

		expect(calledWithBlock.name).toBe("debug")
		expect(calledWithBlock.params.debug_operation).toBe("continue")
		expect(Object.keys(calledWithBlock.params).length).toBe(1) // Only debug_operation
		expect(calledWithBlock.partial).toBe(false)
	})

	it("should pass through the partial flag correctly", async () => {
		const launchToolUsePartial: ToolUse = {
			type: "tool_use",
			name: "debug_launch",
			params: {
				program: "test.py",
			},
			partial: true, // Testing partial true
		}

		await handleIndividualDebugTool(
			mockTask,
			launchToolUsePartial,
			mockAskApproval,
			mockHandleError,
			mockPushToolResult,
		)

		expect(debugTool).toHaveBeenCalledTimes(1)
		const calledWithBlock = (debugTool as jest.Mock).mock.calls[0][1] as DebugToolUse

		expect(calledWithBlock.name).toBe("debug")
		expect(calledWithBlock.params.debug_operation).toBe("launch")
		expect(calledWithBlock.params.program).toBe("test.py")
		expect(calledWithBlock.partial).toBe(true) // Assert partial is true
	})
})
