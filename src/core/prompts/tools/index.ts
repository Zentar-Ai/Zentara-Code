import type { ToolName, ModeConfig } from "@roo-code/types"

import { TOOL_GROUPS, ALWAYS_AVAILABLE_TOOLS, DiffStrategy } from "../../../shared/tools"
import { McpHub } from "../../../services/mcp/McpHub"
import { Mode, getModeConfig, isToolAllowedForMode, getGroupName } from "../../../shared/modes"

import { ToolArgs } from "./types"
import { getExecuteCommandDescription } from "./execute-command"
import { getReadFileDescription } from "./read-file"
import { getFetchInstructionsDescription } from "./fetch-instructions"
import { getWriteToFileDescription } from "./write-to-file"
import { getSearchFilesDescription } from "./search-files"
import { getListFilesDescription } from "./list-files"
import { getInsertContentDescription } from "./insert-content"
import { getSearchAndReplaceDescription } from "./search-and-replace"
import { getListCodeDefinitionNamesDescription } from "./list-code-definition-names"
import { getBrowserActionDescription } from "./browser-action"
import { getAskFollowupQuestionDescription } from "./ask-followup-question"
import { getAttemptCompletionDescription } from "./attempt-completion"
import { getUseMcpToolDescription } from "./use-mcp-tool"
import { getAccessMcpResourceDescription } from "./access-mcp-resource"
import { getSwitchModeDescription } from "./switch-mode"
import { getNewTaskDescription } from "./new-task"
import { getCodebaseSearchDescription } from "./codebase-search"
import { CodeIndexManager } from "../../../services/code-index/manager"
import { getDebugToolDescription } from "./debug"
import {
	getDebugLaunchToolDescription,
	getDebugRestartToolDescription,
	getDebugQuitToolDescription,
	getDebugContinueToolDescription,
	getDebugNextToolDescription,
	getDebugStepInToolDescription,
	getDebugStepOutToolDescription,
	getDebugJumpToolDescription,
	getDebugUntilToolDescription,
	getDebugSetBreakpointToolDescription,
	getDebugSetTempBreakpointToolDescription,
	getDebugRemoveBreakpointToolDescription,
	getDebugRemoveAllBreakpointsInFileToolDescription,
	getDebugDisableBreakpointToolDescription,
	getDebugEnableBreakpointToolDescription,
	getDebugIgnoreBreakpointToolDescription,
	getDebugSetBreakpointConditionToolDescription,
	getDebugGetActiveBreakpointsToolDescription,
	getDebugStackTraceToolDescription,
	getDebugListSourceToolDescription,
	getDebugUpToolDescription,
	getDebugDownToolDescription,
	getDebugGotoFrameToolDescription,
	getDebugGetSourceToolDescription,
	getDebugGetStackFrameVariablesToolDescription,
	getDebugGetArgsToolDescription,
	getDebugEvaluateToolDescription,
	getDebugPrettyPrintToolDescription,
	getDebugWhatisToolDescription,
	getDebugExecuteStatementToolDescription,
	getDebugGetLastStopInfoToolDescription,
} from "./debug_operations"

// Map of tool names to their description functions
const toolDescriptionMap: Record<string, (args: ToolArgs) => string | undefined> = {
	execute_command: (args) => getExecuteCommandDescription(args),
	read_file: (args) => getReadFileDescription(args),
	fetch_instructions: () => getFetchInstructionsDescription(),
	write_to_file: (args) => getWriteToFileDescription(args),
	search_files: (args) => getSearchFilesDescription(args),
	list_files: (args) => getListFilesDescription(args),
	list_code_definition_names: (args) => getListCodeDefinitionNamesDescription(args),
	browser_action: (args) => getBrowserActionDescription(args),
	ask_followup_question: () => getAskFollowupQuestionDescription(),
	attempt_completion: (args) => getAttemptCompletionDescription(args),
	use_mcp_tool: (args) => getUseMcpToolDescription(args),
	access_mcp_resource: (args) => getAccessMcpResourceDescription(args),
	codebase_search: () => getCodebaseSearchDescription(),
	switch_mode: () => getSwitchModeDescription(),
	new_task: (args) => getNewTaskDescription(args),
	insert_content: (args) => getInsertContentDescription(args),
	search_and_replace: (args) => getSearchAndReplaceDescription(args),
	apply_diff: (args) =>
		args.diffStrategy ? args.diffStrategy.getToolDescription({ cwd: args.cwd, toolOptions: args.toolOptions }) : "",
	debug: (_args) => getDebugToolDescription(), // Does not use args currently
	debug_launch: (args) => getDebugLaunchToolDescription(args),
	debug_restart: (args) => getDebugRestartToolDescription(args),
	debug_quit: () => getDebugQuitToolDescription(),
	debug_continue: () => getDebugContinueToolDescription(),
	debug_next: () => getDebugNextToolDescription(),
	debug_step_in: () => getDebugStepInToolDescription(),
	debug_step_out: () => getDebugStepOutToolDescription(),
	debug_jump: () => getDebugJumpToolDescription(),
	debug_until: () => getDebugUntilToolDescription(),
	debug_set_breakpoint: (args) => getDebugSetBreakpointToolDescription(args),
	debug_set_temp_breakpoint: (args) => getDebugSetTempBreakpointToolDescription(args), // Will be updated to accept args
	debug_remove_breakpoint: (args) => getDebugRemoveBreakpointToolDescription(args), // Will be updated to accept args
	debug_remove_all_breakpoints_in_file: (args) => getDebugRemoveAllBreakpointsInFileToolDescription(args), // Will be updated to accept args
	debug_disable_breakpoint: (args) => getDebugDisableBreakpointToolDescription(args), // Will be updated to accept args
	debug_enable_breakpoint: (args) => getDebugEnableBreakpointToolDescription(args), // Will be updated to accept args
	debug_ignore_breakpoint: (args) => getDebugIgnoreBreakpointToolDescription(args), // Will be updated to accept args
	debug_set_breakpoint_condition: (args) => getDebugSetBreakpointConditionToolDescription(args), // Will be updated to accept args
	debug_get_active_breakpoints: (_args) => getDebugGetActiveBreakpointsToolDescription(), // Does not use args currently
	debug_stack_trace: () => getDebugStackTraceToolDescription(),
	debug_list_source: () => getDebugListSourceToolDescription(),
	debug_up: () => getDebugUpToolDescription(),
	debug_down: () => getDebugDownToolDescription(),
	debug_goto_frame: () => getDebugGotoFrameToolDescription(),
	debug_get_source: () => getDebugGetSourceToolDescription(),
	debug_get_stack_frame_variables: () => getDebugGetStackFrameVariablesToolDescription(),
	debug_get_args: () => getDebugGetArgsToolDescription(),
	debug_evaluate: () => getDebugEvaluateToolDescription(),
	debug_pretty_print: () => getDebugPrettyPrintToolDescription(),
	debug_whatis: () => getDebugWhatisToolDescription(),
	debug_execute_statement: () => getDebugExecuteStatementToolDescription(),
	debug_get_last_stop_info: () => getDebugGetLastStopInfoToolDescription(),
}

