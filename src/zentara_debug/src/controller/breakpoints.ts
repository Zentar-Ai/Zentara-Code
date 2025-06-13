import * as vscode from "vscode"
import * as path from "path" // Import path module
import {
	SetBreakpointParams,
	SetBreakpointResult,
	BreakpointInfo,
	DebuggerResponse,
	GetActiveBreakpointsResult,
	ToggleBreakpointParams,
	IgnoreBreakpointParams,
	SetBreakpointConditionParams,
	RemoveBreakpointParams, // Added for removeBreakpointByLocation
} from "../IDebugController" // Adjust path as needed
// import { ensureActiveSession } from './session'; // Currently not used in this file
import { outputChannel, stringifySafe } from "../vscodeUtils" // Use local outputChannel

//     // const cache = new Set(); // Unused variable, logger might handle circular refs or this can be improved if needed
//     try {
//         // Standard JSON.stringify, logger might handle complex objects or we can refine later
//         return JSON.stringify(obj, null, 2);
//     } catch (e) {
//         // If stringify fails, return a simple error message
//         return `[Serialization Error: ${e instanceof Error ? e.message : String(e)}]`;
//     }
// };

// Helper function to resolve a path to an absolute path against the workspace root
function resolvePathToAbsolute(filePath: string | undefined): string | undefined {
	let effectiveFilePath = filePath

	if (effectiveFilePath === undefined) {
		const activeEditor = vscode.window.activeTextEditor
		if (activeEditor) {
			effectiveFilePath = activeEditor.document.uri.fsPath
			outputChannel.appendLine(
				`[resolvePathToAbsolute] filePath was undefined, using active editor path: ${effectiveFilePath}`,
			)
		} else {
			outputChannel.appendLine(
				`[ERROR] [resolvePathToAbsolute] filePath is undefined and no active editor found.`,
			)
			return undefined
		}
	}

	if (path.isAbsolute(effectiveFilePath)) {
		return effectiveFilePath
	}
	const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
	if (!workspaceRoot) {
		outputChannel.appendLine(
			`[ERROR] [resolvePathToAbsolute] Workspace root not found. Cannot resolve relative path: ${effectiveFilePath}`,
		)
		return undefined
	}
	return path.resolve(workspaceRoot, effectiveFilePath)
}

/**
 * Polls vscode.debug.breakpoints until a breakpoint at the specified location is found or timeout.
 * @param location The 1-based source location to find.
 * @param timeoutMs Timeout duration.
 * @returns The found SourceBreakpoint or undefined if not found within timeout.
 */
