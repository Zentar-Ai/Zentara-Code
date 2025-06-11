import type { ToolArgs } from "../types"

export function getDebugRestartToolDescription(args: ToolArgs): string {
	return `## debug_restart – Restart the Debugging Session

Description:
The "debug_restart" tool restarts the current debugging session. It attempts to reuse the configuration (program path, arguments, environment variables, etc.) from the most recently successfully launched session that was initiated by the "debug_launch" tool within the current VS Code instance. If no session was previously launched via "debug_launch", or if the necessary parameters cannot be retrieved, this operation will fail.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_restart> tag.
2️⃣ For operations that take no arguments, provide an empty JSON object \`{}\` as the text content, or leave the content empty.
   Example: \`<debug_restart>{}</debug_restart>\` or \`<debug_restart></debug_restart>\`.
3️⃣ Ensure the tag is correctly closed: </debug_restart>.

⚠️ **Common Breakers**
• Providing unexpected JSON content (it should be empty \`{}\` or no content).
• Forgetting to close the <debug_restart> tag.
• Attempting to use this if no session was previously started with "debug_launch" by the extension.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_restart>{}</debug_restart>
  <!-- Alternatively, with no content: <debug_restart></debug_restart> -->
───────────────────────────────────────────────

### Parameters:
This operation takes no parameters. The JSON content should be an empty object \`{}\` or the tag content can be empty.

### Examples:

1.  **Restart the current debugging session (using the last launch configuration):**
    \`\`\`xml
    <debug_restart>{}</debug_restart>
    \`\`\`
    Or:
    \`\`\`xml
    <debug_restart></debug_restart>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
