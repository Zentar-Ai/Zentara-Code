export function getDebugListSourceToolDescription(): string {
	return `## debug_list_source – Show Source Code Around Current Line in a Frame

Description:
The "debug_list_source" tool displays lines of source code around the current execution point within a specified stack frame. This helps to see the context of the current line without opening the full file.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_list_source> tag.
2️⃣ Provide the REQUIRED <frameId> child tag, typically 0 for the current frame.
3️⃣ Optionally, provide <linesAround> to specify how many lines before and after the current line to display.
4️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <frameId> tag.
• Invalid <frameId> or <linesAround> value.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_list_source>
    <frameId>0</frameId>
    <!-- Optional: <linesAround>5</linesAround> -->
  </debug_list_source>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_list_source> tag.

-   <frameId> (number, REQUIRED): The ID of the stack frame for which to list source. Frame ID 0 is usually the current frame.
-   <linesAround> (number, optional): The number of lines to show before and after the current execution line. If not specified, a default number of lines (e.g., 5 or 10) will be shown.

### Result:
The result is typically a string containing the requested lines of source code, possibly with line numbers and an indicator for the current execution line.

### Examples:

1.  **List source around the current line in frame 0 (default lines around):**
    \`\`\`xml
    <debug_list_source>
      <frameId>0</frameId>
    </debug_list_source>
    \`\`\`

2.  **List 3 lines before and 3 lines after the current line in frame 0:**
    \`\`\`xml
    <debug_list_source>
      <frameId>0</frameId>
      <linesAround>3</linesAround>
    </debug_list_source>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
