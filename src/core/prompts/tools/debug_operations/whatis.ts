export function getDebugWhatisToolDescription(): string {
	return `## debug_whatis – Get Type of an Expression

Description:
The "debug_whatis" tool evaluates an expression within a specified stack frame and returns the type of the resulting value (e.g., "int", "str", "list", "MyCustomClass").

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_whatis> tag.
2️⃣ Optionally, provide the <frameId> child tag. If omitted, the current top frame ID from the last debugger stop event will be used.
3️⃣ Provide the REQUIRED <expression> child tag with the expression whose type you want to determine.
4️⃣ Optionally, provide <context> (e.g., "watch", "repl", "hover").
5️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <expression> tag. If <frameId> is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• Expression is syntactically incorrect or refers to undefined variables.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_whatis>
    <!-- Optional: <frameId>0</frameId> (Defaults to current top frame if omitted) -->
    <expression>my_variable</expression>
    <!-- Optional: <context>hover</context> -->
  </debug_whatis>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_whatis> tag.

-   <frameId> (number, optional): The ID of the stack frame in which to evaluate the expression. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 is usually the current frame.
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
