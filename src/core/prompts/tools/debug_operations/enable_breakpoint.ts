import { ToolArgs } from "../types"

export function getDebugEnableBreakpointToolDescription(args: ToolArgs): string {
	return `## debug_enable_breakpoint – Enable a Disabled Breakpoint

Description:
The "debug_enable_breakpoint" tool re-enables a previously disabled breakpoint at a specified location, allowing it to pause execution again.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_enable_breakpoint> tag.
2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the <debug_enable_breakpoint> tag.
3️⃣ The JSON object MUST contain a "line" key with the line number (integer) of the breakpoint.
4️⃣ Optionally, include "path" (string) and "column" (integer) in the JSON object. If "path" is omitted, the currently active file will be used.
5️⃣ Ensure the <debug_enable_breakpoint> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• Missing "line" key in the JSON object.
• If "path" is provided, ensuring its value is a complete and valid path.
• Specifying a location (either in the provided "path" or active file) where no disabled breakpoint exists (or no breakpoint at all).

────────────  COPY-READY TEMPLATE  ────────────
  <debug_enable_breakpoint>{"line": LINE_NUMBER, "path": "PATH_TO_FILE", "column": COLUMN_NUMBER_IF_INLINE}</debug_enable_breakpoint>
  <!-- Note: "path" and "column" are optional. "line" is REQUIRED. -->
───────────────────────────────────────────────

### Parameters:
All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_enable_breakpoint> tag.

-   "path" (string, optional): The path to the source file of the breakpoint (relative to the current workspace directory ${args.cwd}). If omitted, the path of the currently active file will be used. If provided, it must be a complete and valid path.
-   "line" (number, REQUIRED): The line number of the breakpoint to enable.
-   "column" (number, optional): The column number if enabling an inline breakpoint.

### Examples:

1.  **Enable a disabled breakpoint at line 15 of \`src/app.py\`:**
    \`\`\`xml
    <debug_enable_breakpoint>{"path": "src/app.py", "line": 15}</debug_enable_breakpoint>
    \`\`\`

2.  **Enable a disabled breakpoint at line 20 of the currently active file (omitting "path"):**
    \`\`\`xml
    <debug_enable_breakpoint>{"line": 20}</debug_enable_breakpoint>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