export function getToolDescriptionsForMode(
	mode: Mode,
	cwd: string,
	supportsComputerUse: boolean,
	codeIndexManager?: CodeIndexManager,
	diffStrategy?: DiffStrategy,
	browserViewportSize?: string,
	mcpHub?: McpHub,
	customModes?: ModeConfig[],
	experiments?: Record<string, boolean>,
	partialReadsEnabled?: boolean,
	settings?: Record<string, any>,
): string {
	const config = getModeConfig(mode, customModes)
	const args: ToolArgs = {
		cwd,
		supportsComputerUse,
		diffStrategy,
		browserViewportSize,
		mcpHub,
		partialReadsEnabled,
		settings,
		experiments,
	}

	const tools = new Set<string>()

	// Add tools from mode's groups
	config.groups.forEach((groupEntry) => {
		const groupName = getGroupName(groupEntry)
		const toolGroup = TOOL_GROUPS[groupName]
		if (toolGroup) {
			toolGroup.tools.forEach((tool) => {
				if (
					isToolAllowedForMode(
						tool as ToolName,
						mode,
						customModes ?? [],
						undefined,
						undefined,
						experiments ?? {},
					)
				) {
					tools.add(tool)
				}
			})
		}
	})

	// Add always available tools
	ALWAYS_AVAILABLE_TOOLS.forEach((tool) => tools.add(tool))

	// Conditionally exclude codebase_search if feature is disabled or not configured
	if (
		!codeIndexManager ||
		!(codeIndexManager.isFeatureEnabled && codeIndexManager.isFeatureConfigured && codeIndexManager.isInitialized)
	) {
		tools.delete("codebase_search")
	}

	// Map tool descriptions for allowed tools
	const descriptions = Array.from(tools).map((toolName) => {
		const descriptionFn = toolDescriptionMap[toolName]
		if (!descriptionFn) {
			return undefined
		}

		return descriptionFn({
			...args,
			toolOptions: undefined, // No tool options in group-based approach
		})
	})

	return `# Tools\n\n${descriptions.filter(Boolean).join("\n\n")}`
}

// Export individual description functions for backward compatibility
export {
	getExecuteCommandDescription,
	getReadFileDescription,
	getFetchInstructionsDescription,
	getWriteToFileDescription,
	getSearchFilesDescription,
	getListFilesDescription,
	getListCodeDefinitionNamesDescription,
	getBrowserActionDescription,
	getAskFollowupQuestionDescription,
	getAttemptCompletionDescription,
	getUseMcpToolDescription,
	getAccessMcpResourceDescription,
	getSwitchModeDescription,
	getInsertContentDescription,
	getSearchAndReplaceDescription,
	getCodebaseSearchDescription,
	getDebugToolDescription,
	// Debug operations
	getDebugLaunchToolDescription,
	getDebugRestartToolDescription,
	getDebugQuitToolDescription,
	getDebugContinueToolDescription,
	getDebugNextToolDescription,
	getDebugStepInToolDescription,
	getDebugStepOutToolDescription,
	getDebugJumpToolDescription,
	getDebugUntilToolDescription,
	getDebugSetBreakpointToolDescription,
	getDebugSetTempBreakpointToolDescription,
	getDebugRemoveBreakpointToolDescription,
	getDebugRemoveAllBreakpointsInFileToolDescription,
	getDebugDisableBreakpointToolDescription,
	getDebugEnableBreakpointToolDescription,
	getDebugIgnoreBreakpointToolDescription,
	getDebugSetBreakpointConditionToolDescription,
	getDebugGetActiveBreakpointsToolDescription,
	getDebugStackTraceToolDescription,
	getDebugListSourceToolDescription,
	getDebugUpToolDescription,
	getDebugDownToolDescription,
	getDebugGotoFrameToolDescription,
	getDebugGetSourceToolDescription,
	getDebugGetStackFrameVariablesToolDescription,
	getDebugGetArgsToolDescription,
	getDebugEvaluateToolDescription,
	getDebugPrettyPrintToolDescription,
	getDebugWhatisToolDescription,
	getDebugExecuteStatementToolDescription,
	getDebugGetLastStopInfoToolDescription,
}
