export function getDebugGetActiveBreakpointsToolDescription(): string {
	return `## debug_get_active_breakpoints – List All Active Breakpoints

Description:
The "debug_get_active_breakpoints" tool retrieves a list of all currently set breakpoints in the debugging session, including their locations, conditions, and other properties.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_get_active_breakpoints> tag.
2️⃣ This operation takes no arguments.
3️⃣ Ensure the tag is correctly closed: </debug_get_active_breakpoints>.

⚠️ **Common Breakers**
• Including unexpected child tags (it takes no arguments).
• Forgetting to close the <debug_get_active_breakpoints> tag.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_get_active_breakpoints></debug_get_active_breakpoints>
───────────────────────────────────────────────

### Parameters:
This operation takes no parameters.

### Result:
The result will be a JSON string representing an array of breakpoint objects. Each object typically includes:
- \`id\`: A unique identifier for the breakpoint.
- \`verified\`: A boolean indicating if the breakpoint was successfully set by the debugger.
- \`source\`: An object containing the \`path\` to the file.
- \`line\`: The line number of the breakpoint.
- \`column\`: (Optional) The column number for inline breakpoints.
- \`condition\`: (Optional) The condition string, if set.
- \`hitCondition\`: (Optional) The hit condition string, if set.
- \`logMessage\`: (Optional) The log message string, if set.

### Examples:

1.  **Get a list of all active breakpoints:**
    \`\`\`xml
    <debug_get_active_breakpoints></debug_get_active_breakpoints>
    \`\`\`
    *(The tool will return a JSON string with the breakpoint details.)*
────────────────────────────────────────────────────────────────────────────
`
}
