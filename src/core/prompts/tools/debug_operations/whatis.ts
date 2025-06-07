export function getDebugWhatisToolDescription(): string {
	return `## debug_whatis – Get Type of an Expression

Description:
The "debug_whatis" tool evaluates an expression within a specified stack frame and returns the type of the resulting value (e.g., "int", "str", "list", "MyCustomClass").

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_whatis> tag.
2️⃣ Provide the REQUIRED <frameId> child tag, typically 0 for the current frame.
3️⃣ Provide the REQUIRED <expression> child tag with the expression whose type you want to determine.
4️⃣ Optionally, provide <context> (e.g., "watch", "repl", "hover").
5️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <frameId> or <expression> tags.
• Expression is syntactically incorrect or refers to undefined variables.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_whatis>
    <frameId>0</frameId>
    <expression>my_variable</expression>
    <!-- Optional: <context>hover</context> -->
  </debug_whatis>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_whatis> tag.

-   <frameId> (number, REQUIRED): The ID of the stack frame in which to evaluate the expression. Frame ID 0 is usually the current frame.
-   <expression> (string, REQUIRED): The expression whose type is to be determined.
-   <context> (string, optional): Hints the context of the evaluation (e.g., "watch", "repl", "hover").

### Result:
The result is typically a JSON string containing the type of the expression's value.

### Examples:

1.  **Get the type of \`my_variable\` in the current frame:**
    \`\`\`xml
    <debug_whatis>
      <frameId>0</frameId>
      <expression>my_variable</expression>
    </debug_whatis>
    \`\`\`

2.  **Get the type of \`calculate_value(5)\` in frame 0:**
    \`\`\`xml
    <debug_whatis>
      <frameId>0</frameId>
      <expression>calculate_value(5)</expression>
    </debug_whatis>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
