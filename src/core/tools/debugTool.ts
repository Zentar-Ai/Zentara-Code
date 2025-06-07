import { Task } from "../task/Task"
import {
	DebugToolUse,
	AskApproval,
	HandleError,
	PushToolResult,
	// ToolResponse, // Not explicitly used for a variable's type
	// Assuming RemoveClosingTag might not be needed for debug tool, but can add if necessary
} from "../../shared/tools"
import { formatResponse } from "../prompts/responses" // For consistent error/result formatting
import { ClineSayTool } from "../../shared/ExtensionMessage" // For type checking with satisfies

import { outputChannel } from "../../zentara_debug/src/vscodeUtils"
import {
	vsCodeDebugController,
	IDebugController,
	ToggleBreakpointParams, // Used in createOperationMap
	// Types are now primarily used in debugToolValidation.ts
} from "../../zentara_debug" // Import from the new index file
import {
    getLastSessionDapOutput,
    getLastSessionRawTerminalOutput
} from "../../zentara_debug/src/controller/session"; // Added for IV.C
import { XMLParser } from "fast-xml-parser" // Added for XML parsing
import { validateOperationArgs } from "./debugToolValidation"

// Type for the operation map values
type DebugOperationFn = (args?: any) => Promise<any>

// Initialize all objects at module level
// This prevents them from being recreated for each function call
// and from being included in the state sent to the webview
const moduleController: IDebugController = vsCodeDebugController
// Create the operation map once at module level
const moduleOperationMap = createOperationMap(moduleController)
// Create XML parser once at module level
const moduleXmlParser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "@_",
	textNodeName: "_text",
	parseTagValue: true,
	parseAttributeValue: true,
})

// Helper to create the operation map with correct 'this' binding
function createOperationMap(controller: IDebugController): Record<string, DebugOperationFn> {
	return {
		launch: controller.launch.bind(controller),
		restart: controller.restart.bind(controller),
		quit: controller.quit.bind(controller),
		continue: controller.continue.bind(controller),
		next: controller.next.bind(controller),
		step_in: controller.stepIn.bind(controller),
		step_out: controller.stepOut.bind(controller),
		jump: controller.jump.bind(controller),
		until: controller.until.bind(controller),
		set_breakpoint: controller.setBreakpoint.bind(controller),
		set_temp_breakpoint: controller.setTempBreakpoint.bind(controller),
		remove_breakpoint: controller.removeBreakpointByLocation.bind(controller),
		remove_all_breakpoints_in_file: controller.removeAllBreakpointsInFile.bind(controller),
		disable_breakpoint: (params: ToggleBreakpointParams) => controller.disableBreakpoint(params), // Explicitly typing for clarity
		enable_breakpoint: (params: ToggleBreakpointParams) => controller.enableBreakpoint(params), // Explicitly typing for clarity
		ignore_breakpoint: controller.ignoreBreakpoint.bind(controller),
		set_breakpoint_condition: controller.setBreakpointCondition.bind(controller),
		get_active_breakpoints: controller.getActiveBreakpoints.bind(controller),
		stack_trace: controller.stackTrace.bind(controller),
		list_source: controller.listSource.bind(controller),
		up: controller.up.bind(controller),
		down: controller.down.bind(controller),
		goto_frame: controller.gotoFrame.bind(controller),
		get_source: controller.getSource.bind(controller),
		get_stack_frame_variables: controller.getStackFrameVariables.bind(controller),
		get_args: controller.getArgs.bind(controller),
		evaluate: controller.evaluate.bind(controller),
		pretty_print: controller.prettyPrint.bind(controller),
		whatis: controller.whatis.bind(controller),
		execute_statement: controller.executeStatement.bind(controller),
		get_last_stop_info: controller.getLastStopInfo.bind(controller),
		// IV.C: Add tools for DAP and Raw Terminal output
		      debug_get_session_dap_output: async (args: { sessionId: string }) => {
		          // These functions are not on IDebugController, but directly exported from session.ts
		          const output = getLastSessionDapOutput(args.sessionId);
		          return { success: true, output: output ?? null }; // Ensure null if undefined
		      },
		      debug_get_session_raw_terminal_output: async (args: { sessionId: string }) => {
		          const output = getLastSessionRawTerminalOutput(args.sessionId);
		          return { success: true, output: output ?? null }; // Ensure null if undefined
		      },
	}
}

