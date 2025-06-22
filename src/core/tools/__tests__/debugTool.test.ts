jest.mock("vscode")
import { debugTool } from "../debugTool"
// We are NOT mocking '../../../zentara_debug' to attempt to use the real controller
import type { LaunchParams } from "../../../zentara_debug" // Assuming LaunchParams is exported from zentara_debug/index.ts
import type { DebugToolUse, AskApproval, HandleError, PushToolResult } from "../../../shared/tools"
import type { Task } from "../../../core/task/Task"

// Mock the necessary parts of the vscode API to prevent crashes
jest.mock(
	"vscode",
	() => ({
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
			showInformationMessage: jest.fn(),
			showErrorMessage: jest.fn(),
			// Add other vscode APIs if they cause crashes during test execution
		},
		debug: {
			startDebugging: jest.fn(),
			onDidStartDebugSession: jest.fn(() => ({ dispose: jest.fn() })),
			onDidTerminateDebugSession: jest.fn(() => ({ dispose: jest.fn() })),
			onDidReceiveDebugSessionCustomEvent: jest.fn(() => ({ dispose: jest.fn() })),
			registerDebugAdapterTrackerFactory: jest.fn(() => ({ dispose: jest.fn() })),
			// Mock other vscode.debug properties/methods if needed
		},
		workspace: {
			getConfiguration: jest.fn(() => ({
				get: jest.fn((key: string) => {
					if (key === "zentaraDebug.pythonPath") return "python" // Provide a default python path
					if (key === "zentaraDebug.logLevel") return "info" // Default log level
					return undefined
				}),
			})),
			workspaceFolders: [{ uri: { fsPath: "/mock/workspace" } }], // Mock workspace folder
			fs: {
				// Mock vscode.workspace.fs if used by the controller, e.g. for reading launch.json
				readFile: jest.fn(),
				// ... other fs methods
			},
		},
		Uri: {
			file: jest.fn((path) => ({ fsPath: path, scheme: "file" })), // Mock Uri.file
			parse: jest.fn((path) => ({ fsPath: path, scheme: "file" })), // Mock Uri.parse
		},
		// Add other top-level vscode namespaces if needed
	}),
	{ virtual: true },
)

describe("debugTool", () => {
	let mockTask: Task
	let mockAskApproval: jest.MockedFunction<AskApproval>
	let mockHandleError: jest.MockedFunction<HandleError>
	let mockPushToolResult: jest.MockedFunction<PushToolResult>

	beforeEach(() => {
		// Clear all mocks, including any implicit ones from a potential global vscode mock
		jest.clearAllMocks()

		mockTask = {
			consecutiveMistakeCount: 0,
			recordToolError: jest.fn(),
			sayAndCreateMissingParamError: jest.fn().mockResolvedValue("Missing param error message for test"),
		} as unknown as Task

		mockAskApproval = jest.fn()
		mockHandleError = jest.fn()
		mockPushToolResult = jest.fn()
	})

	describe("launch operation with stopOnEntry:true (attempting real response)", () => {
		it("should attempt to launch python script with stopOnEntry:true and capture the response/error", async () => {
			const launchArgs: LaunchParams = {
				program: "testdata/sample_debug_program.py", // Path relative to workspace root
				stopOnEntry: true,
				// Ensure no 'configName' is specified to use dynamic configuration
			}
			const toolUse: DebugToolUse = {
				type: "tool_use",
				partial: false,
				name: "debug",
				params: {
					debug_operation: "launch",
					program: launchArgs.program,
					stopOnEntry: String(launchArgs.stopOnEntry),
				},
			}

			mockAskApproval.mockResolvedValueOnce(true) // Assume user approves the operation

			let capturedResultFromPush: any
			let capturedErrorFromHandleError: any

			mockPushToolResult.mockImplementation((result) => {
				console.log("[TEST CAPTURE] pushToolResult called with:", result)
				capturedResultFromPush = result
			})
			mockHandleError.mockImplementation(async (action, error) => {
				// Made async
				console.log("[TEST CAPTURE] handleError called for action:", action, "with error:", error)
				capturedErrorFromHandleError = error
				// Note: debugTool's own catch blocks for controller errors also call pushToolResult
				// No explicit return needed as async functions return Promise<void> by default if nothing is returned
			})

			console.log("[TEST INFO] About to call debugTool. Expecting real vsCodeDebugController.launch.")
			await debugTool(mockTask, toolUse, mockAskApproval, mockHandleError, mockPushToolResult)

			expect(mockAskApproval).toHaveBeenCalledTimes(1)
			// debugTool should always call pushToolResult, either with a success/data payload
			// or with a formatted error message from its own logic or from handleError.
			expect(mockPushToolResult).toHaveBeenCalledTimes(1)

			console.log("----------------------------------------------------------------------")
			console.log("[TEST RESULT] Captured by pushToolResult:")
			console.log(capturedResultFromPush)
			console.log("----------------------------------------------------------------------")

			if (capturedErrorFromHandleError) {
				console.error("[TEST RESULT] Captured by handleError:", capturedErrorFromHandleError)
				console.log("----------------------------------------------------------------------")
			}

			// --- Flexible Assertions ---
			// The goal is to see what the "real" response is.
			// If capturedResultFromPush is a string, try to parse it as JSON.
			let resultData: any
			if (typeof capturedResultFromPush === "string") {
				try {
					resultData = JSON.parse(capturedResultFromPush)
				} catch (e) {
					console.warn(
						"[TEST INFO] pushToolResult content was not valid JSON. Content:",
						capturedResultFromPush,
					)
					resultData = capturedResultFromPush // Keep as string if not JSON
				}
			} else {
				resultData = capturedResultFromPush // Keep as is if not string
			}

			// If the launch was successful and it stopped, we expect 'success: true' and 'stoppedDetails'.
			// This depends heavily on the test environment's VS Code API mocks or actual debug capabilities.
			if (resultData && resultData.success === true && resultData.stoppedDetails) {
				console.log("[TEST INFO] Launch reported success and stoppedDetails are present.")
				expect(resultData.stoppedDetails.reason).toBeDefined() // e.g., 'entry', 'step'
				expect(resultData.stoppedDetails.frame).toBeDefined()
				expect(resultData.stoppedDetails.frame.source).toBeDefined()
				// Path might be absolute in a real scenario, so check for containment.
				expect(resultData.stoppedDetails.frame.source.path).toContain("sample_debug_program.py")
				expect(resultData.stoppedDetails.frame.line).toBe(1) // Expect to stop at line 1 for entry
			} else if (resultData && resultData.success === false) {
				console.warn("[TEST INFO] Launch reported failure. Details:", resultData)
			} else if (typeof resultData === "string" && resultData.toLowerCase().includes("error")) {
				console.warn("[TEST INFO] pushToolResult received an error message string:", resultData)
			} else {
				console.log(
					'[TEST INFO] pushToolResult received data, but not in the expected "success with stoppedDetails" format or known error format. Data:',
					resultData,
				)
			}
			// Add a baseline assertion that something was pushed.
			expect(capturedResultFromPush).toBeDefined()
		})
	})
})
