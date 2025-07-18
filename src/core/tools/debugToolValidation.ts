import {
	LaunchParams,
	// We're now using 'any' type for these parameters since we're handling flat XML structure
	// and transforming them into the expected structure
	// SetBreakpointParams,
	JumpParams,
	UntilParams,
	ListSourceParams,
	GetSourceParams,
	GetStackFrameVariablesParams,
	EvaluateParams,
	ExecuteStatementParams,
	GotoFrameParams,
	// RemoveBreakpointParams,
	// ToggleBreakpointParams,
	// IgnoreBreakpointParams,
	// SetBreakpointConditionParams,
	// These are the expected structures after XML parsing and assignment to operationArgs
	// The XML tags should correspond to these property names.
} from "../../zentara_debug"

export interface ValidationError {
	isValid: false
	message: string
	transformedArgs?: any // Optional transformed arguments even in error case
}

export interface ValidationSuccess {
	isValid: true
	transformedArgs: any // Always include transformed arguments on success
}

export type ValidationResult = ValidationSuccess | ValidationError

// Helper to ensure a value is an array, useful for XML elements that can be single or multiple
function ensureArray<T>(value: T | T[] | undefined): T[] {
	if (value === undefined) {
		return []
	}
	if (Array.isArray(value)) {
		return value
	}
	return [value]
}

// Helper to check if a value is a non-empty string
function isNonEmptyString(value: any): value is string {
	return typeof value === "string" && value.trim() !== ""
}

// Helper to check if a value is a number
function isNumber(value: any): value is number {
	return typeof value === "number" && !isNaN(value)
}

// Helper to check if a value is a boolean
function isBoolean(value: any): value is boolean {
	return typeof value === "boolean"
}

