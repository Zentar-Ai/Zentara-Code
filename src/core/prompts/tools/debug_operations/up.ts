export function getDebugUpToolDescription(): string {
	return `## debug_up – Move Up the Call Stack

Description:
The "debug_up" tool moves the debugger's current focus one level up in the call stack to the calling function/method. This changes the context for subsequent operations like listing source or evaluating variables to that of the caller's frame.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_up> tag.
2️⃣ This operation takes no arguments.
3️⃣ Ensure the tag is correctly closed: </debug_up>.

⚠️ **Common Breakers**
• Including unexpected child tags (it takes no arguments).
• Forgetting to close the <debug_up> tag.
• Attempting to move up when already at the outermost (bottom) frame of the stack.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_up></debug_up>
───────────────────────────────────────────────

### Parameters:
This operation takes no parameters.

### Result:
The debugger's context shifts to the caller's frame. The tool might return information about the new current frame or simply a success status.

### Examples:

1.  **Move one level up the call stack:**
    \`\`\`xml
    <debug_up></debug_up>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
