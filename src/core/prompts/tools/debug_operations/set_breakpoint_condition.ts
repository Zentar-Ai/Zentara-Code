import { ToolArgs } from "../types"

export function getDebugSetBreakpointConditionToolDescription(args: ToolArgs): string {
	return `## debug_set_breakpoint_condition – Set or Clear Breakpoint Condition

Description:
The "debug_set_breakpoint_condition" tool sets or clears the condition for an existing breakpoint. A conditional breakpoint only pauses execution if its condition evaluates to true.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_set_breakpoint_condition> tag.
2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the <debug_set_breakpoint_condition> tag.
3️⃣ The JSON object MUST contain a "line" key with the line number (integer) of the breakpoint.
4️⃣ Optionally, include "path" (string), "column" (integer), and "condition" (string or null) in the JSON. If "path" is omitted, the active file is used.
5️⃣ To set a condition, provide an expression string for the "condition" key. To clear an existing condition, provide \`null\` or an empty string for the "condition" key (e.g., \`"condition": null\` or \`"condition": ""\`).
6️⃣ Ensure the <debug_set_breakpoint_condition> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• Missing "line" key in the JSON object.
• If "path" is provided, ensuring its value is a complete and valid path.
• Invalid expression for the "condition" value.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_set_breakpoint_condition>{"line": LINE_NUMBER, "path": "PATH_TO_FILE", "column": COLUMN_NUMBER, "condition": "YOUR_EXPRESSION_OR_NULL_TO_CLEAR"}</debug_set_breakpoint_condition>
  <!-- Note: "path", "column", "condition" are optional. "line" is REQUIRED. For "condition", use a string like "i > 10", or null, or "" to clear. -->
───────────────────────────────────────────────

### Parameters:
All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_set_breakpoint_condition> tag.

-   "path" (string, optional): The path to the source file of the breakpoint (relative to the current workspace directory ${args.cwd}). If omitted, the path of the currently active file will be used. If provided, it must be a complete and valid path.
-   "line" (number, REQUIRED): The line number of the breakpoint.
-   "column" (number, optional): The column number for an inline breakpoint.
-   "condition" (string | null, optional): The expression to set as the breakpoint condition. If the expression evaluates to true at runtime, the debugger will pause. Provide \`null\` or an empty string (e.g., \`"condition": null\` or \`"condition": ""\`) to clear any existing condition from the breakpoint. If the key is omitted, the existing condition (if any) remains unchanged.

### Examples:

1.  **Set a condition \`i > 10\` for a breakpoint at line 15 of \`src/app.py\`:**
    \`\`\`xml
    <debug_set_breakpoint_condition>{"path": "src/app.py", "line": 15, "condition": "i > 10"}</debug_set_breakpoint_condition>
    \`\`\`

2.  **Clear the condition for a breakpoint at line 25 of the active file (omitting "path"):**
    \`\`\`xml
    <debug_set_breakpoint_condition>{"line": 25, "condition": null}</debug_set_breakpoint_condition>
    <!-- Alternatively: {"line": 25, "condition": ""} -->
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
