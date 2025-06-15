export function getDebugContinueToolDescription(): string {
	return `## debug_continue – Continue Program Execution

Description:
The "debug_continue" tool resumes program execution until the next breakpoint is hit, the program finishes, or an unhandled exception occurs. If there are no breakpoints or exceptions, the program will run to completion.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_continue> tag.
2️⃣ For operations that take no arguments, provide an empty JSON object \`{}\` as the text content, or leave the content empty.
   Example: \`<debug_continue>{}</debug_continue>\` or \`<debug_continue></debug_continue>\`.
3️⃣ Ensure the tag is correctly closed: </debug_continue>.

⚠️ **Common Breakers**
• Providing unexpected JSON content (it should be empty \`{}\` or no content).
• Forgetting to close the <debug_continue> tag.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_continue>{}</debug_continue>
  <!-- Alternatively, with no content: <debug_continue></debug_continue> -->
───────────────────────────────────────────────

### Parameters:
This operation takes no parameters. The JSON content should be an empty object \`{}\` or the tag content can be empty.

### Examples:

1.  **Continue execution until the next breakpoint or program end:**
    \`\`\`xml
    <debug_continue>{}</debug_continue>
    \`\`\`
    Or:
    \`\`\`xml
    <debug_continue></debug_continue>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
