export function getDebugDownToolDescription(): string {
	return `## debug_down – Move Down the Call Stack

Description:
The "debug_down" tool moves the debugger's current focus one level down in the call stack to the called function/method (if the current frame is not the innermost). This changes the context for subsequent operations to that of the callee's frame.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_down> tag.
2️⃣ For operations that take no arguments, provide an empty JSON object \`{}\` as the text content, or leave the content empty.
   Example: \`<debug_down>{}</debug_down>\` or \`<debug_down></debug_down>\`.
3️⃣ Ensure the tag is correctly closed: </debug_down>.

⚠️ **Common Breakers**
• Providing unexpected JSON content (it should be empty \`{}\` or no content).
• Forgetting to close the <debug_down> tag.
• Attempting to move down when already at the innermost (top) frame of the stack.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_down>{}</debug_down>
  <!-- Alternatively, with no content: <debug_down></debug_down> -->
───────────────────────────────────────────────

### Parameters:
This operation takes no parameters. The JSON content should be an empty object \`{}\` or the tag content can be empty.

### Result:
The debugger's context shifts to the callee's frame. The tool might return information about the new current frame or simply a success status.

### Examples:

1.  **Move one level down the call stack:**
    \`\`\`xml
    <debug_down>{}</debug_down>
    \`\`\`
    Or:
    \`\`\`xml
    <debug_down></debug_down>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
