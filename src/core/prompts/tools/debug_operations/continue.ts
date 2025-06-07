export function getDebugContinueToolDescription(): string {
	return `## debug_continue – Continue Program Execution

Description:
The "debug_continue" tool resumes program execution until the next breakpoint is hit, the program finishes, or an unhandled exception occurs. If there are no breakpoints or exceptions, the program will run to completion.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_continue> tag.
2️⃣ This operation takes no arguments.
3️⃣ Ensure the tag is correctly closed: </debug_continue>.

⚠️ **Common Breakers**
• Including unexpected child tags (it takes no arguments).
• Forgetting to close the <debug_continue> tag.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_continue></debug_continue>
───────────────────────────────────────────────

### Parameters:
This operation takes no parameters.

### Examples:

1.  **Continue execution until the next breakpoint or program end:**
    \`\`\`xml
    <debug_continue></debug_continue>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
