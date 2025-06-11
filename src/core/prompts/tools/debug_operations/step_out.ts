export function getDebugStepOutToolDescription(): string {
	return `## debug_step_out – Step Out of Current Function

Description:
The "debug_step_out" tool continues execution until the current function returns. The debugger will then stop on the line in the calling function, immediately after the call to the function that was just exited. This is useful for quickly finishing the execution of a function you have stepped into.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_step_out> tag.
2️⃣ For operations that take no arguments, provide an empty JSON object \`{}\` as the text content, or leave the content empty.
   Example: \`<debug_step_out>{}</debug_step_out>\` or \`<debug_step_out></debug_step_out>\`.
3️⃣ Ensure the tag is correctly closed: </debug_step_out>.

⚠️ **Common Breakers**
• Providing unexpected JSON content (it should be empty \`{}\` or no content).
• Forgetting to close the <debug_step_out> tag.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_step_out>{}</debug_step_out>
  <!-- Alternatively, with no content: <debug_step_out></debug_step_out> -->
───────────────────────────────────────────────

### Parameters:
This operation takes no parameters. The JSON content should be an empty object \`{}\` or the tag content can be empty.

### Examples:

1.  **Continue execution until the current function returns, then stop:**
    \`\`\`xml
    <debug_step_out>{}</debug_step_out>
    \`\`\`
    Or:
    \`\`\`xml
    <debug_step_out></debug_step_out>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
