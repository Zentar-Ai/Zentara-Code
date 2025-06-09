export function getDebugPrettyPrintToolDescription(): string {
	return `## debug_pretty_print – Pretty-Print an Expression Value

Description:
The "debug_pretty_print" tool evaluates an expression within a specified stack frame and returns a formatted, human-readable string representation of its value. This is often used for complex objects or data structures.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_pretty_print> tag.
2️⃣ Optionally, provide the <frameId> child tag. If omitted, the current top frame ID from the last debugger stop event will be used.
3️⃣ Provide the REQUIRED <expression> child tag with the expression whose value you want to pretty-print.
4️⃣ Optionally, provide <context> (e.g., "watch", "repl", "hover").
5️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <expression> tag. If <frameId> is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• Expression is syntactically incorrect or refers to undefined variables.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_pretty_print>
    <!-- Optional: <frameId>0</frameId> (Defaults to current top frame if omitted) -->
    <expression>my_complex_object</expression>
    <!-- Optional: <context>repl</context> -->
  </debug_pretty_print>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_pretty_print> tag.

-   <frameId> (number, optional): The ID of the stack frame in which to evaluate the expression. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 is usually the current frame.
-   <expression> (string, REQUIRED): The expression to evaluate and pretty-print.
-   <context> (string, optional): Hints the context of the evaluation (e.g., "watch", "repl", "hover").

### Result:
The result is typically a JSON string containing the pretty-printed string representation of the expression's value.

### Examples:

1.  **Pretty-print the value of \`my_object\` in the current frame:**
    \`\`\`xml
    <debug_pretty_print>
      <frameId>0</frameId>
      <expression>my_object</expression>
    </debug_pretty_print>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
