export function getDebugStepOutToolDescription(): string {
	return `## debug_step_out – Step Out of Current Function

Description:
The "debug_step_out" tool continues execution until the current function returns. The debugger will then stop on the line in the calling function, immediately after the call to the function that was just exited. This is useful for quickly finishing the execution of a function you have stepped into.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_step_out> tag.
2️⃣ This operation takes no arguments.
3️⃣ Ensure the tag is correctly closed: </debug_step_out>.

⚠️ **Common Breakers**
• Including unexpected child tags (it takes no arguments).
• Forgetting to close the <debug_step_out> tag.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_step_out></debug_step_out>
───────────────────────────────────────────────

### Parameters:
This operation takes no parameters.

### Examples:

1.  **Continue execution until the current function returns, then stop:**
    \`\`\`xml
    <debug_step_out></debug_step_out>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
