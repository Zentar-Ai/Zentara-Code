export function getDebugStepInToolDescription(): string {
	return `## debug_step_in – Step Into Function Call

Description:
The "debug_step_in" tool executes the current line. If the current line contains a function call, the debugger will stop at the first line inside that function. If the current line does not contain a function call, it behaves like the "debug_next" tool, moving to the next line in the current function.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_step_in> tag.
2️⃣ For operations that take no arguments, provide an empty JSON object \`{}\` as the text content, or leave the content empty.
   Example: \`<debug_step_in>{}</debug_step_in>\` or \`<debug_step_in></debug_step_in>\`.
3️⃣ Ensure the tag is correctly closed: </debug_step_in>.

⚠️ **Common Breakers**
• Providing unexpected JSON content (it should be empty \`{}\` or no content).
• Forgetting to close the <debug_step_in> tag.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_step_in>{}</debug_step_in>
  <!-- Alternatively, with no content: <debug_step_in></debug_step_in> -->
───────────────────────────────────────────────

### Parameters:
This operation takes no parameters. The JSON content should be an empty object \`{}\` or the tag content can be empty.

### Examples:

1.  **Step into a function call on the current line, or to the next line if no function call:**
    \`\`\`xml
    <debug_step_in>{}</debug_step_in>
    \`\`\`
    Or:
    \`\`\`xml
    <debug_step_in></debug_step_in>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
