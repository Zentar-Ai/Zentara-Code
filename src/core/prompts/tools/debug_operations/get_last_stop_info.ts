export function getDebugGetLastStopInfoToolDescription(): string {
	return `## debug_get_last_stop_info – Retrieve Last DAP "stopped" Event Body

Description:
The "debug_get_last_stop_info" tool retrieves the full body of the last "stopped" event received from the Debug Adapter Protocol (DAP) server. This event contains detailed information about why the debugger paused (e.g., breakpoint hit, step, exception) and the state of the thread that stopped.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_get_last_stop_info> tag.
2️⃣ For operations that take no arguments, provide an empty JSON object \`{}\` as the text content, or leave the content empty.
   Example: \`<debug_get_last_stop_info>{}</debug_get_last_stop_info>\` or \`<debug_get_last_stop_info></debug_get_last_stop_info>\`.
3️⃣ Ensure the tag is correctly closed: </debug_get_last_stop_info>.

⚠️ **Common Breakers**
• Providing unexpected JSON content (it should be empty \`{}\` or no content).
• Forgetting to close the <debug_get_last_stop_info> tag.
• Calling this if the debugger is not currently stopped or has not stopped previously in the session.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_get_last_stop_info>{}</debug_get_last_stop_info>
  <!-- Alternatively, with no content: <debug_get_last_stop_info></debug_get_last_stop_info> -->
───────────────────────────────────────────────

### Parameters:
This operation takes no parameters. The JSON content should be an empty object \`{}\` or the tag content can be empty.

### Result:
The result is a JSON string representing the body of the last DAP "stopped" event. This typically includes:
- \`reason\`: The reason why the debugger stopped (e.g., "breakpoint", "step", "exception").
- \`threadId\`: The ID of the thread that stopped.
- \`description\`: (Optional) A textual description of the stop reason.
- \`text\`: (Optional) Additional text associated with the stop reason (e.g., exception details).
- Other debugger-specific fields.

### Examples:

1.  **Get the details of the last stop event:**
    \`\`\`xml
    <debug_get_last_stop_info>{}</debug_get_last_stop_info>
    \`\`\`
    Or:
    \`\`\`xml
    <debug_get_last_stop_info></debug_get_last_stop_info>
    \`\`\`
    *(The tool will return a JSON string with the event details.)*
────────────────────────────────────────────────────────────────────────────
`
}
