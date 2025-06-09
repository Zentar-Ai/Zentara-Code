export function getDebugGetSourceToolDescription(): string {
	return `## debug_get_source – Retrieve Source Definition for an Object/Function

Description:
The "debug_get_source" tool attempts to retrieve the source code definition for an object, function, or class given as an expression within a specific stack frame. This is useful for quickly viewing the implementation of an item without manually navigating to its definition.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_get_source> tag.
2️⃣ Optionally, provide the <frameId> child tag. If omitted, the current top frame ID from the last debugger stop event will be used.
3️⃣ Provide the REQUIRED <expression> child tag with the name of the object, function, or class (e.g., \`my_variable\`, \`my_function\`, \`MyClass\`).
4️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <expression> tag. If <frameId> is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• Expression refers to something whose source cannot be located by the debugger (e.g., built-in types, dynamically generated code without source mapping).

────────────  COPY-READY TEMPLATE  ────────────
  <debug_get_source>
    <!-- Optional: <frameId>0</frameId> (Defaults to current top frame if omitted) -->
    <expression>my_function_name</expression>
  </debug_get_source>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_get_source> tag.

-   <frameId> (number, optional): The ID of the stack frame in which to evaluate the expression. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 is usually the current frame.
-   <expression> (string, REQUIRED): The expression (typically a name) for which to retrieve the source code.

### Result:
The result is usually a string containing the source code of the definition if found. If not found, it may return an error or an empty result.

### Examples:

1.  **Get the source code for \`my_function\` in the current frame:**
    \`\`\`xml
    <debug_get_source>
      <frameId>0</frameId>
      <expression>my_function</expression>
    </debug_get_source>
    \`\`\`

2.  **Get the source code for class \`MyDataObject\` in frame 1:**
    \`\`\`xml
    <debug_get_source>
      <frameId>1</frameId>
      <expression>MyDataObject</expression>
    </debug_get_source>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
