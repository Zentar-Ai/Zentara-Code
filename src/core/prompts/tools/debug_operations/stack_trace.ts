export function getDebugStackTraceToolDescription(): string {
	return `## debug_stack_trace – Display Current Call Stack

Description:
The "debug_stack_trace" tool displays the current call stack of the paused program. This shows the sequence of function/method calls that led to the current point of execution.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_stack_trace> tag.
2️⃣ This operation takes no arguments.
3️⃣ Ensure the tag is correctly closed: </debug_stack_trace>.

⚠️ **Common Breakers**
• Including unexpected child tags (it takes no arguments).
• Forgetting to close the <debug_stack_trace> tag.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_stack_trace></debug_stack_trace>
───────────────────────────────────────────────

### Parameters:
This operation takes no parameters.

### Result:
The result will be a JSON string representing an array of stack frame objects. Each frame typically includes:
- \`id\`: A unique identifier for the frame, used in other operations like \`goto_frame\`, \`evaluate\`.
- \`name\`: The name of the function or method for this frame (e.g., "myFunction", "MyClass.myMethod").
- \`source\`: An object containing the \`path\` to the source file.
- \`line\`: The current line number within this frame.
- \`column\`: The current column number within this frame.
Other debugger-specific information might also be present.

### Examples:

1.  **Display the current call stack:**
    \`\`\`xml
    <debug_stack_trace></debug_stack_trace>
    \`\`\`
    *(The tool will return a JSON string with the stack trace details.)*
────────────────────────────────────────────────────────────────────────────
`
}
