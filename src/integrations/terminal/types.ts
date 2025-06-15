import EventEmitter from "events"

export type ZentaraTerminalProvider = "vscode" | "execa"

export interface ZentaraTerminal {
	provider: ZentaraTerminalProvider
	id: number
	busy: boolean
	running: boolean
	taskId?: string
	process?: ZentaraTerminalProcess
	getCurrentWorkingDirectory(): string
	isClosed: () => boolean
	runCommand: (command: string, callbacks: ZentaraTerminalCallbacks) => ZentaraTerminalProcessResultPromise
	setActiveStream(stream: AsyncIterable<string> | undefined, pid?: number): void
	shellExecutionComplete(exitDetails: ExitCodeDetails): void
	getProcessesWithOutput(): ZentaraTerminalProcess[]
	getUnretrievedOutput(): string
	getLastCommand(): string
	cleanCompletedProcessQueue(): void
}

export interface ZentaraTerminalCallbacks {
	onLine: (line: string, process: ZentaraTerminalProcess) => void
	onCompleted: (output: string | undefined, process: ZentaraTerminalProcess) => void
	onShellExecutionStarted: (pid: number | undefined, process: ZentaraTerminalProcess) => void
	onShellExecutionComplete: (details: ExitCodeDetails, process: ZentaraTerminalProcess) => void
	onNoShellIntegration?: (message: string, process: ZentaraTerminalProcess) => void
}

export interface ZentaraTerminalProcess extends EventEmitter<ZentaraTerminalProcessEvents> {
	command: string
	isHot: boolean
	run: (command: string) => Promise<void>
	continue: () => void
	abort: () => void
	hasUnretrievedOutput: () => boolean
	getUnretrievedOutput: () => string
}

export type ZentaraTerminalProcessResultPromise = ZentaraTerminalProcess & Promise<void>

export interface ZentaraTerminalProcessEvents {
	line: [line: string]
	continue: []
	completed: [output?: string]
	stream_available: [stream: AsyncIterable<string>]
	shell_execution_started: [pid: number | undefined]
	shell_execution_complete: [exitDetails: ExitCodeDetails]
	error: [error: Error]
	no_shell_integration: [message: string]
}

export interface ExitCodeDetails {
	exitCode: number | undefined
	signal?: number | undefined
	signalName?: string
	coreDumpPossible?: boolean
}