export function validateOperationArgs(operation: string, args: any): ValidationResult {
	// args is now the object parsed from XML
	// Ensure args is an object, even if XML was empty or contained only a primitive
	if (typeof args !== "object" || args === null) {
		args = {} // Default to empty object if not already one
	}

	switch (operation) {
		case "launch": {
			// Expected XML structure for args (inside <arguments> tag or as root if no such tag):
			// <program>/path/to/file</program>
			// <mode>debug</mode> (optional)
			// <arg>arg1</arg> (optional, multiple)
			// <arg>arg2</arg>
			// <cwd>/path/to/cwd</cwd> (optional)
			// <env><KEY1>VAL1</KEY1><KEY2>VAL2</KEY2></env> (optional)
			// <stopOnEntry /> or <stopOnEntry>true</stopOnEntry> (optional)
			// <configName>Config Name</configName> (optional)
			const params: LaunchParams = args // For type checking properties that align with LaunchParams

			// Either program or configName must be provided, but not necessarily both
			if (!isNonEmptyString(params.program) && !isNonEmptyString(params.configName)) {
				return {
					isValid: false,
					message: "Missing both 'program' and 'configName'. At least one must be provided for launch operation.",
				}
			}
			if (params.mode !== undefined && !isNonEmptyString(params.mode)) {
				return {
					isValid: false,
					message: "Invalid 'mode' (string, optional) for launch operation. Expected <mode> tag.",
				}
			}

			// Validate 'args' directly from the parsed JSON object (params.args)
			// LaunchParams expects 'args?: string[]'
			if (params.args !== undefined) {
				if (!Array.isArray(params.args) || !params.args.every(isNonEmptyString)) {
					return {
						isValid: false,
						message:
							'Invalid \'args\' (array of non-empty strings, optional) for launch operation. Expected JSON format: "args": ["arg1", "arg2"]',
					}
				}
			}
			// The 'arg' property (from old XML format) is no longer expected.
			// If the LLM sends "arg", it will be ignored unless LaunchParams includes it, which it shouldn't for the new JSON approach.

			if (params.cwd !== undefined && !isNonEmptyString(params.cwd)) {
				return {
					isValid: false,
					message: "Invalid 'cwd' (string, optional) for launch operation. Expected <cwd> tag.",
				}
			}
			if (
				params.env !== undefined &&
				(typeof params.env !== "object" || params.env === null || Array.isArray(params.env))
			) {
				return {
					isValid: false,
					message:
						"Invalid 'env' (object, optional) for launch operation. Expected <env><KEY>VAL</KEY></env> structure.",
				}
			}
			if (params.stopOnEntry !== undefined && !isBoolean(params.stopOnEntry)) {
				return {
					isValid: false,
					message:
						"Invalid 'stopOnEntry' (boolean, optional) for launch operation. Expected <stopOnEntry/> or <stopOnEntry>true/false</stopOnEntry>.",
				}
			}
			if (params.configName !== undefined && !isNonEmptyString(params.configName)) {
				return {
					isValid: false,
					message: "Invalid 'configName' (string, optional) for launch operation. Expected a non-empty string.",
				}
			}
			return { isValid: true, transformedArgs: params }
		}

		case "set_breakpoint":
		case "set_temp_breakpoint": {
			// Expected XML:
			// <path>/path/to/file</path>
			// <line>10</line>
			// <column>5</column> (optional)
			// <condition>i > 5</condition> (optional)
			// <hitCondition>% 2 == 0</hitCondition> (optional)
			// <logMessage>Value is {i}</logMessage> (optional)
			const params: any = args

			// Create location object if it doesn't exist
			if (typeof params.location !== "object" || params.location === null) {
				params.location = {}
			}

			// If path and line are at the top level, move them to the location object
			if (isNonEmptyString(params.path)) {
				params.location.path = params.path
				delete params.path
			}

			if (isNumber(params.line)) {
				params.location.line = params.line
				delete params.line
			}

			if (params.column !== undefined && isNumber(params.column)) {
				params.location.column = params.column
				delete params.column
			}

			// Now validate the location object
			// Path is optional; if provided, it must be a non-empty string.
			if (params.location.path !== undefined && !isNonEmptyString(params.location.path)) {
				return {
					isValid: false,
					message: `Invalid 'path' (string, optional) for ${operation} operation. If provided, it must be a non-empty string. Expected <path> tag or inferred from active editor.`,
				}
			}
			// Line is always required for these operations.
			if (!isNumber(params.location.line)) {
				return {
					isValid: false,
					message: `Missing or invalid 'line' (number) for ${operation} operation. Expected <line> tag.`,
				}
			}
			if (params.location.column !== undefined && !isNumber(params.location.column)) {
				return {
					isValid: false,
					message: `Invalid 'column' (number, optional) for ${operation} operation. Expected <column> tag.`,
				}
			}
			if (params.condition !== undefined && !isNonEmptyString(params.condition)) {
				return {
					isValid: false,
					message: `Invalid 'condition' (string, optional) for ${operation} operation. Expected <condition> tag.`,
				}
			}
			if (params.hitCondition !== undefined && !isNonEmptyString(params.hitCondition)) {
				return {
					isValid: false,
					message: `Invalid 'hitCondition' (string, optional) for ${operation} operation. Expected <hitCondition> tag.`,
				}
			}
			if (params.logMessage !== undefined && !isNonEmptyString(params.logMessage)) {
				return {
					isValid: false,
					message: `Invalid 'logMessage' (string, optional) for ${operation} operation. Expected <logMessage> tag.`,
				}
			}
			return { isValid: true, transformedArgs: params }
		}
		case "remove_all_breakpoints_in_file": {
			const params: any = args

			// Create location object if it doesn't exist
			if (typeof params.location !== "object" || params.location === null) {
				params.location = {}
			}

			// If path is at the top level, move it to the location object
			if (isNonEmptyString(params.path)) {
				params.location.path = params.path
				delete params.path
			}
			// Line and column are not used/validated for remove_all_breakpoints_in_file

			// Now validate the location object
			// Path is optional; if provided, it must be a non-empty string.
			if (params.location.path !== undefined && !isNonEmptyString(params.location.path)) {
				return {
					isValid: false,
					message: `Invalid 'path' (string, optional) for ${operation} operation. If provided, it must be a non-empty string. Expected <path> tag or inferred from active editor.`,
				}
			}
			return { isValid: true, transformedArgs: params }
		}

		case "remove_breakpoint": {
			const params: any = args

			// Create location object if it doesn't exist
			if (typeof params.location !== "object" || params.location === null) {
				params.location = {}
			}

			// If path and line are at the top level, move them to the location object
			if (isNonEmptyString(params.path)) {
				params.location.path = params.path
				delete params.path
			}

			if (isNumber(params.line)) {
				params.location.line = params.line
				delete params.line
			}

			if (params.column !== undefined && isNumber(params.column)) {
				params.location.column = params.column
				delete params.column
			}

			// Now validate the location object
			// Path is optional; if provided, it must be a non-empty string.
			if (params.location.path !== undefined && !isNonEmptyString(params.location.path)) {
				return {
					isValid: false,
					message: `Invalid 'path' (string, optional) for ${operation} operation. If provided, it must be a non-empty string. Expected <path> tag or inferred from active editor.`,
				}
			}
			// Line is always required for remove_breakpoint.
			if (!isNumber(params.location.line)) {
				return {
					isValid: false,
					message: `Missing or invalid 'line' (number) for ${operation} operation. Expected <line> tag.`,
				}
			}
			if (params.location.column !== undefined && !isNumber(params.location.column)) {
				return {
					isValid: false,
					message: `Invalid 'column' (number, optional) for ${operation} operation. Expected <column> tag.`,
				}
			}
			return { isValid: true, transformedArgs: params }
		}

		case "disable_breakpoint":
		case "enable_breakpoint": {
			const params: any = args

			// Create location object if it doesn't exist
			if (typeof params.location !== "object" || params.location === null) {
				params.location = {}
			}

			// If path and line are at the top level, move them to the location object
			if (isNonEmptyString(params.path)) {
				params.location.path = params.path
				delete params.path
			}

			if (isNumber(params.line)) {
				params.location.line = params.line
				delete params.line
			}

			if (params.column !== undefined && isNumber(params.column)) {
				params.location.column = params.column
				delete params.column
			}

			// Now validate the location object
			// Path is optional; if provided, it must be a non-empty string.
			if (params.location.path !== undefined && !isNonEmptyString(params.location.path)) {
				return {
					isValid: false,
					message: `Invalid 'path' (string, optional) for ${operation} operation. If provided, it must be a non-empty string. Expected <path> tag or inferred from active editor.`,
				}
			}
			// Line is always required.
			if (!isNumber(params.location.line)) {
				return {
					isValid: false,
					message: `Missing or invalid 'line' (number) for ${operation} operation. Expected <line> tag.`,
				}
			}
			if (params.location.column !== undefined && !isNumber(params.location.column)) {
				return {
					isValid: false,
					message: `Invalid 'column' (number, optional) for ${operation} operation. Expected <column> tag.`,
				}
			}
			return { isValid: true, transformedArgs: params }
		}

		case "jump": {
			// <frameId>0</frameId>
			// <line>20</line>
			const params: JumpParams = args
			if (params.frameId !== undefined && !isNumber(params.frameId)) {
				return {
					isValid: false,
					message: "Invalid 'frameId' (number, optional) for jump operation. Expected <frameId> tag.",
				}
			}
			if (!isNumber(params.line)) {
				return {
					isValid: false,
					message: "Missing or invalid 'line' (number) for jump operation. Expected <line> tag.",
				}
			}
			return { isValid: true, transformedArgs: params }
		}

		case "until": {
			// <line>25</line>
			const params: UntilParams = args
			if (!isNumber(params.line)) {
				return {
					isValid: false,
					message: "Missing or invalid 'line' (number) for until operation. Expected <line> tag.",
				}
			}
			return { isValid: true, transformedArgs: params }
		}

		case "ignore_breakpoint": {
			const params: any = args

			// Create location object if it doesn't exist
			if (typeof params.location !== "object" || params.location === null) {
				params.location = {}
			}

			// If path and line are at the top level, move them to the location object
			if (isNonEmptyString(params.path)) {
				params.location.path = params.path
				delete params.path
			}

			if (isNumber(params.line)) {
				params.location.line = params.line
				delete params.line
			}

			if (params.column !== undefined && isNumber(params.column)) {
				params.location.column = params.column
				delete params.column
			}

			// Now validate the location object
			// Path is optional; if provided, it must be a non-empty string.
			if (params.location.path !== undefined && !isNonEmptyString(params.location.path)) {
				return {
					isValid: false,
					message: `Invalid 'path' (string, optional) for ${operation} operation. If provided, it must be a non-empty string. Expected <path> tag or inferred from active editor.`,
				}
			}
			// Line is always required.
			if (!isNumber(params.location.line)) {
				return {
					isValid: false,
					message: `Missing or invalid 'line' (number) for ${operation} operation. Expected <line> tag.`,
				}
			}
			if (params.ignoreCount !== undefined && params.ignoreCount !== null && !isNumber(params.ignoreCount)) {
				return {
					isValid: false,
					message: "Invalid 'ignoreCount' (number or null, optional) for ignore_breakpoint operation.",
				}
			}
			return { isValid: true, transformedArgs: params }
		}

		case "set_breakpoint_condition": {
			const params: any = args

			// Create location object if it doesn't exist
			if (typeof params.location !== "object" || params.location === null) {
				params.location = {}
			}

			// If path and line are at the top level, move them to the location object
			if (isNonEmptyString(params.path)) {
				params.location.path = params.path
				delete params.path
			}

			if (isNumber(params.line)) {
				params.location.line = params.line
				delete params.line
			}

			if (params.column !== undefined && isNumber(params.column)) {
				params.location.column = params.column
				delete params.column
			}

			// Now validate the location object
			// Path is optional; if provided, it must be a non-empty string.
			if (params.location.path !== undefined && !isNonEmptyString(params.location.path)) {
				return {
					isValid: false,
					message: `Invalid 'path' (string, optional) for ${operation} operation. If provided, it must be a non-empty string. Expected <path> tag or inferred from active editor.`,
				}
			}
			// Line is always required.
			if (!isNumber(params.location.line)) {
				return {
					isValid: false,
					message: `Missing or invalid 'line' (number) for ${operation} operation. Expected <line> tag.`,
				}
			}
			if (params.condition !== undefined && params.condition !== null && !isNonEmptyString(params.condition)) {
				// Allow empty string for condition to clear it
				if (typeof params.condition !== "string") {
					return {
						isValid: false,
						message:
							"Invalid 'condition' (string or null, optional) for set_breakpoint_condition operation.",
					}
				}
			}
			return { isValid: true, transformedArgs: params }
		}

		case "list_source": {
			// <frameId>0</frameId>
			// <linesAround>5</linesAround> (optional)
			const params: ListSourceParams = args
			if (params.frameId !== undefined && !isNumber(params.frameId)) {
				return { isValid: false, message: "Invalid 'frameId' (number, optional) for list_source operation." }
			}
			if (params.linesAround !== undefined && !isNumber(params.linesAround)) {
				return {
					isValid: false,
					message: "Invalid 'linesAround' (number, optional) for list_source operation.",
				}
			}
			return { isValid: true, transformedArgs: params }
		}

		case "get_source": {
			// <frameId>0</frameId>
			// <expression>myVar</expression>
			const params: GetSourceParams = args
			if (params.frameId !== undefined && !isNumber(params.frameId)) {
				return { isValid: false, message: "Invalid 'frameId' (number, optional) for get_source operation." }
			}
			if (!isNonEmptyString(params.expression)) {
				return { isValid: false, message: "Missing or invalid 'expression' (string) for get_source operation." }
			}
			return { isValid: true, transformedArgs: params }
		}

		case "get_stack_frame_variables": {
			// <frameId>0</frameId>
			// <scopeFilter>Local</scopeFilter> (optional, multiple)
			// <scopeFilter>Arguments</scopeFilter>
			const params: GetStackFrameVariablesParams = args
			if (params.frameId !== undefined && !isNumber(params.frameId)) {
				return {
					isValid: false,
					message: "Invalid 'frameId' (number, optional) for get_stack_frame_variables operation.",
				}
			}
			const scopeFilters = ensureArray(params.scopeFilter)
			if (
				scopeFilters.length > 0 &&
				!scopeFilters.every(
					(sf: any) =>
						isNonEmptyString(sf) && ["Arguments", "Local", "Closure", "Global", "Registers"].includes(sf),
				)
			) {
				return {
					isValid: false,
					message:
						"Invalid 'scopeFilter' (array of predefined strings, optional) for get_stack_frame_variables operation. Expected <scopeFilter> tags.",
				}
			}
			return { isValid: true, transformedArgs: params }
		}

		case "get_args": {
			// Note: zentara_debug type is { frameId: number }
			// <frameId>0</frameId>
			const params: { frameId?: number } = args // Explicitly type for clarity, frameId is now optional
			if (params.frameId !== undefined && !isNumber(params.frameId)) {
				return { isValid: false, message: "Invalid 'frameId' (number, optional) for get_args operation." }
			}
			return { isValid: true, transformedArgs: params }
		}

		case "evaluate":
		case "pretty_print":
		case "whatis": {
			// <frameId>0</frameId>
			// <expression>myVar</expression>
			// <context>watch</context> (optional: 'watch', 'repl', 'hover')
			const params: EvaluateParams = args
			if (params.frameId !== undefined && !isNumber(params.frameId)) {
				return { isValid: false, message: `Invalid 'frameId' (number, optional) for ${operation} operation.` }
			}
			if (!isNonEmptyString(params.expression)) {
				return {
					isValid: false,
					message: `Missing or invalid 'expression' (string) for ${operation} operation.`,
				}
			}
			if (
				params.context !== undefined &&
				(!isNonEmptyString(params.context) || !["watch", "repl", "hover"].includes(params.context))
			) {
				return {
					isValid: false,
					message: `Invalid 'context' (string, optional: 'watch', 'repl', 'hover') for ${operation} operation.`,
				}
			}
			return { isValid: true, transformedArgs: params }
		}

		case "execute_statement": {
			// <frameId>0</frameId>
			// <statement>x = 10</statement>
			const params: ExecuteStatementParams = args
			if (params.frameId !== undefined && !isNumber(params.frameId)) {
				return {
					isValid: false,
					message: "Invalid 'frameId' (number, optional) for execute_statement operation.",
				}
			}
			if (!isNonEmptyString(params.statement)) {
				return {
					isValid: false,
					message: "Missing or invalid 'statement' (string) for execute_statement operation.",
				}
			}
			return { isValid: true, transformedArgs: params }
		}

		case "goto_frame": {
			// <frameId>0</frameId>
			const params: GotoFrameParams = args
			if (params.frameId !== undefined && !isNumber(params.frameId)) {
				return { isValid: false, message: "Invalid 'frameId' (number, optional) for goto_frame operation." }
			}
			return { isValid: true, transformedArgs: params }
		}

		case "restart":
		case "quit":
		case "continue":
		case "next":
		case "step_in":
		case "step_out":
		case "get_active_breakpoints":
		case "stack_trace":
		case "up":
		case "down":
		case "get_last_stop_info":
			// For operations without specific validation, we still use the original args
			// This ensures we don't lose any parameters that might be needed
			return { isValid: true, transformedArgs: args }

		default:
			// This case should ideally not be reached if all operations are covered.
			// If an operation is not listed, we assume its arguments (if any) don't need validation here,
			// or it's an unknown operation which debugTool.ts itself will handle.
			// For unknown operations, we still use the original args
			return { isValid: true, transformedArgs: args }
	}
}
