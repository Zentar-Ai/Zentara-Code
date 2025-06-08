export function getDebugPrettyPrintToolDescription(): string {
	return `## debug_pretty_print – Pretty-Print an Expression Value

Description:
The "debug_pretty_print" tool evaluates an expression within a specified stack frame and returns a formatted, human-readable string representation of its value. This is often used for complex objects or data structures.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_pretty_print> tag.
2️⃣ Provide the REQUIRED <frameId> child tag, typically 0 for the current frame.
3️⃣ Provide the REQUIRED <expression> child tag with the expression whose value you want to pretty-print.
4️⃣ Optionally, provide <context> (e.g., "watch", "repl", "hover").
5️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <frameId> or <expression> tags.
• Expression is syntactically incorrect or refers to undefined variables.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_pretty_print>
    <frameId>0</frameId>
    <expression>my_complex_object</expression>
    <!-- Optional: <context>repl</context> -->
  </debug_pretty_print>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_pretty_print> tag.

-   <frameId> (number, REQUIRED): The ID of the stack frame in which to evaluate the expression. Frame ID 0 is usually the current frame.
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
