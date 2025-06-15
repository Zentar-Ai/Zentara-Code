export function getDebugGotoFrameToolDescription(): string {
	return `## debug_goto_frame – Switch to a Specific Stack Frame

Description:
The "debug_goto_frame" tool changes the debugger's current focus to a specific stack frame, identified by its ID (obtained from \`debug_stack_trace\`). This allows you to inspect variables, list source, or evaluate expressions within the context of that chosen frame.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_goto_frame> tag.
2️⃣ Provide parameters as a single, well-formed JSON object string as the text content of the <debug_goto_frame> tag.
3️⃣ Optionally, include "frameId" (integer) in the JSON object. If "frameId" is omitted, the current top frame ID from the last debugger stop event will be used. If no parameters are needed (to default to current frame), provide an empty JSON object \`{}\` or leave the content empty.
4️⃣ Ensure the <debug_goto_frame> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• If "frameId" is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• Providing an invalid or non-existent "frameId" value.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_goto_frame>{"frameId": FRAME_ID_FROM_STACK_TRACE}</debug_goto_frame>
  <!-- Or for current top frame (if available): <debug_goto_frame>{}</debug_goto_frame> or <debug_goto_frame></debug_goto_frame> -->
───────────────────────────────────────────────

### Parameters:
Parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_goto_frame> tag.

-   "frameId" (number, optional): The unique identifier of the stack frame to switch to. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame IDs are typically obtained from the output of the \`debug_stack_trace\` tool. If no parameters are needed (to default to current frame), an empty JSON object \`{}\` can be used.

### Result:
The debugger's context shifts to the specified frame. The tool might return information about the new current frame or simply a success status.

### Examples:

1.  **Switch to stack frame with ID 2:**
    \`\`\`xml
    <debug_goto_frame>{"frameId": 2}</debug_goto_frame>
    \`\`\`

2.  **Switch to the current top frame (if available, by omitting frameId or using empty JSON):**
    \`\`\`xml
    <debug_goto_frame>{}</debug_goto_frame>
    \`\`\`
    Or:
    \`\`\`xml
    <debug_goto_frame></debug_goto_frame>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
