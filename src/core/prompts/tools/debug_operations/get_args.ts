export function getDebugGetArgsToolDescription(): string {
	return `## debug_get_args – Display Argument Values for a Frame

Description:
The "debug_get_args" tool retrieves the arguments passed to the function/method of a specified stack frame, along with their current values.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_get_args> tag.
2️⃣ Provide the REQUIRED <frameId> child tag, typically 0 for the current frame.
3️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <frameId> tag.
• Providing an invalid frame ID.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_get_args>
    <frameId>0</frameId>
  </debug_get_args>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_get_args> tag.

-   <frameId> (number, REQUIRED): The ID of the stack frame for which to retrieve arguments. Frame ID 0 is usually the current frame.

### Result:
The result is typically a JSON string representing an array or object of arguments, with each argument showing its name, type, and current value.

### Examples:

1.  **Get arguments for the current stack frame (frame 0):**
    \`\`\`xml
    <debug_get_args>
      <frameId>0</frameId>
    </debug_get_args>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
