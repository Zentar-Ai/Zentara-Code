import { ToolArgs } from "../types"

export function getDebugDisableBreakpointToolDescription(args: ToolArgs): string {
	return `## debug_disable_breakpoint – Disable a Breakpoint

Description:
The "debug_disable_breakpoint" tool disables an existing breakpoint at a specified location. The breakpoint is not removed but will not cause execution to pause until it is re-enabled.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_disable_breakpoint> tag.
2️⃣ Optionally, provide the <path> child tag with the file path of the breakpoint. If omitted, the currently active file will be used.
3️⃣ Provide the REQUIRED <line> child tag with the line number of the breakpoint.
4️⃣ Optionally, include <column> if it's an inline breakpoint.
5️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <line> tag.
• If <path> is provided, ensuring it's a complete and valid path.
• Specifying a location (either in the provided path or active file) where no breakpoint exists.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_disable_breakpoint>
    <!-- Optional: <path>PATH_TO_FILE</path> (Defaults to active file if omitted) -->
    <line>LINE_NUMBER</line>
    <!-- Optional: <column>COLUMN_NUMBER_IF_INLINE</column> -->
  </debug_disable_breakpoint>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_disable_breakpoint> tag.

-   <path> (string, optional): The path to the source file of the breakpoint (relative to the current workspace directory ${args.cwd}). If omitted, the path of the currently active file will be used. If provided, it must be a complete and valid path.
-   <line> (number, REQUIRED): The line number of the breakpoint to disable.
-   <column> (number, optional): The column number if disabling an inline breakpoint.

### Examples:

1.  **Disable a breakpoint at line 15 of \`src/app.py\`:**
    \`\`\`xml
    <debug_disable_breakpoint>
    <path>src/app.py</path>
    <line>15</line>
    </debug_disable_breakpoint>
    \`\`\`

2.  **Disable a breakpoint at line 10 of the currently active file:**
    \`\`\`xml
    <debug_disable_breakpoint>
      <line>10</line>
    </debug_disable_breakpoint>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
