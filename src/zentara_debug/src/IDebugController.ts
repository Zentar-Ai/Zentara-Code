import * as vscode from "vscode" // Added for vscode.Event

// --- Basic Types ---

export interface SourceLocation {
	path: string
	line: number // 1-based line number
	column?: number // 1-based column number
}

export interface BreakpointInfo {
	id?: number // Debug adapter breakpoint ID (if available)
	verified: boolean
	location: SourceLocation
	condition?: string
	hitCondition?: string // e.g., "3" for hit count
	logMessage?: string // For logpoints
}

export interface StackFrameInfo {
	id: number // Frame ID from debug adapter
	name: string // e.g., function name
	sourcePath: string
	line: number // 1-based line number
	column: number // 1-based column number
}

export interface ScopeInfo {
	name: string // e.g., "Local", "Closure", "Global"
	variablesReference: number // Reference ID to fetch variables
	expensive: boolean
}

export interface VariableInfo {
	name: string
	value: string
	type?: string
	variablesReference: number // 0 if no children, >0 if expandable
}

// --- Input Parameter Types ---

export interface LaunchParams {
	[key: string]: any // Allow any other debug configuration properties
	program?: string // Path to the program to launch. Can be optional if using configName or for attach requests.
	args?: string[]
	cwd?: string
	env?: { [key: string]: string | null }
	configName?: string // Optional name of a launch configuration in launch.json
	stopOnEntry?: boolean // Whether to stop at the entry point of the program
	mode?: string // Optional mode (e.g., 'pytest')
	type?: string // e.g., 'python', 'node'
	request?: "launch" | "attach"
}

export interface SetBreakpointParams {
	location: SourceLocation
	condition?: string
	hitCondition?: string
	logMessage?: string
}

export interface RemoveBreakpointParams {
	location: SourceLocation // Identify breakpoint by location
}

export interface RemoveAllBreakpointsInFileParams {
	filePath: string
}

export interface ToggleBreakpointParams {
	location: SourceLocation // Identify breakpoint by location
	enable: boolean
}

export interface IgnoreBreakpointParams {
	location: SourceLocation // Identify breakpoint by location
	ignoreCount: number | null // null to remove ignore count
}

export interface SetBreakpointConditionParams {
	location: SourceLocation // Identify breakpoint by location
	condition: string | null // null to remove condition
}

export interface JumpParams {
	frameId?: number // Requires frameId from stackTrace, now optional
	line: number // 1-based line number to jump to
}

export interface UntilParams {
	line: number // 1-based line number to run until
}

export interface ListSourceParams {
	frameId?: number // Requires frameId from stackTrace, now optional
	linesAround?: number // How many lines before/after to show (e.g., 10)
}

export interface GetSourceParams {
	frameId?: number // Requires frameId from stackTrace, now optional
	expression: string // Expression evaluating to the object/function
}

export interface GetStackFrameVariablesParams {
	frameId?: number // Requires frameId from stackTrace, now optional
	scopeFilter?: ("Arguments" | "Local" | "Closure" | "Global" | "Registers")[] // Optional filter
}

export interface EvaluateParams {
	frameId?: number // Requires frameId from stackTrace, now optional
	expression: string
	context?: "watch" | "repl" | "hover" // DAP context
}

export interface WatchParams {
	frameId?: number // Requires frameId from stackTrace, now optional
	expression: string
}

export interface UnwatchParams {
	expression: string // Expression to remove from watch
}

export interface ExecuteStatementParams {
	frameId?: number // Requires frameId from stackTrace, now optional
	statement: string
}

export interface GotoFrameParams {
	frameId?: number // Target frame ID from stackTrace, now optional
}

// --- Return Value Types ---

export interface LaunchResult {
	success: boolean
	sessionId?: string
	errorMessage?: string
	frame?: StackFrameInfo
	exceptionMessage?: string
	stopReason?: string // Added from NavigationResult
	capturedDapOutput?: string // Added from NavigationResult
	capturedRawTerminalOutput?: string // Added from NavigationResult
}

export interface DebuggerResponse {
	success: boolean
	errorMessage?: string
}

