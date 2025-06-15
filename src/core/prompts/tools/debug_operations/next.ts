export function getDebugNextToolDescription(): string {
	return `## debug_next – Step Over Current Line

Description:
The "debug_next" tool executes the current line of code and stops at the next line in the current function. If the current line contains a function call, the function will be executed completely, and the debugger will stop on the line following the function call (i.e., it "steps over" the function call).

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_next> tag.
2️⃣ For operations that take no arguments, provide an empty JSON object \`{}\` as the text content, or leave the content empty.
   Example: \`<debug_next>{}</debug_next>\` or \`<debug_next></debug_next>\`.
3️⃣ Ensure the tag is correctly closed: </debug_next>.

⚠️ **Common Breakers**
• Providing unexpected JSON content (it should be empty \`{}\` or no content).
• Forgetting to close the <debug_next> tag.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_next>{}</debug_next>
  <!-- Alternatively, with no content: <debug_next></debug_next> -->
───────────────────────────────────────────────

### Parameters:
This operation takes no parameters. The JSON content should be an empty object \`{}\` or the tag content can be empty.

### Examples:

1.  **Execute the current line and move to the next line in the current scope:**
    \`\`\`xml
    <debug_next>{}</debug_next>
    \`\`\`
    Or:
    \`\`\`xml
    <debug_next></debug_next>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
