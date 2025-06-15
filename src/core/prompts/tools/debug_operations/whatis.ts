export function getDebugWhatisToolDescription(): string {
	return `## debug_whatis – Get Type of an Expression

Description:
The "debug_whatis" tool evaluates an expression within a specified stack frame and returns the type of the resulting value (e.g., "int", "str", "list", "MyCustomClass").

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_whatis> tag.
2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the <debug_whatis> tag.
3️⃣ The JSON object MUST contain an "expression" key with the expression string whose type you want to determine.
4️⃣ Optionally, include "frameId" (integer) and "context" (string, e.g., "watch", "repl", "hover") in the JSON object. If "frameId" is omitted, the current top frame ID is used.
5️⃣ Ensure the <debug_whatis> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• Missing "expression" key in the JSON object. If "frameId" is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• "expression" value is syntactically incorrect or refers to undefined variables.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_whatis>{"expression": "my_variable", "frameId": 0, "context": "hover"}</debug_whatis>
  <!-- Note: "frameId" and "context" are optional. "expression" is REQUIRED. -->
───────────────────────────────────────────────

### Parameters:
All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_whatis> tag.

-   "frameId" (number, optional): The ID of the stack frame in which to evaluate the expression. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 is usually the current frame.
-   "expression" (string, REQUIRED): The expression whose type is to be determined.
-   "context" (string, optional): Hints the context of the evaluation (e.g., "watch", "repl", "hover").

### Result:
The result is typically a JSON string containing the type of the expression's value.

### Examples:

1.  **Get the type of \`my_variable\` in the current frame (frameId 0):**
    \`\`\`xml
    <debug_whatis>{"frameId": 0, "expression": "my_variable"}</debug_whatis>
    \`\`\`

2.  **Get the type of \`calculate_value(5)\` in frame 0:**
    \`\`\`xml
    <debug_whatis>{"frameId": 0, "expression": "calculate_value(5)"}</debug_whatis>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
