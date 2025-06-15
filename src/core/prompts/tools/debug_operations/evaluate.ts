export function getDebugEvaluateToolDescription(): string {
	return `## debug_evaluate – Evaluate an Expression in a Frame

Description:
The "debug_evaluate" tool evaluates an arbitrary expression within the context of a specified stack frame and returns its result. This is useful for inspecting variable values, calling functions, or checking conditions.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_evaluate> tag.
2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the <debug_evaluate> tag.
3️⃣ The JSON object MUST contain an "expression" key with the expression string to evaluate.
4️⃣ Optionally, include "frameId" (integer) and "context" (string, e.g., "watch", "repl", "hover") in the JSON object. If "frameId" is omitted, the current top frame ID from the last debugger stop event will be used.
5️⃣ Ensure the <debug_evaluate> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• Missing "expression" key in the JSON object. If "frameId" is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• Expression value is syntactically incorrect or refers to undefined variables in the current context.
• Expression has side effects that alter program state unexpectedly (use "execute_statement" for intentional side effects).

────────────  COPY-READY TEMPLATE  ────────────
  <debug_evaluate>{"expression": "my_variable + 5", "frameId": 0, "context": "watch"}</debug_evaluate>
  <!-- Note: "frameId" and "context" are optional. "expression" is REQUIRED. -->
───────────────────────────────────────────────

### Parameters:
All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_evaluate> tag.

-   "frameId" (number, optional): The ID of the stack frame in which to evaluate the expression. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 is usually the current frame.
-   "expression" (string, REQUIRED): The expression to evaluate.
-   "context" (string, optional): Hints the context of the evaluation. Common values include "watch" (for watch expressions), "repl" (for console/REPL input), "hover" (for hover evaluations). The debugger may use this to format the result differently or enable/disable certain features.

### Result:
The result is typically a JSON string containing the evaluated value of the expression, its type, and potentially other details like its string representation or child properties if it's an object.

### Examples:

1.  **Evaluate \`my_array[2]\` in the current frame (frameId 0):**
    \`\`\`xml
    <debug_evaluate>{"frameId": 0, "expression": "my_array[2]"}</debug_evaluate>
    \`\`\`

2.  **Evaluate \`user.getName()\` in frame 1 with a "watch" context:**
    \`\`\`xml
    <debug_evaluate>{"frameId": 1, "expression": "user.getName()", "context": "watch"}</debug_evaluate>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
