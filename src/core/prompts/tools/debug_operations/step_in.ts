export function getDebugStepInToolDescription(): string {
	return `## debug_step_in – Step Into Function Call

Description:
The "debug_step_in" tool executes the current line. If the current line contains a function call, the debugger will stop at the first line inside that function. If the current line does not contain a function call, it behaves like the "debug_next" tool, moving to the next line in the current function.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_step_in> tag.
2️⃣ This operation takes no arguments.
3️⃣ Ensure the tag is correctly closed: </debug_step_in>.

⚠️ **Common Breakers**
• Including unexpected child tags (it takes no arguments).
• Forgetting to close the <debug_step_in> tag.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_step_in></debug_step_in>
───────────────────────────────────────────────

### Parameters:
This operation takes no parameters.

### Examples:

1.  **Step into a function call on the current line, or to the next line if no function call:**
    \`\`\`xml
    <debug_step_in></debug_step_in>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