export interface GetLastStopInfoResult extends DebuggerResponse {
	sessionId?: string
	stopInfo?: any
}

export interface NavigationResult extends DebuggerResponse {
	frame?: StackFrameInfo
	exceptionMessage?: string
	stopReason?: string // e.g., 'breakpoint', 'step', 'exception'
	capturedDapOutput?: string
	capturedRawTerminalOutput?: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SetBreakpointResult extends DebuggerResponse {
	// No specific fields beyond success/error
}

export interface StackTraceResult extends DebuggerResponse {
	frames: StackFrameInfo[]
	totalFrames?: number
}

export interface ListSourceResult extends DebuggerResponse {
	sourceCode?: string
	currentLine?: number
}

export interface GetSourceResult extends DebuggerResponse {
	sourcePath?: string
	line?: number
}

export interface GetActiveBreakpointsResult extends DebuggerResponse {
	breakpoints: BreakpointInfo[]
}

export interface GetStackFrameVariablesResult extends DebuggerResponse {
	scopes: {
		name: string
		variables: VariableInfo[]
	}[]
}

export interface EvaluateResult extends DebuggerResponse {
	result: string
	type?: string
	variablesReference: number
}

export interface GetReturnValueResult extends DebuggerResponse {
	value?: string
}

// --- The Controller Interface ---

export interface IDebugController {
	// Session Management
	launch(params: LaunchParams): Promise<LaunchResult>
	restart(): Promise<DebuggerResponse>
	quit(): Promise<DebuggerResponse>

	// Execution Control
	continue(): Promise<NavigationResult>
	next(): Promise<NavigationResult>
	stepIn(): Promise<NavigationResult>
	stepOut(): Promise<NavigationResult>
	jump(params: JumpParams): Promise<NavigationResult>
	until(params: UntilParams): Promise<NavigationResult>

	// Breakpoint Management
	setBreakpoint(params: SetBreakpointParams): Promise<SetBreakpointResult>
	setTempBreakpoint(params: SetBreakpointParams): Promise<SetBreakpointResult>
	removeBreakpointByLocation(params: RemoveBreakpointParams): Promise<DebuggerResponse>
	removeAllBreakpointsInFile(params: RemoveAllBreakpointsInFileParams): Promise<DebuggerResponse> // Added this line
	disableBreakpoint(params: ToggleBreakpointParams): Promise<DebuggerResponse>
	enableBreakpoint(params: ToggleBreakpointParams): Promise<DebuggerResponse>
	ignoreBreakpoint(params: IgnoreBreakpointParams): Promise<DebuggerResponse>
	setBreakpointCondition(params: SetBreakpointConditionParams): Promise<DebuggerResponse>
	getActiveBreakpoints(
		waitForLocation?: { path: string; line: number },
		timeoutMs?: number,
	): Promise<GetActiveBreakpointsResult>

	// Code & Stack Inspection
	stackTrace(): Promise<StackTraceResult>
	listSource(params: ListSourceParams): Promise<ListSourceResult>
	up(): Promise<DebuggerResponse>
	down(): Promise<DebuggerResponse>
	gotoFrame(params: GotoFrameParams): Promise<DebuggerResponse>
	getSource(params: GetSourceParams): Promise<GetSourceResult>

	// State Inspection & Evaluation
	getStackFrameVariables(params: GetStackFrameVariablesParams): Promise<GetStackFrameVariablesResult>
	getArgs(params: { frameId?: number }): Promise<GetStackFrameVariablesResult> // frameId is now optional here too
	evaluate(params: EvaluateParams): Promise<EvaluateResult>
	prettyPrint(params: EvaluateParams): Promise<EvaluateResult>
	whatis(params: EvaluateParams): Promise<EvaluateResult>
	executeStatement(params: ExecuteStatementParams): Promise<EvaluateResult>

	// Events
	readonly onDidCaptureDebugOutput: vscode.Event<{
		sessionId: string
		trigger: "stopEvent" | "sessionEnd"
		reason?: string // e.g., from DAP 'stopped' event reason
		dapOutput?: string
		rawTerminalOutput?: string
	}>

	// Status & Information
	getLastStopInfo(): Promise<GetLastStopInfoResult>
}
