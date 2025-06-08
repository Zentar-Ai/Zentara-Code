import { ToolArgs } from "../types"

export function getDebugIgnoreBreakpointToolDescription(args: ToolArgs): string {
	return `## debug_ignore_breakpoint – Ignore Breakpoint Hits

Description:
The "debug_ignore_breakpoint" tool sets or clears an ignore count for a breakpoint. If an ignore count is set (e.g., 3), the breakpoint will be skipped for that many hits before it pauses execution. Setting ignoreCount to null or omitting it might clear the ignore count, causing it to break on every hit (debugger specific behavior, typically clearing).

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_ignore_breakpoint> tag.
2️⃣ Optionally, provide the <path> child tag with the file path of the breakpoint. If omitted, the currently active file will be used.
3️⃣ Provide the REQUIRED <line> child tag with the line number of the breakpoint.
4️⃣ Optionally, include <column> for inline breakpoints.
5️⃣ Optionally, provide <ignoreCount> with a number to set how many times the breakpoint should be ignored before breaking. To clear a previous ignore count, the behavior might depend on the specific debugger (often omitting ignoreCount or providing a null-like value if supported by the schema, though our schema expects a number or null).
6️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <line> tag.
• If <path> is provided, ensuring it's a complete and valid path.
• Providing an invalid value for <ignoreCount>.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_ignore_breakpoint>
    <!-- Optional: <path>PATH_TO_FILE</path> (Defaults to active file if omitted) -->
    <line>LINE_NUMBER</line>
    <!-- Optional: <column>COLUMN_NUMBER</column> -->
    <!-- Optional: <ignoreCount>3</ignoreCount> (ignore next 3 hits) -->
    <!-- To clear ignore count, you might omit ignoreCount or specific debuggers might support a null-like value if the schema allowed it. For this tool, provide a number or null. -->
  </debug_ignore_breakpoint>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_ignore_breakpoint> tag.

-   <path> (string, optional): The path to the source file of the breakpoint (relative to the current workspace directory ${args.cwd}). If omitted, the path of the currently active file will be used. If provided, it must be a complete and valid path.
-   <line> (number, REQUIRED): The line number of the breakpoint.
-   <column> (number, optional): The column number for an inline breakpoint.
-   <ignoreCount> (number | null, optional): The number of times to ignore this breakpoint before it breaks execution. If set to \`null\` or if the tag is absent after being previously set, it typically clears the ignore count, making the breakpoint active on every hit.

### Examples:

1.  **Ignore the next 3 hits for a breakpoint at line 15 of \`src/app.py\`:**
    \`\`\`xml
    <debug_ignore_breakpoint>
      <path>src/app.py</path>
      <line>15</line>
      <ignoreCount>3</ignoreCount>
    </debug_ignore_breakpoint>
    \`\`\`

2.  **Clear the ignore count for a breakpoint at line 25 of the active file (making it hit every time):**
    (Note: The exact mechanism to clear might depend on the debugger's interpretation of a missing or null ignoreCount. The IDebugController's ignoreBreakpoint method expects 'number | null' for ignoreCount.)
    \`\`\`xml
    <debug_ignore_breakpoint>
      <line>25</line>
      <ignoreCount>null</ignoreCount> <!-- Or simply omit the ignoreCount tag if that's the intended clear mechanism -->
    </debug_ignore_breakpoint>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
