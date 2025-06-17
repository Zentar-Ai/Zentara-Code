// src/__mocks__/vscode.ts
export const window = {
	createOutputChannel: jest.fn().mockReturnValue({
		appendLine: jest.fn(),
		show: jest.fn(),
		dispose: jest.fn(),
		clear: jest.fn(),
		hide: jest.fn(),
		name: "MockOutputChannel",
		append: jest.fn(),
		replace: jest.fn(),
	}),
	showInformationMessage: jest.fn(),
	showWarningMessage: jest.fn(),
	showErrorMessage: jest.fn(),
	activeTextEditor: undefined,
	visibleTextEditors: [],
	onDidChangeActiveTextEditor: jest.fn(() => ({ dispose: jest.fn() })),
	onDidChangeVisibleTextEditors: jest.fn(() => ({ dispose: jest.fn() })),
	onDidCloseTerminal: jest.fn(() => ({ dispose: jest.fn() })), // Added mock for onDidCloseTerminal
	createTerminal: jest.fn().mockReturnValue({
		show: jest.fn(),
		sendText: jest.fn(),
		dispose: jest.fn(),
		name: "MockTerminal",
		processId: Promise.resolve(12345),
		creationOptions: {},
		exitStatus: undefined,
		state: { isInteractedWith: false },
		onDidWriteData: jest.fn(() => ({ dispose: jest.fn() })),
		onDidClose: jest.fn(() => ({ dispose: jest.fn() })),
		onDidOpen: jest.fn(() => ({ dispose: jest.fn() })),
		onDidChangeState: jest.fn(() => ({ dispose: jest.fn() })),
	}),
	terminals: [],
	registerTreeDataProvider: jest.fn(() => ({ dispose: jest.fn() })),
	createTreeView: jest.fn(() => ({
		reveal: jest.fn(),
		dispose: jest.fn(),
		onDidCollapseElement: jest.fn(() => ({ dispose: jest.fn() })),
		onDidExpandElement: jest.fn(() => ({ dispose: jest.fn() })),
		onDidChangeSelection: jest.fn(() => ({ dispose: jest.fn() })),
		onDidChangeVisibility: jest.fn(() => ({ dispose: jest.fn() })),
		message: undefined,
		title: undefined,
		description: undefined,
		badge: undefined,
		visible: true,
		selection: [],
	})),
	registerWebviewViewProvider: jest.fn(() => ({ dispose: jest.fn() })),
	showQuickPick: jest.fn(),
	showInputBox: jest.fn(),
	createStatusBarItem: jest.fn().mockReturnValue({
		show: jest.fn(),
		hide: jest.fn(),
		dispose: jest.fn(),
		text: "",
		tooltip: "",
		command: "",
		color: undefined,
		backgroundColor: undefined,
		alignment: 0,
		priority: undefined,
		id: "mockStatusBarItem",
		name: "Mock Status Bar Item",
		accessibilityInformation: undefined,
	}),
	createTextEditorDecorationType: jest.fn(),
	showTextDocument: jest.fn(),
	setStatusBarMessage: jest.fn(() => ({ dispose: jest.fn() })),
}

export const workspace = {
	getConfiguration: jest.fn().mockReturnValue({
		get: jest.fn((key: string) => {
			// Provide default mock values for common configurations
			if (key === "zentara.telemetryLevel") return "all"
			if (key === "zentara.logLevel") return "info"
			if (key === "zentara.codeLens.enabled") return true
			if (key === "editor.tabSize") return 4
			if (key === "files.eol") return "\n"
			return undefined
		}),
		update: jest.fn(),
		has: jest.fn(),
		inspect: jest.fn(),
	}),
	workspaceFolders: undefined,
	onDidChangeConfiguration: jest.fn(() => ({ dispose: jest.fn() })),
	openTextDocument: jest.fn(),
	fs: {
		readFile: jest.fn(),
		writeFile: jest.fn(),
		delete: jest.fn(),
		stat: jest.fn(),
		readDirectory: jest.fn(),
		createDirectory: jest.fn(),
		copy: jest.fn(),
		rename: jest.fn(),
	},
	applyEdit: jest.fn(),
	onDidOpenTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
	onDidCloseTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
	onDidChangeTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
	onDidSaveTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
	onWillSaveTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
	textDocuments: [],
	getWorkspaceFolder: jest.fn(),
	asRelativePath: jest.fn((pathOrUri) => pathOrUri.toString()),
}

export const commands = {
	executeCommand: jest.fn(),
	registerCommand: jest.fn(() => ({ dispose: jest.fn() })),
	getCommands: jest.fn(() => Promise.resolve([])),
}

