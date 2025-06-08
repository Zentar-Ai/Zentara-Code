import { ToolArgs } from "../types"

export function getDebugRemoveAllBreakpointsInFileToolDescription(args: ToolArgs): string {
	return `## debug_remove_all_breakpoints_in_file – Remove All Breakpoints in a File

Description:
The "debug_remove_all_breakpoints_in_file" tool removes all breakpoints currently set in a specified source file.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_remove_all_breakpoints_in_file> tag.
2️⃣ Optionally, provide the <path> child tag with the file path from which to remove all breakpoints. If omitted, the currently active file will be used.
3️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• If <path> is provided, ensuring it's a complete and valid path.
• Specifying a path (either provided or the active file) to a file that has no breakpoints (though this is not an error, just no action).

────────────  COPY-READY TEMPLATE  ────────────
  <debug_remove_all_breakpoints_in_file>
    <!-- Optional: <path>PATH_TO_FILE</path> (Defaults to active file if omitted) -->
  </debug_remove_all_breakpoints_in_file>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_remove_all_breakpoints_in_file> tag.

-   <path> (string, optional): The path to the source file from which all breakpoints will be removed (relative to the current workspace directory ${args.cwd}). If omitted, the path of the currently active file will be used. If provided, it must be a complete and valid path.

### Examples:

1.  **Remove all breakpoints from \`src/app.py\`:**
    \`\`\`xml
    <debug_remove_all_breakpoints_in_file>
      <path>src/app.py</path>
    </debug_remove_all_breakpoints_in_file>
    \`\`\`

2.  **Remove all breakpoints from the currently active file:**
    \`\`\`xml
    <debug_remove_all_breakpoints_in_file>
    </debug_remove_all_breakpoints_in_file>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