async function findBreakpointWithPolling(
	location: { path: string; line: number },
	timeoutMs: number = 5000, // Increased default timeout to 5 seconds
): Promise<vscode.SourceBreakpoint | undefined> {
	const absoluteTargetPath = resolvePathToAbsolute(location.path)
	if (!absoluteTargetPath) {
		//outputChannel.appendLine(`[findBreakpointWithPolling] Could not resolve path: ${location.path}`)
		return undefined
	}
	const targetLine1Based = location.line
	const targetLine0Based = targetLine1Based - 1 // Convert to 0-based index
	const pollIntervalMs = 100
	const startTime = Date.now()
	let attempt = 0

	// outputChannel.appendLine(
	// 	`[findBreakpointWithPolling] Starting poll for ${absoluteTargetPath}:${targetLine1Based} (0-based: ${targetLine0Based}), Timeout: ${timeoutMs}ms`,
	// )

	while (Date.now() - startTime < timeoutMs) {
		attempt++
		const existingBreakpoints = vscode.debug.breakpoints
		// outputChannel.appendLine(`[findBreakpointWithPolling] Attempt ${attempt}: Found ${existingBreakpoints.length} total breakpoints.`); // Verbose

		let foundBreakpoint: vscode.SourceBreakpoint | undefined = undefined

		for (const bp of existingBreakpoints) {
			if (bp instanceof vscode.SourceBreakpoint) {
				const bpPath = bp.location.uri.fsPath // fsPath is usually absolute
				const bpLine0Based = bp.location.range.start.line
				// Compare absolute paths
				const pathMatch = bpPath === absoluteTargetPath
				const lineMatch = bpLine0Based === targetLine0Based

				// Detailed log for each comparison attempt
				// outputChannel.appendLine(`[findBreakpointWithPolling] Attempt ${attempt}: Comparing Target(${absoluteTargetPath}:${targetLine0Based}) vs BP(${bpPath}:${bpLine0Based}). Path Match: ${pathMatch}, Line Match: ${lineMatch}`); // Too verbose

				if (pathMatch && lineMatch) {
					foundBreakpoint = bp
					break // Exit the for loop once found
				}
			}
		}

		if (foundBreakpoint) {
			// outputChannel.appendLine(
			// 	`[findBreakpointWithPolling] Found breakpoint after ${attempt} attempts and ${Date.now() - startTime}ms.`,
			// )
			return foundBreakpoint
		}
		await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
	}

	// Log final state if timeout occurs
	//outputChannel.appendLine(
	//	`[WARN] [findBreakpointWithPolling] Timeout after ${attempt} attempts and ${Date.now() - startTime}ms waiting for breakpoint at ${absoluteTargetPath}:${targetLine1Based}. Final vscode.debug.breakpoints: ${stringifySafe(vscode.debug.breakpoints)}`,
	//)
	return undefined // Not found within timeout
}

/**
 * Sets a breakpoint using the VS Code API.
 * @param params Parameters defining the breakpoint location and conditions.
 * @returns A promise resolving with success status. Verification and ID are not reliably returned by VS Code API.
 */
export async function setBreakpoint(params: SetBreakpointParams): Promise<SetBreakpointResult> {
	try {
		const absolutePath = resolvePathToAbsolute(params.location.path)
		if (!absolutePath) {
			return {
				success: false,
				errorMessage: `Failed to set breakpoint: Could not resolve path ${params.location.path}.`,
			}
		}

		// First remove any existing breakpoint at this location
		// removeBreakpointByLocation will resolve its own path
		outputChannel.appendLine(
			`[setBreakpoint] Cleaning up any existing breakpoint at ${absolutePath}:${params.location.line}`,
		)
		await removeBreakpointByLocation({
			location: { path: params.location.path, line: params.location.line, column: params.location.column },
		})

		// Increased delay to ensure removal is processed
		await new Promise((resolve) => setTimeout(resolve, 1000))

		const location = new vscode.Location(
			vscode.Uri.file(absolutePath), // Use absolute path
			new vscode.Position(params.location.line - 1, params.location.column ? params.location.column - 1 : 0), // VS Code API is 0-based
		)

		const newVsCodeBreakpoint = new vscode.SourceBreakpoint(
			location,
			true, // Enabled by default
			params.condition,
			params.hitCondition,
			params.logMessage,
		)

		await vscode.debug.addBreakpoints([newVsCodeBreakpoint])

		// Add polling to verify it appeared in the list using absolute path
		// findBreakpointWithPolling will resolve its own path
		const found = await findBreakpointWithPolling({ path: params.location.path, line: params.location.line }, 5000)
		if (!found) {
			outputChannel.appendLine(
				`[WARN] setBreakpoint: Breakpoint at ${absolutePath}:${params.location.line} not found in vscode.debug.breakpoints after adding.`,
			) // Log with resolved path
		} else {
			outputChannel.appendLine(
				`[setBreakpoint] Breakpoint at ${absolutePath}:${params.location.line} verified via polling.`,
			)
		}

		// Interface updated: No longer returns breakpoint info
		return { success: true }
	} catch (error: any) {
		const errorDisplayPath = resolvePathToAbsolute(params.location.path) || params.location.path
		outputChannel.appendLine(
			`[ERROR] Error setting breakpoint via VSCode API at ${errorDisplayPath}:${params.location.line}: ${error.message} ${stringifySafe(error)}`,
		)
		return { success: false, errorMessage: `Failed to set breakpoint: ${error.message}` }
	}
}

