import { ToolArgs } from "../types"

export function getDebugIgnoreBreakpointToolDescription(args: ToolArgs): string {
	return `## debug_ignore_breakpoint – Ignore Breakpoint Hits

Description:
The "debug_ignore_breakpoint" tool sets or clears an ignore count for a breakpoint. If an ignore count is set (e.g., 3), the breakpoint will be skipped for that many hits before it pauses execution. Setting ignoreCount to null or omitting it might clear the ignore count, causing it to break on every hit (debugger specific behavior, typically clearing).

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_ignore_breakpoint> tag.
2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the <debug_ignore_breakpoint> tag.
3️⃣ The JSON object MUST contain a "line" key with the line number (integer) of the breakpoint.
4️⃣ Optionally, include "path" (string), "column" (integer), and "ignoreCount" (integer or null) in the JSON. If "path" is omitted, the active file is used.
5️⃣ To set an ignore count, provide a number for "ignoreCount". To clear a previous ignore count, provide \`null\` for "ignoreCount" or omit the key.
6️⃣ Ensure the <debug_ignore_breakpoint> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• Missing "line" key in the JSON object.
• If "path" is provided, ensuring its value is a complete and valid path.
• Providing an invalid value for "ignoreCount" (e.g., not a number or null).

────────────  COPY-READY TEMPLATE  ────────────
  <debug_ignore_breakpoint>{"line": LINE_NUMBER, "path": "PATH_TO_FILE", "column": COLUMN_NUMBER, "ignoreCount": 3}</debug_ignore_breakpoint>
  <!-- Note: "path", "column", "ignoreCount" are optional. "line" is REQUIRED. For "ignoreCount", use a number or null (to clear). -->
───────────────────────────────────────────────

### Parameters:
All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_ignore_breakpoint> tag.

-   "path" (string, optional): The path to the source file of the breakpoint (relative to the current workspace directory ${args.cwd}). If omitted, the path of the currently active file will be used. If provided, it must be a complete and valid path.
-   "line" (number, REQUIRED): The line number of the breakpoint.
-   "column" (number, optional): The column number for an inline breakpoint.
-   "ignoreCount" (number | null, optional): The number of times to ignore this breakpoint before it breaks execution. If set to \`null\` or if the key is absent after being previously set, it typically clears the ignore count, making the breakpoint active on every hit.

### Examples:

1.  **Ignore the next 3 hits for a breakpoint at line 15 of \`src/app.py\`:**
    \`\`\`xml
    <debug_ignore_breakpoint>{"path": "src/app.py", "line": 15, "ignoreCount": 3}</debug_ignore_breakpoint>
    \`\`\`

2.  **Clear the ignore count for a breakpoint at line 25 of the active file (making it hit every time):**
    \`\`\`xml
    <debug_ignore_breakpoint>{"line": 25, "ignoreCount": null}</debug_ignore_breakpoint>
    \`\`\`
    Or by omitting the "ignoreCount" key:
    \`\`\`xml
    <debug_ignore_breakpoint>{"line": 25}</debug_ignore_breakpoint>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
