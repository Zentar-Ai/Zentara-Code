import type { ExtensionContext } from "vscode"

export function getUserAgent(context?: ExtensionContext): string {
	return `Zentara-Code ${context?.extension?.packageJSON?.version || "unknown"}`
}
