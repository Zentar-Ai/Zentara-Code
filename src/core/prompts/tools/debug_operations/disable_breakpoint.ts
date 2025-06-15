import { ToolArgs } from "../types"

export function getDebugDisableBreakpointToolDescription(args: ToolArgs): string {
	return `## debug_disable_breakpoint – Disable a Breakpoint

Description:
The "debug_disable_breakpoint" tool disables an existing breakpoint at a specified location. The breakpoint is not removed but will not cause execution to pause until it is re-enabled.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_disable_breakpoint> tag.
2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the <debug_disable_breakpoint> tag.
3️⃣ The JSON object MUST contain a "line" key with the line number (integer) of the breakpoint.
4️⃣ Optionally, include "path" (string) and "column" (integer) in the JSON object. If "path" is omitted, the currently active file will be used.
5️⃣ Ensure the <debug_disable_breakpoint> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• Missing "line" key in the JSON object.
• If "path" is provided, ensuring its value is a complete and valid path.
• Specifying a location (either in the provided "path" or active file) where no breakpoint exists.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_disable_breakpoint>{"line": LINE_NUMBER, "path": "PATH_TO_FILE", "column": COLUMN_NUMBER_IF_INLINE}</debug_disable_breakpoint>
  <!-- Note: "path" and "column" are optional. "line" is REQUIRED. -->
───────────────────────────────────────────────

### Parameters:
All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_disable_breakpoint> tag.

-   "path" (string, optional): The path to the source file of the breakpoint (relative to the current workspace directory ${args.cwd}). If omitted, the path of the currently active file will be used. If provided, it must be a complete and valid path.
-   "line" (number, REQUIRED): The line number of the breakpoint to disable.
-   "column" (number, optional): The column number if disabling an inline breakpoint.

### Examples:

1.  **Disable a breakpoint at line 15 of \`src/app.py\`:**
    \`\`\`xml
    <debug_disable_breakpoint>{"path": "src/app.py", "line": 15}</debug_disable_breakpoint>
    \`\`\`

2.  **Disable a breakpoint at line 10 of the currently active file (omitting "path"):**
    \`\`\`xml
    <debug_disable_breakpoint>{"line": 10}</debug_disable_breakpoint>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
