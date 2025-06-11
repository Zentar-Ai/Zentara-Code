export function getDebugPrettyPrintToolDescription(): string {
	return `## debug_pretty_print – Pretty-Print an Expression Value

Description:
The "debug_pretty_print" tool evaluates an expression within a specified stack frame and returns a formatted, human-readable string representation of its value. This is often used for complex objects or data structures.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_pretty_print> tag.
2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the <debug_pretty_print> tag.
3️⃣ The JSON object MUST contain an "expression" key with the expression string whose value you want to pretty-print.
4️⃣ Optionally, include "frameId" (integer) and "context" (string, e.g., "watch", "repl", "hover") in the JSON object. If "frameId" is omitted, the current top frame ID is used.
5️⃣ Ensure the <debug_pretty_print> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• Missing "expression" key in the JSON object. If "frameId" is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• "expression" value is syntactically incorrect or refers to undefined variables.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_pretty_print>{"expression": "my_complex_object", "frameId": 0, "context": "repl"}</debug_pretty_print>
  <!-- Note: "frameId" and "context" are optional. "expression" is REQUIRED. -->
───────────────────────────────────────────────

### Parameters:
All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_pretty_print> tag.

-   "frameId" (number, optional): The ID of the stack frame in which to evaluate the expression. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 is usually the current frame.
-   "expression" (string, REQUIRED): The expression to evaluate and pretty-print.
-   "context" (string, optional): Hints the context of the evaluation (e.g., "watch", "repl", "hover").

### Result:
The result is typically a JSON string containing the pretty-printed string representation of the expression's value.

### Examples:

1.  **Pretty-print the value of \`my_object\` in the current frame (frameId 0):**
    \`\`\`xml
    <debug_pretty_print>{"frameId": 0, "expression": "my_object"}</debug_pretty_print>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