/**
 * Removes all breakpoints in a specific file using the VS Code API.
 * @param params Parameters identifying the source file location. Path can be undefined to use the active editor.
 * @returns A promise resolving to a standard debugger response.
 */
export async function removeAllBreakpointsInFile(params: { location: { path?: string } }): Promise<DebuggerResponse> {
	try {
		const absoluteTargetPath = resolvePathToAbsolute(params.location.path)
		if (!absoluteTargetPath) {
			const messagePath = params.location.path || "undefined (no active editor found or path not provided)"
			return {
				success: false,
				errorMessage: `Failed to remove breakpoints: Could not resolve path ${messagePath}.`,
			}
		}
		const breakpointsToRemove = vscode.debug.breakpoints.filter(
			(bp) => bp instanceof vscode.SourceBreakpoint && bp.location.uri.fsPath === absoluteTargetPath,
		)

		if (breakpointsToRemove.length > 0) {
			await vscode.debug.removeBreakpoints(breakpointsToRemove)
		}
		return { success: true }
	} catch (error: any) {
		// Use the more robust errorDisplayPath that considers undefined params.location.path
		const errorDisplayPath =
			params.location.path !== undefined
				? resolvePathToAbsolute(params.location.path) || params.location.path
				: "undefined (inferred from active editor or error)"
		outputChannel.appendLine(
			`[ERROR] Error removing breakpoints in file ${errorDisplayPath}: ${error.message} ${stringifySafe(error)}`,
		)
		return { success: false, errorMessage: `Failed to remove breakpoints: ${error.message}` }
	}
}

/**
 * Retrieves currently active breakpoints from the VS Code debug API.
 * Optionally waits for a specific breakpoint to appear before returning.
 * @param waitForLocation Optional location to wait for.
 * @param timeoutMs Optional timeout in milliseconds for waiting.
 * @returns A promise resolving with the list of active breakpoints.
 */
export async function getActiveBreakpoints(
	waitForLocation?: { path: string; line: number },
	timeoutMs: number = 5000, // Default timeout 2 seconds
): Promise<GetActiveBreakpointsResult> {
	const pollIntervalMs = 500 // Interval for polling
	const startTime = Date.now()

	let attempts = 0 // Debugging counter

	while (true) {
		attempts++
		try {
			const activeBreakpoints = vscode.debug.breakpoints
			const mappedBreakpoints: BreakpointInfo[] = []
			let foundExpected = !waitForLocation // If not waiting, it's considered "found"

			for (const bp of activeBreakpoints) {
				let currentPath: string | undefined
				let currentLine: number | undefined // 1-based

				if (bp instanceof vscode.SourceBreakpoint) {
					currentPath = bp.location.uri.fsPath
					currentLine = bp.location.range.start.line + 1 // Convert to 1-based

					mappedBreakpoints.push({
						id: undefined, // VS Code API doesn't expose adapter ID reliably
						verified: true, // Assume active = verified
						location: {
							path: currentPath,
							line: currentLine,
						},
						condition: bp.condition, //* An optional expression for conditional breakpoints.
						hitCondition: bp.hitCondition, //An optional expression that controls how many hits of the breakpoint are ignored.
						logMessage: bp.logMessage,
					})
				}
				// TODO: Handle FunctionBreakpoint if needed

				// Check if this is the breakpoint we are waiting for
				if (waitForLocation) {
					const absoluteWaitForPath = resolvePathToAbsolute(waitForLocation.path)
					if (
						absoluteWaitForPath &&
						currentPath === absoluteWaitForPath &&
						currentLine === waitForLocation.line
					) {
						foundExpected = true
					}
				}
			}

			// If we found the expected breakpoint or we weren't waiting, return immediately
			if (foundExpected) {
				return { success: true, breakpoints: mappedBreakpoints }
			}

			// If still waiting and timeout hasn't occurred, continue polling
			if (Date.now() - startTime < timeoutMs) {
				await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
				continue // Go to next iteration of the while loop
			} else {
				// Timeout reached
				const logWaitForPath = waitForLocation
					? resolvePathToAbsolute(waitForLocation.path) || waitForLocation.path
					: "any"
				outputChannel.appendLine(
					`[WARN] [getActiveBreakpoints] Timeout (${timeoutMs}ms) reached waiting for breakpoint at ${logWaitForPath}:${waitForLocation?.line}. Returning current list. Attempts: ${attempts}`,
				)
				return { success: true, breakpoints: mappedBreakpoints } // Return what we have found so far
			}
		} catch (error: any) {
			outputChannel.appendLine(
				`[ERROR] [getActiveBreakpoints] Error during polling attempt ${attempts}: ${error.message} ${stringifySafe(error)}`,
			)
			return {
				success: false,
				errorMessage: `Failed to get active breakpoints: ${error.message}`,
				breakpoints: [],
			}
		}
	} // End while loop
}