export async function debugTool(
	cline: Task,
	block: DebugToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
): Promise<void> {
	const { debug_operation, ...otherParams } = block.params
	// Convert all other params to XML for parsing
	const argsXml = Object.entries(otherParams)
		.map(([key, value]) => `<${key}>${value}</${key}>`)
		.join("\n")
	// Use the module-level controller, operationMap, and xmlParser instead of creating new ones
	// This prevents them from being included in the state sent to the webview

	try {
		//outputChannel.appendLine(`[Debug Tool] Raw tool use block: ${JSON.stringify(block, null, 2)}`)
		outputChannel.appendLine(
			`[Debug Tool] Processing operation '${debug_operation}' with arguments: ${
				Object.keys(otherParams).length > 0 ? JSON.stringify(otherParams, null, 2) : "{}"
			}`,
		)

		if (!debug_operation) {
			cline.consecutiveMistakeCount++
			cline.recordToolError("debug")
			pushToolResult(await cline.sayAndCreateMissingParamError("debug", "debug_operation"))
			return
		}

		// Ask for approval at the beginning, before any large objects are referenced
		// This follows the pattern that works well in other tools
		//outputChannel.appendLine(`[Debug Tool] Preparing approval prompt for '${debug_operation}'.`)

		// Create a properly formatted ClineSayTool JSON string for the approval prompt
		// Following the pattern in readFileTool.ts
		const sharedMessageProps = {
			tool: "debug" as const,
		}

		const completeMessage = JSON.stringify({
			...sharedMessageProps,
			operation: debug_operation,
			content: Object.keys(otherParams).length > 0 ? JSON.stringify(otherParams, null, 2) : "(No arguments)",
		} satisfies ClineSayTool)

		outputChannel.appendLine(`[Debug Tool] Approval prompt prepared: ${completeMessage}`)
		outputChannel.appendLine(`[Debug Tool] About to call askApproval.`)

		let didApprove = false
		try {
			// outputChannel.appendLine(
			// 	`[Debug Tool] Calling askApproval with type "tool" and message: ${completeMessage}`,
			// )
			didApprove = await askApproval("tool", completeMessage)
			//outputChannel.appendLine(`[Debug Tool] askApproval returned: ${didApprove}`)
		} catch (approvalError: any) {
			outputChannel.appendLine(`[ERROR][debugTool] Error during askApproval: ${approvalError.message}`)
			await handleError(`asking approval for debug operation '${debug_operation}'`, approvalError)
			pushToolResult(formatResponse.toolError(`Error asking for approval: ${approvalError.message}`))
			return
		}

		// Add a message to the chat to show what was approved/denied
		if (didApprove) {
			await cline.say("text", `Debug operation approved: ${debug_operation}`)
		} else {
			await cline.say("text", `Debug operation denied: ${debug_operation}`)
		}

		if (!didApprove) {
			// User denied the operation
			pushToolResult(formatResponse.toolError(`User denied debugger operation: ${debug_operation}`))
			return
		}

		// Only proceed with parsing and validation if approval is granted
		let operationArgs: any = {}
		if (argsXml && argsXml.trim() !== "") {
			try {
				// The XML parser typically returns an object where the root tag is the key.
				// With the flat XML structure, we directly use the parsed XML object
				const parsedXml = moduleXmlParser.parse(argsXml)

				// Use the parsed XML directly as operation arguments
				operationArgs = parsedXml

				// Ensure operationArgs is an object, even if XML was empty or only contained a primitive after parsing
				if (typeof operationArgs !== "object" || operationArgs === null) {
					operationArgs = {} // Default to empty object if parsing results in non-object (e.g. empty string)
				}
			} catch (e) {
				await handleError(`parsing XML arguments for debug operation ${debug_operation}`, e as Error)
				pushToolResult(formatResponse.toolError(`Invalid XML provided for arguments: ${(e as Error).message}`))
				return
			}
		}

		// Validate arguments after approval
		//outputChannel.appendLine(`[Debug Tool] About to validate arguments for '${debug_operation}'.`)
		const validation = validateOperationArgs(debug_operation, operationArgs)
		//outputChannel.appendLine(`[Debug Tool] Argument validation completed. Valid: ${validation.isValid}.`)

		if (!validation.isValid) {
			pushToolResult(formatResponse.toolError(validation.message))
			return
		}

		// Use the transformed arguments from the validation result
		const transformedArgs = validation.transformedArgs
		//outputChannel.appendLine(
		//	`[Debug Tool] Using transformed arguments: ${JSON.stringify(transformedArgs, null, 2)}`,
		//)

		const targetMethod: DebugOperationFn | undefined = moduleOperationMap[debug_operation]

		if (targetMethod) {
			try {
				//outputChannel.appendLine(`[Debug Tool] Executing operation '${debug_operation}'...`)

				// Special handling for 'launch' operation to map 'arg' (from XML) to 'args' (expected by controller)
				if (debug_operation === "launch" && transformedArgs.arg !== undefined) {
					const launchArgsArray = Array.isArray(transformedArgs.arg)
						? transformedArgs.arg
						: [transformedArgs.arg]
					transformedArgs.args = launchArgsArray.filter((a: any) => typeof a === "string") // Ensure it's string array
					delete transformedArgs.arg // Remove the original 'arg' property
				}

				// Some methods on IDebugController might not expect any arguments.
				// The `transformedArgs` will be an empty object {} if argsXml is undefined or empty.
				// Methods that don't take arguments will simply ignore the empty object.
				const rawResult = await targetMethod(transformedArgs)

				// Robustly handle the rawResult
				outputChannel.appendLine(
					`[Debug Tool] Operation '${debug_operation}' completed. Result: ${JSON.stringify(rawResult, null, 2)}`,
				)

				if (typeof rawResult === "object" && rawResult !== null) {
					if (rawResult.success === true) {
						// Standard success case: return the full, formatted rawResult.
						pushToolResult(JSON.stringify(rawResult, null, 2))
					} else if (rawResult.success === false) {
						// Standard failure case: return the full rawResult, JSON stringified, to provide all details.
						pushToolResult(
							formatResponse.toolError(
								`Debug operation '${debug_operation}' failed. Details: ${JSON.stringify(rawResult, null, 2)}`,
							),
						)
					} else {
						// Object, but no boolean 'success' field or unexpected value.
						pushToolResult(
							`Debug operation '${debug_operation}' completed with an unusual result structure: ${JSON.stringify(rawResult, null, 2)}`,
						)
					}
				} else {
					// Not an object, or null. Highly unexpected.
					pushToolResult(
						`Debug operation '${debug_operation}' completed with an unexpected non-object result: ${String(rawResult)}`,
					)
				}
			} catch (e) {
				await handleError(`executing debug operation '${debug_operation}'`, e as Error)
				pushToolResult(formatResponse.toolError(`Error during '${debug_operation}': ${(e as Error).message}`))
			}
		} else {
			cline.consecutiveMistakeCount++
			cline.recordToolError("debug")
			pushToolResult(formatResponse.toolError(`Unknown debug operation: ${debug_operation}`))
		}
	} catch (error) {
		// Catch errors from parsing argsJson or other unexpected issues
		await handleError(`debug tool general error for operation '${debug_operation}'`, error as Error)
		pushToolResult(formatResponse.toolError(`Unexpected error in debug tool: ${(error as Error).message}`))
	}
}
