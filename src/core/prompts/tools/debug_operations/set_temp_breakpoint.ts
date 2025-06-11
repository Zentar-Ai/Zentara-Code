import { ToolArgs } from "../types"

export function getDebugSetTempBreakpointToolDescription(args: ToolArgs): string {
	return `## debug_set_temp_breakpoint – Add a One-Shot Temporary Breakpoint

Description:
The "debug_set_temp_breakpoint" tool adds a temporary breakpoint that is automatically removed after it is hit once. Otherwise, it behaves like "debug_set_breakpoint" and supports the same optional parameters like column, condition, hit condition, and log message.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_set_temp_breakpoint> tag.
2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the <debug_set_temp_breakpoint> tag.
3️⃣ The JSON object MUST contain a "line" key with the line number (integer).
4️⃣ Optionally, include "path" (string), "column" (integer), "condition" (string), "hitCondition" (string), or "logMessage" (string) in the JSON object. If "path" is omitted, the currently active file will be used.
5️⃣ Ensure the <debug_set_temp_breakpoint> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• Missing "line" key in the JSON object.
• If "path" is provided, ensuring its value is a complete and valid path.
• Incorrect "line" number value (e.g., not an integer).

────────────  COPY-READY TEMPLATE  ────────────
  <debug_set_temp_breakpoint>{"line": LINE_NUMBER, "path": "PATH_TO_FILE", "column": COLUMN_NUMBER, "condition": "i > 10"}</debug_set_temp_breakpoint>
  <!-- Note: "path", "column", "condition", etc. are optional. "line" is REQUIRED. -->
───────────────────────────────────────────────

### Parameters:
All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_set_temp_breakpoint> tag.

-   "path" (string, optional): The path to the source file (relative to the current workspace directory ${args.cwd}). If omitted, the path of the currently active file will be used. If provided, it must be a complete and valid path.
-   "line" (number, REQUIRED): The line number in the file to set the temporary breakpoint.
-   "column" (number, optional): The column number within the line for an inline breakpoint. Useful for minified code.
-   "condition" (string, optional): An expression that must evaluate to true for the breakpoint to hit. Example: \`"condition": "i > 10"\`.
-   "hitCondition" (string, optional): An expression that controls how many times the breakpoint is hit before it breaks (though for a temp breakpoint, it's typically hit once). Example: \`"hitCondition": "% 2 == 0"\`.
-   "logMessage" (string, optional): A message to log when the breakpoint is hit. Example: \`"logMessage": "Status: {status}"\`.

### Examples:

1.  **Set a temporary breakpoint at line 33 of \`src/app.py\`:**
    \`\`\`xml
    <debug_set_temp_breakpoint>{"path": "src/app.py", "line": 33}</debug_set_temp_breakpoint>
    \`\`\`

2.  **Set a conditional temporary breakpoint in the active file (omitting "path"):**
    \`\`\`xml
    <debug_set_temp_breakpoint>{"line": 88, "condition": "result.status === 'ERROR'"}</debug_set_temp_breakpoint>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
