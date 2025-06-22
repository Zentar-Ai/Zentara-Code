import * as vscode from "vscode"

// Create a real VS Code Output Channel for this module
export const outputChannel: vscode.OutputChannel =
	typeof vscode.window.createOutputChannel === "function"
		? vscode.window.createOutputChannel("Zentara Debug")
		: ({
				append: () => {},
				appendLine: () => {},
				clear: () => {},
				dispose: () => {},
				hide: () => {},
				name: "MockFallbackOutputChannel",
				replace: () => {},
				show: () => {},
			} as unknown as vscode.OutputChannel)

// Utility for safely stringifying objects, especially for logging, to avoid circular reference errors.
export function stringifySafe(obj: any, indent: number = 2): string {
	const cache = new Set()
	try {
		return JSON.stringify(
			obj,
			(key, value) => {
				if (typeof value === "object" && value !== null) {
					if (cache.has(value)) {
						// Circular reference found, discard key
						return "[Circular]"
					}
					// Store value in our collection
					cache.add(value)
				}
				return value
			},
			indent,
		)
	} catch (e) {
		// Fallback for other stringification errors
		return `[Serialization Error: ${e instanceof Error ? e.message : String(e)}]`
	} finally {
		cache.clear() // Clear cache after use
	}
}