/**
 * Helper function to find and toggle the enabled state of a breakpoint using VS Code API.
 */
async function toggleBreakpointEnablement(params: ToggleBreakpointParams, enable: boolean): Promise<DebuggerResponse> {
	try {
		const resolvedPath = resolvePathToAbsolute(params.location.path)
		if (!resolvedPath) {
			return {
				success: false,
				errorMessage: `Failed to toggle breakpoint: Could not resolve path ${params.location.path}.`,
			}
		}

		outputChannel.appendLine(
			`[toggleBreakpointEnablement] Attempting to find BP for ${enable ? "enable" : "disable"} at ${resolvedPath}:${params.location.line}`,
		)
		// findBreakpointWithPolling will resolve its own path
		const targetBreakpoint = await findBreakpointWithPolling({
			path: params.location.path,
			line: params.location.line,
		})

		if (!targetBreakpoint) {
			outputChannel.appendLine(`[ERROR] [toggleBreakpointEnablement] Failed to find breakpoint before toggle.`)
			return {
				success: false,
				errorMessage: `Breakpoint not found at ${resolvedPath}:${params.location.line} (polling timeout or not set)`,
			}
		}
		outputChannel.appendLine(
			`[toggleBreakpointEnablement] Found breakpoint, proceeding to toggle (enable=${enable}). Current state: enabled=${targetBreakpoint.enabled}, condition=${targetBreakpoint.condition}, hitCondition=${targetBreakpoint.hitCondition}`,
		)

		const newBreakpoint = new vscode.SourceBreakpoint(
			targetBreakpoint.location,
			enable, // Set the desired enabled state
			targetBreakpoint.condition,
			targetBreakpoint.hitCondition,
			targetBreakpoint.logMessage,
		)

		outputChannel.appendLine(`[toggleBreakpointEnablement] Removing old breakpoint...`)
		await vscode.debug.removeBreakpoints([targetBreakpoint])
		outputChannel.appendLine(`[toggleBreakpointEnablement] Waiting 500ms...`) // Increased delay further
		await new Promise((resolve) => setTimeout(resolve, 500)) // Increased delay further
		outputChannel.appendLine(`[toggleBreakpointEnablement] Adding new breakpoint with enabled=${enable}...`)
		await vscode.debug.addBreakpoints([newBreakpoint])
		outputChannel.appendLine(`[toggleBreakpointEnablement] Add breakpoint call finished. Verifying...`)

		// findBreakpointWithPolling will resolve its own path
		const addedBp = await findBreakpointWithPolling(
			{ path: params.location.path, line: params.location.line },
			1000,
		)
		if (!addedBp) {
			outputChannel.appendLine(
				`[WARN] [toggleBreakpointEnablement] Breakpoint at ${resolvedPath}:${params.location.line} not found immediately after re-adding.`,
			)
		} else {
			outputChannel.appendLine(
				`[toggleBreakpointEnablement] Re-added breakpoint found. Final state: enabled=${addedBp.enabled}, condition=${addedBp.condition}, hitCondition=${addedBp.hitCondition}`,
			)
		}

		return { success: true }
	} catch (error: any) {
		const errorDisplayPath = resolvePathToAbsolute(params.location.path) || params.location.path
		outputChannel.appendLine(
			`[ERROR] Error toggling breakpoint at ${errorDisplayPath}:${params.location.line}: ${error.message} ${stringifySafe(error)}`,
		)
		return { success: false, errorMessage: `Failed to toggle breakpoint: ${error.message}` }
	}
}

