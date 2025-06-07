export function getDebugJumpToolDescription(): string {
	return `## debug_jump – Change Next Line to Execute

Description:
The "debug_jump" tool changes the next line of code that will be executed within the current stack frame. This allows you to skip over code or re-execute sections of code without restarting the program. Use with caution, as jumping can lead to unexpected program states if not managed carefully.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_jump> tag.
2️⃣ Provide the REQUIRED <frameId> child tag, typically 0 for the current frame.
3️⃣ Provide the REQUIRED <line> child tag with the target line number in the current source file.
4️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <frameId> or <line> tags.
• Providing a non-existent line number for the jump.
• Jumping to a line that results in an invalid program state (e.g., skipping variable initializations).

────────────  COPY-READY TEMPLATE  ────────────
  <debug_jump>
    <frameId>0</frameId>
    <line>TARGET_LINE_NUMBER</line>
  </debug_jump>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_jump> tag.

-   <frameId> (number, REQUIRED): The ID of the stack frame in which to perform the jump. Frame ID 0 usually refers to the topmost (current) frame.
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
