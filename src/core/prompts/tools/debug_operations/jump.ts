export function getDebugJumpToolDescription(): string {
	return `## debug_jump – Change Next Line to Execute

Description:
The "debug_jump" tool changes the next line of code that will be executed within the current stack frame. This allows you to skip over code or re-execute sections of code without restarting the program. Use with caution, as jumping can lead to unexpected program states if not managed carefully.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_jump> tag.
2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the <debug_jump> tag.
3️⃣ The JSON object MUST contain a "line" key with the target line number (integer) in the current source file.
4️⃣ Optionally, include "frameId" (integer) in the JSON object. If "frameId" is omitted, the current top frame ID from the last debugger stop event will be used.
5️⃣ Ensure the <debug_jump> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• Missing "line" key in the JSON object. If "frameId" is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• Providing a non-existent line number for the "line" value.
• Jumping to a line that results in an invalid program state (e.g., skipping variable initializations).

────────────  COPY-READY TEMPLATE  ────────────
  <debug_jump>{"line": TARGET_LINE_NUMBER, "frameId": 0}</debug_jump>
  <!-- Note: "frameId" is optional. "line" is REQUIRED. -->
───────────────────────────────────────────────

### Parameters:
All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_jump> tag.

-   "frameId" (number, optional): The ID of the stack frame in which to perform the jump. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 usually refers to the topmost (current) frame.
-   "line" (number, REQUIRED): The line number in the source file of the current frame to jump to. This line must be within the current function/method scope.

### Examples:

1.  **Jump to line 25 in the current stack frame (frame 0):**
    \`\`\`xml
    <debug_jump>{"frameId": 0, "line": 25}</debug_jump>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