/**
 * Disables a breakpoint at the specified location using VS Code API.
 */
export async function disableBreakpoint(params: ToggleBreakpointParams): Promise<DebuggerResponse> {
	return toggleBreakpointEnablement(params, false)
}

/**
 * Enables a breakpoint at the specified location using VS Code API.
 */
export async function enableBreakpoint(params: ToggleBreakpointParams): Promise<DebuggerResponse> {
	return toggleBreakpointEnablement(params, true)
}

/**
 * Helper function to find (with polling) and modify a breakpoint property using VS Code API (remove/add).
 */
async function modifyBreakpointProperty(
	params: { location: { path: string; line: number } },
	property: "condition" | "hitCondition",
	value: string | null | number, // Allow number for hitCondition
): Promise<DebuggerResponse> {
	try {
		const resolvedPath = resolvePathToAbsolute(params.location.path)
		if (!resolvedPath) {
			return {
				success: false,
				errorMessage: `Failed to modify breakpoint: Could not resolve path ${params.location.path}.`,
			}
		}

		outputChannel.appendLine(
			`[modifyBreakpointProperty] Attempting to find BP for modifying ${property} at ${resolvedPath}:${params.location.line}`,
		)
		// findBreakpointWithPolling will resolve its own path
		const targetBreakpoint = await findBreakpointWithPolling({
			path: params.location.path,
			line: params.location.line,
		})

		if (!targetBreakpoint) {
			outputChannel.appendLine(
				`[ERROR] [modifyBreakpointProperty] Failed to find breakpoint before modification.`,
			)
			return {
				success: false,
				errorMessage: `Breakpoint not found at ${resolvedPath}:${params.location.line} (polling timeout or not set)`,
			}
		}
		outputChannel.appendLine(
			`[modifyBreakpointProperty] Found breakpoint, proceeding to modify ${property}=${value}. Current state: enabled=${targetBreakpoint.enabled}, condition=${targetBreakpoint.condition}, hitCondition=${targetBreakpoint.hitCondition}`,
		)

		const newBreakpoint = new vscode.SourceBreakpoint(
			targetBreakpoint.location,
			targetBreakpoint.enabled,
			property === "condition" ? (value as string | undefined) : targetBreakpoint.condition,
			property === "hitCondition" ? (value === null ? undefined : String(value)) : targetBreakpoint.hitCondition, // Convert number/null to string/undefined
			targetBreakpoint.logMessage,
		)

		outputChannel.appendLine(`[modifyBreakpointProperty] Removing old breakpoint...`)
		await vscode.debug.removeBreakpoints([targetBreakpoint])
		outputChannel.appendLine(`[modifyBreakpointProperty] Waiting 500ms...`) // Increased delay further
		await new Promise((resolve) => setTimeout(resolve, 500)) // Increased delay further
		outputChannel.appendLine(`[modifyBreakpointProperty] Adding new breakpoint with ${property}=${value}...`)
		await vscode.debug.addBreakpoints([newBreakpoint])
		outputChannel.appendLine(
			`[modifyBreakpointProperty] Add breakpoint call finished. Assuming success as API call did not throw.`,
		)
		// Removed verification loop due to unreliability of polling vscode.debug.breakpoints for immediate property updates.
		return { success: true }
	} catch (error: any) {
		const errorDisplayPath = resolvePathToAbsolute(params.location.path) || params.location.path
		outputChannel.appendLine(
			`[ERROR] Error modifying breakpoint ${property} at ${errorDisplayPath}:${params.location.line}: ${error.message} ${stringifySafe(error)}`,
		)
		return { success: false, errorMessage: `Failed to modify breakpoint ${property}: ${error.message}` }
	}
}

