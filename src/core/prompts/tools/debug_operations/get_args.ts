export function getDebugGetArgsToolDescription(): string {
	return `## debug_get_args – Display Argument Values for a Frame

Description:
The "debug_get_args" tool retrieves the arguments passed to the function/method of a specified stack frame, along with their current values.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_get_args> tag.
2️⃣ Optionally, provide the <frameId> child tag. If omitted, the current top frame ID from the last debugger stop event will be used.
3️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• If <frameId> is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• Providing an invalid frame ID.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_get_args>
    <!-- Optional: <frameId>0</frameId> (Defaults to current top frame if omitted) -->
  </debug_get_args>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_get_args> tag.

-   <frameId> (number, optional): The ID of the stack frame for which to retrieve arguments. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 is usually the current frame.

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
