import { ToolArgs } from "../types"

export function getDebugRemoveBreakpointToolDescription(args: ToolArgs): string {
	return `## debug_remove_breakpoint – Remove a Breakpoint

Description:
The "debug_remove_breakpoint" tool removes an existing breakpoint at a specified location in a source file.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_remove_breakpoint> tag.
2️⃣ Optionally, provide the <path> child tag with the file path where the breakpoint exists. If omitted, the currently active file will be used.
3️⃣ Provide the REQUIRED <line> child tag with the line number of the breakpoint.
4️⃣ Optionally, include <column> if it's an inline breakpoint.
5️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <line> tag.
• If <path> is provided, ensuring it's a complete and valid path.
• Specifying a location (either in the provided path or active file) where no breakpoint exists.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_remove_breakpoint>
    <!-- Optional: <path>PATH_TO_FILE</path> (Defaults to active file if omitted) -->
    <line>LINE_NUMBER</line>
    <!-- Optional: <column>COLUMN_NUMBER_IF_INLINE</column> -->
  </debug_remove_breakpoint>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_remove_breakpoint> tag.

-   <path> (string, optional): The path to the source file of the breakpoint (relative to the current workspace directory ${args.cwd}). If omitted, the path of the currently active file will be used. If provided, it must be a complete and valid path.
-   <line> (number, REQUIRED): The line number of the breakpoint to remove.
-   <column> (number, optional): The column number if removing an inline breakpoint.

### Examples:

1.  **Remove a breakpoint at line 15 of \`src/app.py\`:**
    \`\`\`xml
    <debug_remove_breakpoint>
      <path>src/app.py</path>
      <line>15</line>
    </debug_remove_breakpoint>
    \`\`\`

2.  **Remove an inline breakpoint from the active file:**
    \`\`\`xml
    <debug_remove_breakpoint>
      <line>1</line>
      <column>58</column>
    </debug_remove_breakpoint>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