/**
 * Sets or removes an ignore count (hit condition) for a breakpoint using VS Code API.
 */
export async function ignoreBreakpoint(params: IgnoreBreakpointParams): Promise<DebuggerResponse> {
	const hitConditionValue = params.ignoreCount === null ? null : String(params.ignoreCount)
	return modifyBreakpointProperty(params, "hitCondition", hitConditionValue)
}

/**
 * Sets or removes the condition for a breakpoint using VS Code API.
 */
export async function setBreakpointCondition(params: SetBreakpointConditionParams): Promise<DebuggerResponse> {
	const resolvedLogPath = resolvePathToAbsolute(params.location.path) || params.location.path

	// modifyBreakpointProperty will resolve its own path
	outputChannel.appendLine(
		`[setBreakpointCondition] Calling modifyBreakpointProperty for condition '${params.condition}' at ${resolvedLogPath}:${params.location.line}.`,
	)
	const result = await modifyBreakpointProperty(
		{ location: { path: params.location.path, line: params.location.line } },
		"condition",
		params.condition,
	)
	outputChannel.appendLine(`[setBreakpointCondition] modifyBreakpointProperty result: ${stringifySafe(result)}`)
	// Removed explicit polling loop here.
	return result
}

/**
 * Sets a temporary breakpoint using the VS Code API.
 * Note: This implementation only sets the breakpoint. The removal logic after hit
 * requires event handling (e.g., listening to 'stopped' events) which is
 * not implemented in this helper function itself. The removal logic is handled
 * by the VsCodeDebugController listening to stop events.
 */
export async function setTempBreakpoint(params: SetBreakpointParams): Promise<SetBreakpointResult> {
	// Just use the regular setBreakpoint function.
	// The VsCodeDebugController will register it as temporary.
	return setBreakpoint(params)
}

/**
 * Removes a specific breakpoint identified by its location using VS Code API.
 */
export async function removeBreakpointByLocation(params: RemoveBreakpointParams): Promise<DebuggerResponse> {
	try {
		const resolvedPath = resolvePathToAbsolute(params.location.path)
		if (!resolvedPath) {
			return {
				success: false,
				errorMessage: `Failed to remove breakpoint: Could not resolve path ${params.location.path}.`,
			}
		}

		outputChannel.appendLine(
			`[removeBreakpointByLocation] Attempting to find BP for removal at ${resolvedPath}:${params.location.line}`,
		)
		// findBreakpointWithPolling will resolve its own path
		const bpToRemove = await findBreakpointWithPolling({ path: params.location.path, line: params.location.line })
		if (!bpToRemove) {
			outputChannel.appendLine(
				`[removeBreakpointByLocation] Breakpoint at ${resolvedPath}:${params.location.line} not found.`,
			)
			return { success: true } // Consider not found as success for removal
		}
		outputChannel.appendLine(`[removeBreakpointByLocation] Found breakpoint, removing...`)
		await vscode.debug.removeBreakpoints([bpToRemove])
		outputChannel.appendLine(`[removeBreakpointByLocation] Remove call finished.`)
		// Removed internal verification polling as vscode.debug.breakpoints update is unreliable/delayed.
		// Trusting the removeBreakpoints call was issued successfully if no error was thrown.
		return { success: true }
	} catch (error: any) {
		const errorDisplayPath = resolvePathToAbsolute(params.location.path) || params.location.path
		outputChannel.appendLine(
			`[ERROR] [Breakpoints] Error removing breakpoint by location ${errorDisplayPath}:${params.location.line}: ${stringifySafe(error)}`,
		)
		return { success: false, errorMessage: `Error removing breakpoint: ${error.message}` }
	}
}
