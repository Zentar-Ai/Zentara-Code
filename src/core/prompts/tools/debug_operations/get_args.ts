export function getDebugGetArgsToolDescription(): string {
	return `## debug_get_args – Display Argument Values for a Frame

Description:
The "debug_get_args" tool retrieves the arguments passed to the function/method of a specified stack frame, along with their current values.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_get_args> tag.
2️⃣ Provide parameters as a single, well-formed JSON object string as the text content of the <debug_get_args> tag.
3️⃣ Optionally, include "frameId" (integer) in the JSON object. If "frameId" is omitted, the current top frame ID from the last debugger stop event will be used. If no parameters are needed, provide an empty JSON object \`{}\` or leave the content empty.
4️⃣ Ensure the <debug_get_args> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• If "frameId" is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• Providing an invalid "frameId" value.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_get_args>{"frameId": 0}</debug_get_args>
  <!-- Or for current top frame (if available): <debug_get_args>{}</debug_get_args> or <debug_get_args></debug_get_args> -->
───────────────────────────────────────────────

### Parameters:
Parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_get_args> tag.

-   "frameId" (number, optional): The ID of the stack frame for which to retrieve arguments. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 is usually the current frame. If no parameters are needed, an empty JSON object \`{}\` can be used.

### Result:
The result is typically a JSON string representing an array or object of arguments, with each argument showing its name, type, and current value.

### Examples:

1.  **Get arguments for the current stack frame (frame 0):**
    \`\`\`xml
    <debug_get_args>{"frameId": 0}</debug_get_args>
    \`\`\`

2.  **Get arguments for the current top frame (if available, by omitting frameId or using empty JSON):**
    \`\`\`xml
    <debug_get_args>{}</debug_get_args>
    \`\`\`
    Or:
    \`\`\`xml
    <debug_get_args></debug_get_args>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
