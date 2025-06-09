export function getDebugExecuteStatementToolDescription(): string {
	return `## debug_execute_statement – Execute a Statement with Side-Effects

Description:
The "debug_execute_statement" tool executes a given statement within the context of a specified stack frame. Unlike "debug_evaluate", this tool is intended for statements that have side effects (e.g., assigning a value to a variable, calling a function that modifies state). The result of the statement itself is usually not the primary concern.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_execute_statement> tag.
2️⃣ Optionally, provide the <frameId> child tag. If omitted, the current top frame ID from the last debugger stop event will be used.
3️⃣ Provide the REQUIRED <statement> child tag with the statement to execute.
4️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <statement> tag. If <frameId> is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• Statement is syntactically incorrect or causes an error during execution.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_execute_statement>
    <!-- Optional: <frameId>0</frameId> (Defaults to current top frame if omitted) -->
    <statement>my_variable = new_value</statement>
  </debug_execute_statement>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_execute_statement> tag.

-   <frameId> (number, optional): The ID of the stack frame in which to execute the statement. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 is usually the current frame.
-   <statement> (string, REQUIRED): The statement to execute. This statement can modify program state.

### Result:
The tool typically returns a success status or information about any errors encountered during execution. The direct result of the statement (if any) might not always be returned or might be minimal.

### Examples:

1.  **Assign a new value to \`x\` in the current frame:**
    \`\`\`xml
    <debug_execute_statement>
      <frameId>0</frameId>
      <statement>x = 20</statement>
    </debug_execute_statement>
    \`\`\`

2.  **Call a function that modifies global state:**
    \`\`\`xml
    <debug_execute_statement>
      <frameId>0</frameId>
      <statement>update_global_counter()</statement>
    </debug_execute_statement>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
