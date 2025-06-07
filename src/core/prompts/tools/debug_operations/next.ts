export function getDebugNextToolDescription(): string {
	return `## debug_next – Step Over Current Line

Description:
The "debug_next" tool executes the current line of code and stops at the next line in the current function. If the current line contains a function call, the function will be executed completely, and the debugger will stop on the line following the function call (i.e., it "steps over" the function call).

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_next> tag.
2️⃣ This operation takes no arguments.
3️⃣ Ensure the tag is correctly closed: </debug_next>.

⚠️ **Common Breakers**
• Including unexpected child tags (it takes no arguments).
• Forgetting to close the <debug_next> tag.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_next></debug_next>
───────────────────────────────────────────────

### Parameters:
This operation takes no parameters.

### Examples:

1.  **Execute the current line and move to the next line in the current scope:**
    \`\`\`xml
    <debug_next></debug_next>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
