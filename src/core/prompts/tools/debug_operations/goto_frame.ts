export function getDebugGotoFrameToolDescription(): string {
	return `## debug_goto_frame – Switch to a Specific Stack Frame

Description:
The "debug_goto_frame" tool changes the debugger's current focus to a specific stack frame, identified by its ID (obtained from \`debug_stack_trace\`). This allows you to inspect variables, list source, or evaluate expressions within the context of that chosen frame.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_goto_frame> tag.
2️⃣ Provide the REQUIRED <frameId> child tag with the ID of the target stack frame.
3️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <frameId> tag.
• Providing an invalid or non-existent frame ID.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_goto_frame>
    <frameId>FRAME_ID_FROM_STACK_TRACE</frameId>
  </debug_goto_frame>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_goto_frame> tag.

-   <frameId> (number, REQUIRED): The unique identifier of the stack frame to switch to. Frame IDs are typically obtained from the output of the \`debug_stack_trace\` tool.

### Result:
The debugger's context shifts to the specified frame. The tool might return information about the new current frame or simply a success status.

### Examples:

1.  **Switch to stack frame with ID 2:**
    \`\`\`xml
    <debug_goto_frame>
      <frameId>2</frameId>
    </debug_goto_frame>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
