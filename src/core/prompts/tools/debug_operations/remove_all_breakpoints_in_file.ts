import { ToolArgs } from "../types"

export function getDebugRemoveAllBreakpointsInFileToolDescription(args: ToolArgs): string {
	return `## debug_remove_all_breakpoints_in_file – Remove All Breakpoints in a File

Description:
The "debug_remove_all_breakpoints_in_file" tool removes all breakpoints currently set in a specified source file.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_remove_all_breakpoints_in_file> tag.
2️⃣ Provide parameters as a single, well-formed JSON object string as the text content of the <debug_remove_all_breakpoints_in_file> tag.
3️⃣ Optionally, include a "path" (string) key in the JSON object. If "path" is omitted, the currently active file will be used. If no "path" is needed (to default to active file), provide an empty JSON object \`{}\` or leave the content empty.
4️⃣ Ensure the <debug_remove_all_breakpoints_in_file> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• If "path" is provided, ensuring its value is a complete and valid path.
• Specifying a "path" (either provided or the active file) to a file that has no breakpoints (though this is not an error, just no action).

────────────  COPY-READY TEMPLATE  ────────────
  <debug_remove_all_breakpoints_in_file>{"path": "PATH_TO_FILE"}</debug_remove_all_breakpoints_in_file>
  <!-- Or for active file: <debug_remove_all_breakpoints_in_file>{}</debug_remove_all_breakpoints_in_file> or <debug_remove_all_breakpoints_in_file></debug_remove_all_breakpoints_in_file> -->
───────────────────────────────────────────────

### Parameters:
Parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_remove_all_breakpoints_in_file> tag.

-   "path" (string, optional): The path to the source file from which all breakpoints will be removed (relative to the current workspace directory ${args.cwd}). If omitted, the path of the currently active file will be used. If provided, it must be a complete and valid path. If no "path" is needed (to default to active file), an empty JSON object \`{}\` can be used.

### Examples:

1.  **Remove all breakpoints from \`src/app.py\`:**
    \`\`\`xml
    <debug_remove_all_breakpoints_in_file>{"path": "src/app.py"}</debug_remove_all_breakpoints_in_file>
    \`\`\`

2.  **Remove all breakpoints from the currently active file:**
    \`\`\`xml
    <debug_remove_all_breakpoints_in_file>{}</debug_remove_all_breakpoints_in_file>
    \`\`\`
    Or:
    \`\`\`xml
    <debug_remove_all_breakpoints_in_file></debug_remove_all_breakpoints_in_file>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
