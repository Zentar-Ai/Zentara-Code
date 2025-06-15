export function getDebugListSourceToolDescription(): string {
	return `## debug_list_source – Show Source Code Around Current Line in a Frame

Description:
The "debug_list_source" tool displays lines of source code around the current execution point within a specified stack frame. This helps to see the context of the current line without opening the full file.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_list_source> tag.
2️⃣ Provide parameters as a single, well-formed JSON object string as the text content of the <debug_list_source> tag.
3️⃣ Optionally, include "frameId" (integer) and "linesAround" (integer) in the JSON object. If "frameId" is omitted, the current top frame is used. If "linesAround" is omitted, a default number of lines is shown. If no parameters are needed, provide an empty JSON object \`{}\` or leave content empty.
4️⃣ Ensure the <debug_list_source> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• If "frameId" is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• Invalid "frameId" or "linesAround" value.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_list_source>{"frameId": 0, "linesAround": 5}</debug_list_source>
  <!-- Note: "frameId" and "linesAround" are optional. If no params, use {}. -->
───────────────────────────────────────────────

### Parameters:
Parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_list_source> tag.

-   "frameId" (number, optional): The ID of the stack frame for which to list source. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 is usually the current frame.
-   "linesAround" (number, optional): The number of lines to show before and after the current execution line. If not specified, a default number of lines (e.g., 5 or 10) will be shown.
If no parameters are needed, an empty JSON object \`{}\` can be used.

### Result:
The result is typically a string containing the requested lines of source code, possibly with line numbers and an indicator for the current execution line.

### Examples:

1.  **List source around the current line in frame 0 (default lines around):**
    \`\`\`xml
    <debug_list_source>{"frameId": 0}</debug_list_source>
    \`\`\`
    Or to use default frame and default lines around:
    \`\`\`xml
    <debug_list_source>{}</debug_list_source>
    \`\`\`

2.  **List 3 lines before and 3 lines after the current line in frame 0:**
    \`\`\`xml
    <debug_list_source>{"frameId": 0, "linesAround": 3}</debug_list_source>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