export const Uri = {
	parse: jest.fn((uriString) => ({
		scheme: uriString.startsWith("file:") ? "file" : "untitled",
		authority: "",
		path: uriString.replace(/^file:\/\//, ""),
		query: "",
		fragment: "",
		fsPath: uriString.replace(/^file:\/\//, ""),
		with: jest.fn(),
		toJSON: jest.fn(() => ({ fsPath: uriString.replace(/^file:\/\//, "") })),
	})),
	file: jest.fn((path) => ({
		scheme: "file",
		authority: "",
		path: path,
		query: "",
		fragment: "",
		fsPath: path,
		with: jest.fn(),
		toJSON: jest.fn(() => ({ fsPath: path })),
	})),
	joinPath: jest.fn((base, ...paths) => ({
		scheme: base.scheme,
		authority: base.authority,
		path: [base.path, ...paths].join("/").replace(/\/\//g, "/"),
		query: base.query,
		fragment: base.fragment,
		fsPath: [base.fsPath, ...paths].join("/").replace(/\/\//g, "/"),
		with: jest.fn(),
		toJSON: jest.fn(),
	})),
}

export const Range = jest.fn((startLine, startChar, endLine, endChar) => ({
	start: { line: startLine, character: startChar },
	end: { line: endLine, character: endChar },
	isEmpty: false,
	isSingleLine: startLine === endLine,
	contains: jest.fn(),
	intersection: jest.fn(),
	union: jest.fn(),
	with: jest.fn(),
}))

export const Position = jest.fn((line, character) => ({
	line,
	character,
	isBefore: jest.fn(),
	isBeforeOrEqual: jest.fn(),
	isAfter: jest.fn(),
	isAfterOrEqual: jest.fn(),
	isEqual: jest.fn(),
	compareTo: jest.fn(),
	translate: jest.fn(),
	with: jest.fn(),
}))

export const Selection = jest.fn((anchorLine, anchorChar, activeLine, activeChar) => ({
	anchor: new Position(anchorLine, anchorChar),
	active: new Position(activeLine, activeChar),
	start: new Position(
		Math.min(anchorLine, activeLine),
		anchorChar < activeChar && anchorLine === activeLine ? anchorChar : Math.min(anchorChar, activeChar),
	),
	end: new Position(
		Math.max(anchorLine, activeLine),
		anchorChar > activeChar && anchorLine === activeLine ? anchorChar : Math.max(anchorChar, activeChar),
	),
	isReversed: anchorLine > activeLine || (anchorLine === activeLine && anchorChar > activeChar),
	isEmpty: anchorLine === activeLine && anchorChar === activeChar,
	isSingleLine: anchorLine === activeLine,
	contains: jest.fn(),
	intersection: jest.fn(),
	union: jest.fn(),
	with: jest.fn(),
}))

export const Location = jest.fn((uri, rangeOrPosition) => ({
	uri,
	range: rangeOrPosition,
}))

export const EventEmitter = jest.fn().mockImplementation(() => {
	const listeners: any[] = []
	return {
		event: (listener: any) => {
			listeners.push(listener)
			return { dispose: () => listeners.splice(listeners.indexOf(listener), 1) }
		},
		fire: (data: any) => listeners.forEach((listener) => listener(data)),
		dispose: jest.fn(),
	}
})

export const TreeItem = jest.fn((label, collapsibleState) => ({
	label,
	collapsibleState,
}))
export const TreeItemCollapsibleState = {
	None: 0,
	Collapsed: 1,
	Expanded: 2,
}

export const ThemeIcon = jest.fn((id, color) => ({ id, color }))
export const ThemeColor = jest.fn((id) => ({ id }))

export const QuickPickItemKind = {
	Separator: -1,
	Default: 0,
}

export const languages = {
	createDiagnosticCollection: jest.fn(() => ({
		dispose: jest.fn(),
		clear: jest.fn(),
		set: jest.fn(),
		delete: jest.fn(),
		forEach: jest.fn(),
		get: jest.fn(),
		has: jest.fn(),
		name: "mockDiagnosticCollection",
	})),
	registerCodeActionsProvider: jest.fn(() => ({ dispose: jest.fn() })),
	getLanguages: jest.fn(() => Promise.resolve(["typescript", "javascript", "python"])),
	setTextDocuments: jest.fn(),
	match: jest.fn(),
}

export const env = {
	appName: "VSCode",
	appRoot: "/path/to/appRoot",
	language: "en",
	machineId: "test-machine-id",
	sessionId: "test-session-id",
	shell: "/bin/bash",
	uiKind: 1, // UIKind.Desktop
	uriScheme: "vscode",
	clipboard: {
		readText: jest.fn(() => Promise.resolve("")),
		writeText: jest.fn(() => Promise.resolve()),
	},
	openExternal: jest.fn(() => Promise.resolve(true)),
	asExternalUri: jest.fn((uri) => Promise.resolve(uri)),
	appHost: "desktop",
	remoteName: undefined,
	logLevel: 0, // LogLevel.Off
	isNewAppInstall: false,
	isTelemetryEnabled: true,
	onDidChangeTelemetryEnabled: jest.fn(() => ({ dispose: jest.fn() })),
	createTelemetryLogger: jest.fn(),
	onDidChangeLogLevel: jest.fn(() => ({ dispose: jest.fn() })),
}

export const debug = {
	onDidStartDebugSession: jest.fn(() => ({ dispose: jest.fn() })),
	onDidTerminateDebugSession: jest.fn(() => ({ dispose: jest.fn() })),
	onDidReceiveDebugSessionCustomEvent: jest.fn(() => ({ dispose: jest.fn() })),
	registerDebugConfigurationProvider: jest.fn(() => ({ dispose: jest.fn() })),
	registerDebugAdapterDescriptorFactory: jest.fn(() => ({ dispose: jest.fn() })),
	registerDebugAdapterTrackerFactory: jest.fn(() => ({ dispose: jest.fn() })),
	startDebugging: jest.fn(() => Promise.resolve(true)),
	stopDebugging: jest.fn(() => Promise.resolve()),
	activeDebugSession: undefined,
	activeDebugConsole: {
		append: jest.fn(),
		appendLine: jest.fn(),
	},
	breakpoints: [],
	onDidChangeActiveDebugSession: jest.fn(() => ({ dispose: jest.fn() })),
	onDidChangeBreakpoints: jest.fn(() => ({ dispose: jest.fn() })),
	addBreakpoints: jest.fn(() => Promise.resolve()),
	removeBreakpoints: jest.fn(() => Promise.resolve()),
}

export const extensions = {
	getExtension: jest.fn((extensionId: string) => {
		if (extensionId === "zentarai.zentara-code") {
			return {
				id: "zentarai.zentara-code",
				extensionUri: Uri.file("/mock/extensions/zentarai.zentara-code"),
				extensionPath: "/mock/extensions/zentarai.zentara-code",
				isActive: true,
				packageJSON: {
					name: "zentara-code",
					version: "0.1.0",
					// ... other package.json properties
				},
				exports: {
					// mock exports if your extension exposes an API
				},
				activate: jest.fn(() => Promise.resolve()),
			}
		}
		return undefined
	}),
	all: [],
	onDidChange: jest.fn(() => ({ dispose: jest.fn() })),
}

// For ProgressLocation and other enums/types
export const ProgressLocation = {
	SourceControl: 1,
	Window: 10,
	Notification: 15,
}

export const ViewColumn = {
	Active: -1,
	Beside: -2,
	One: 1,
	Two: 2,
	Three: 3,
	Four: 4,
	Five: 5,
	Six: 6,
	Seven: 7,
	Eight: 8,
	Nine: 9,
}

export const StatusBarAlignment = {
	Left: 1,
	Right: 2,
}

export const ConfigurationTarget = {
	Global: 1,
	Workspace: 2,
	WorkspaceFolder: 3,
}

export const FileType = {
	Unknown: 0,
	File: 1,
	Directory: 2,
	SymbolicLink: 64,
}

export enum ExtensionMode {
	Production = 1,
	Development = 2,
	Test = 3,
}

export class Disposable {
	static from(...disposables: { dispose(): any }[]): Disposable {
		let isDisposed = false
		return new Disposable(function () {
			if (isDisposed) {
				return
			}
			isDisposed = true
			for (const disposable of disposables) {
				if (disposable) {
					disposable.dispose()
				}
			}
		})
	}
	private _callOnDispose?: () => any
	constructor(callOnDispose: () => any) {
		this._callOnDispose = callOnDispose
	}
	dispose(): any {
		if (this._callOnDispose) {
			this._callOnDispose()
			this._callOnDispose = undefined
		}
	}
}

export class CancellationTokenSource {
	private _token: any = undefined
	get token(): any {
		if (!this._token) {
			// Fix CancellationToken.isCancellationRequested could not be cloned
			this._token = {
				isCancellationRequested: false,
				onCancellationRequested: jest.fn(() => ({ dispose: jest.fn() })),
			}
		}
		return this._token
	}
	cancel() {
		if (!this._token) {
			// this.token // ensure token is created -- Removed as it's redundant and causes lint error
		}
		if (!this._token.isCancellationRequested) {
			this._token.isCancellationRequested = true
			// You might want to call the listeners added via onCancellationRequested here
		}
	}
	dispose() {
		this.cancel()
	}
}

// Add other exports as needed by your tests
const mockVSCode = {
	window,
	workspace,
	commands,
	Uri,
	Range,
	Position,
	Selection,
	Location,
	EventEmitter,
	TreeItem,
	TreeItemCollapsibleState,
	ThemeIcon,
	ThemeColor,
	QuickPickItemKind,
	languages,
	env,
	debug,
	extensions,
	ProgressLocation,
	ViewColumn,
	StatusBarAlignment,
	ConfigurationTarget,
	FileType,
	ExtensionMode, // Added ExtensionMode
	Disposable,
	CancellationTokenSource,
}

// Ensure all top-level exports are also part of the default export
// This can help with how Jest resolves the mock.
export default mockVSCode
