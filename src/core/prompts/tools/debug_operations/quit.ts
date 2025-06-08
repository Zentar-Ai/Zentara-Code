export function getDebugQuitToolDescription(): string {
	return `## debug_quit – Terminate the Debugging Session

Description:
The "debug_quit" tool terminates the currently running program and exits the debugger. It is crucial to use this operation before attempting to edit files that are part of the debugged program, especially if the debugger might hold locks or if the program has open resources. Failure to quit the session before such edits can lead to unexpected behavior or file corruption.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_quit> tag.
2️⃣ This operation takes no arguments.
3️⃣ Ensure the tag is correctly closed: </debug_quit>.

⚠️ **Common Breakers**
• Including unexpected child tags (it takes no arguments).
• Forgetting to close the <debug_quit> tag.
• Attempting to edit debugged files *before* quitting the session.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_quit></debug_quit>
───────────────────────────────────────────────

### Parameters:
This operation takes no parameters.

### Examples:

1.  **Terminate the current debugging session:**
    \`\`\`xml
    <debug_quit></debug_quit>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
