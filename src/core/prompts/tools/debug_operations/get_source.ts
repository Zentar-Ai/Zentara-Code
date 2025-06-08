export function getDebugGetSourceToolDescription(): string {
	return `## debug_get_source – Retrieve Source Definition for an Object/Function

Description:
The "debug_get_source" tool attempts to retrieve the source code definition for an object, function, or class given as an expression within a specific stack frame. This is useful for quickly viewing the implementation of an item without manually navigating to its definition.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_get_source> tag.
2️⃣ Provide the REQUIRED <frameId> child tag, typically 0 for the current frame.
3️⃣ Provide the REQUIRED <expression> child tag with the name of the object, function, or class (e.g., \`my_variable\`, \`my_function\`, \`MyClass\`).
4️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <frameId> or <expression> tags.
• Expression refers to something whose source cannot be located by the debugger (e.g., built-in types, dynamically generated code without source mapping).

────────────  COPY-READY TEMPLATE  ────────────
  <debug_get_source>
    <frameId>0</frameId>
    <expression>my_function_name</expression>
  </debug_get_source>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_get_source> tag.

-   <frameId> (number, REQUIRED): The ID of the stack frame in which to evaluate the expression. Frame ID 0 is usually the current frame.
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
