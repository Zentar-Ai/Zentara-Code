export function getDebugExecuteStatementToolDescription(): string {
	return `## debug_execute_statement – Execute a Statement with Side-Effects

Description:
The "debug_execute_statement" tool executes a given statement within the context of a specified stack frame. Unlike "debug_evaluate", this tool is intended for statements that have side effects (e.g., assigning a value to a variable, calling a function that modifies state). The result of the statement itself is usually not the primary concern.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_execute_statement> tag.
2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the <debug_execute_statement> tag.
3️⃣ The JSON object MUST contain a "statement" key with the statement string to execute.
4️⃣ Optionally, include "frameId" (integer) in the JSON object. If "frameId" is omitted, the current top frame ID from the last debugger stop event will be used.
5️⃣ Ensure the <debug_execute_statement> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• Missing "statement" key in the JSON object. If "frameId" is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• Statement value is syntactically incorrect or causes an error during execution.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_execute_statement>{"statement": "my_variable = new_value", "frameId": 0}</debug_execute_statement>
  <!-- Note: "frameId" is optional. "statement" is REQUIRED. -->
───────────────────────────────────────────────

### Parameters:
All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_execute_statement> tag.

-   "frameId" (number, optional): The ID of the stack frame in which to execute the statement. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 is usually the current frame.
-   "statement" (string, REQUIRED): The statement to execute. This statement can modify program state.

### Result:
The tool typically returns a success status or information about any errors encountered during execution. The direct result of the statement (if any) might not always be returned or might be minimal.

### Examples:

1.  **Assign a new value to \`x\` in the current frame (frameId 0):**
    \`\`\`xml
    <debug_execute_statement>{"frameId": 0, "statement": "x = 20"}</debug_execute_statement>
    \`\`\`

2.  **Call a function that modifies global state (using default frameId):**
    \`\`\`xml
    <debug_execute_statement>{"statement": "update_global_counter()"}</debug_execute_statement>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
