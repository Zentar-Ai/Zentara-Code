import { ToolArgs } from "../types"

export function getDebugEnableBreakpointToolDescription(args: ToolArgs): string {
	return `## debug_enable_breakpoint – Enable a Disabled Breakpoint

Description:
The "debug_enable_breakpoint" tool re-enables a previously disabled breakpoint at a specified location, allowing it to pause execution again.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_enable_breakpoint> tag.
2️⃣ Optionally, provide the <path> child tag with the file path of the disabled breakpoint. If omitted, the currently active file will be used.
3️⃣ Provide the REQUIRED <line> child tag with the line number of the disabled breakpoint.
4️⃣ Optionally, include <column> if it's an inline breakpoint.
5️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <line> tag.
• If <path> is provided, ensuring it's a complete and valid path.
• Specifying a location (either in the provided path or active file) where no disabled breakpoint exists (or no breakpoint at all).

────────────  COPY-READY TEMPLATE  ────────────
  <debug_enable_breakpoint>
    <!-- Optional: <path>PATH_TO_FILE</path> (Defaults to active file if omitted) -->
    <line>LINE_NUMBER</line>
    <!-- Optional: <column>COLUMN_NUMBER_IF_INLINE</column> -->
  </debug_enable_breakpoint>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_enable_breakpoint> tag.

-   <path> (string, optional): The path to the source file of the breakpoint (relative to the current workspace directory ${args.cwd}). If omitted, the path of the currently active file will be used. If provided, it must be a complete and valid path.
-   <line> (number, REQUIRED): The line number of the breakpoint to enable.
-   <column> (number, optional): The column number if enabling an inline breakpoint.

### Examples:

1.  **Enable a disabled breakpoint at line 15 of \`src/app.py\`:**
    \`\`\`xml
    <debug_enable_breakpoint>
    <path>src/app.py</path>
    <line>15</line>
    </debug_enable_breakpoint>
    \`\`\`

2.  **Enable a disabled breakpoint at line 20 of the currently active file:**
    \`\`\`xml
    <debug_enable_breakpoint>
      <line>20</line>
    </debug_enable_breakpoint>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
