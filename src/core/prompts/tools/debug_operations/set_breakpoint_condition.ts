import { ToolArgs } from "../types"

export function getDebugSetBreakpointConditionToolDescription(args: ToolArgs): string {
	return `## debug_set_breakpoint_condition – Set or Clear Breakpoint Condition

Description:
The "debug_set_breakpoint_condition" tool sets or clears the condition for an existing breakpoint. A conditional breakpoint only pauses execution if its condition evaluates to true.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_set_breakpoint_condition> tag.
2️⃣ Optionally, provide the <path> child tag with the file path of the breakpoint. If omitted, the currently active file will be used.
3️⃣ Provide the REQUIRED <line> child tag with the line number of the breakpoint.
4️⃣ Optionally, include <column> for inline breakpoints.
5️⃣ Provide the <condition> tag with an expression string to set a condition, or provide \`null\` or an empty string within the <condition> tag (e.g. <condition></condition> or <condition>null</condition>) to clear an existing condition.
6️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <line> tag.
• If <path> is provided, ensuring it's a complete and valid path.
• Invalid expression for <condition>.
• Forgetting to provide a <condition> tag if intending to set or clear a condition.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_set_breakpoint_condition>
    <!-- Optional: <path>PATH_TO_FILE</path> (Defaults to active file if omitted) -->
    <line>LINE_NUMBER</line>
    <!-- Optional: <column>COLUMN_NUMBER</column> -->
    <condition>YOUR_EXPRESSION_OR_NULL_TO_CLEAR</condition> <!-- e.g., "i > 10" or "null" or "" -->
  </debug_set_breakpoint_condition>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_set_breakpoint_condition> tag.

-   <path> (string, optional): The path to the source file of the breakpoint (relative to the current workspace directory ${args.cwd}). If omitted, the path of the currently active file will be used. If provided, it must be a complete and valid path.
-   <line> (number, REQUIRED): The line number of the breakpoint.
-   <column> (number, optional): The column number for an inline breakpoint.
-   <condition> (string | null, optional): The expression to set as the breakpoint condition. If the expression evaluates to true at runtime, the debugger will pause. Provide \`null\` or an empty string (e.g. \`<condition>null</condition>\` or \`<condition></condition>\`) to clear any existing condition from the breakpoint. If the tag is omitted, the existing condition (if any) remains unchanged.

### Examples:

1.  **Set a condition \`i > 10\` for a breakpoint at line 15 of \`src/app.py\`:**
    \`\`\`xml
    <debug_set_breakpoint_condition>
      <path>src/app.py</path>
      <line>15</line>
      <condition>i > 10</condition>
    </debug_set_breakpoint_condition>
    \`\`\`

2.  **Clear the condition for a breakpoint at line 25 of the active file:**
    \`\`\`xml
    <debug_set_breakpoint_condition>
      <line>25</line>
      <condition>null</condition> <!-- or <condition></condition> -->
    </debug_set_breakpoint_condition>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
