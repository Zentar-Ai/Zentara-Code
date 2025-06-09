export function getDebugEvaluateToolDescription(): string {
	return `## debug_evaluate – Evaluate an Expression in a Frame

Description:
The "debug_evaluate" tool evaluates an arbitrary expression within the context of a specified stack frame and returns its result. This is useful for inspecting variable values, calling functions, or checking conditions.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_evaluate> tag.
2️⃣ Optionally, provide the <frameId> child tag. If omitted, the current top frame ID from the last debugger stop event will be used.
3️⃣ Provide the REQUIRED <expression> child tag with the expression to evaluate.
4️⃣ Optionally, provide <context> (e.g., "watch", "repl", "hover") to hint how the result might be used, though this may not affect all debuggers.
5️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <expression> tag. If <frameId> is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• Expression is syntactically incorrect or refers to undefined variables in the current context.
• Expression has side effects that alter program state unexpectedly (use "execute_statement" for intentional side effects).

────────────  COPY-READY TEMPLATE  ────────────
  <debug_evaluate>
    <!-- Optional: <frameId>0</frameId> (Defaults to current top frame if omitted) -->
    <expression>my_variable + 5</expression>
    <!-- Optional: <context>watch</context> -->
  </debug_evaluate>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_evaluate> tag.

-   <frameId> (number, optional): The ID of the stack frame in which to evaluate the expression. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 is usually the current frame.
-   <expression> (string, REQUIRED): The expression to evaluate.
-   <context> (string, optional): Hints the context of the evaluation. Common values include "watch" (for watch expressions), "repl" (for console/REPL input), "hover" (for hover evaluations). The debugger may use this to format the result differently or enable/disable certain features.

### Result:
The result is typically a JSON string containing the evaluated value of the expression, its type, and potentially other details like its string representation or child properties if it's an object.

### Examples:

1.  **Evaluate \`my_array[2]\` in the current frame:**
    \`\`\`xml
    <debug_evaluate>
      <frameId>0</frameId>
      <expression>my_array[2]</expression>
    </debug_evaluate>
    \`\`\`

2.  **Evaluate \`user.getName()\` in frame 1 with a "watch" context:**
    \`\`\`xml
    <debug_evaluate>
      <frameId>1</frameId>
      <expression>user.getName()</expression>
      <context>watch</context>
    </debug_evaluate>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
