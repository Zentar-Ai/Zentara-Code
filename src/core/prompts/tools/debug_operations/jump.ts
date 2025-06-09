export function getDebugJumpToolDescription(): string {
	return `## debug_jump – Change Next Line to Execute

Description:
The "debug_jump" tool changes the next line of code that will be executed within the current stack frame. This allows you to skip over code or re-execute sections of code without restarting the program. Use with caution, as jumping can lead to unexpected program states if not managed carefully.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_jump> tag.
2️⃣ Optionally, provide the <frameId> child tag. If omitted, the current top frame ID from the last debugger stop event will be used.
3️⃣ Provide the REQUIRED <line> child tag with the target line number in the current source file.
4️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <line> tag. If <frameId> is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• Providing a non-existent line number for the jump.
• Jumping to a line that results in an invalid program state (e.g., skipping variable initializations).

────────────  COPY-READY TEMPLATE  ────────────
  <debug_jump>
    <!-- Optional: <frameId>0</frameId> (Defaults to current top frame if omitted) -->
    <line>TARGET_LINE_NUMBER</line>
  </debug_jump>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_jump> tag.

-   <frameId> (number, optional): The ID of the stack frame in which to perform the jump. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 usually refers to the topmost (current) frame.
-   <line> (number, REQUIRED): The line number in the source file of the current frame to jump to. This line must be within the current function/method scope.

### Examples:

1.  **Jump to line 25 in the current stack frame (frame 0):**
    \`\`\`xml
    <debug_jump>
      <frameId>0</frameId>
      <line>25</line>
    </debug_jump>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
