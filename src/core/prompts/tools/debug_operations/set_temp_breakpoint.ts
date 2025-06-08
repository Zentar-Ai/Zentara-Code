import { ToolArgs } from "../types"

export function getDebugSetTempBreakpointToolDescription(args: ToolArgs): string {
	return `## debug_set_temp_breakpoint – Add a One-Shot Temporary Breakpoint

Description:
The "debug_set_temp_breakpoint" tool adds a temporary breakpoint that is automatically removed after it is hit once. Otherwise, it behaves like "debug_set_breakpoint" and supports the same optional parameters like column, condition, hit condition, and log message.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_set_temp_breakpoint> tag.
2️⃣ Optionally, provide the <path> child tag with the file path. If omitted, the currently active file will be used.
3️⃣ Provide the REQUIRED <line> child tag with the line number.
4️⃣ Optionally, include <column>, <condition>, <hitCondition>, or <logMessage>.
5️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <line> tag.
• If <path> is provided, ensuring it's a complete and valid path.
• Incorrect file path or line number.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_set_temp_breakpoint>
    <!-- Optional: <path>PATH_TO_FILE</path> (Defaults to active file if omitted) -->
    <line>LINE_NUMBER</line>
    <!-- Optional: <column>COLUMN_NUMBER</column> -->
    <!-- Optional: <condition>i > 10</condition> -->
  </debug_set_temp_breakpoint>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_set_temp_breakpoint> tag.

-   <path> (string, optional): The path to the source file (relative to the current workspace directory ${args.cwd}). If omitted, the path of the currently active file will be used. If provided, it must be a complete and valid path.
-   <line> (number, REQUIRED): The line number in the file to set the temporary breakpoint.
-   <column> (number, optional): The column number within the line for an inline breakpoint. Useful for minified code.
-   <condition> (string, optional): An expression that must evaluate to true for the breakpoint to hit.
-   <hitCondition> (string, optional): An expression that controls how many times the breakpoint is hit before it breaks (though for a temp breakpoint, it's typically hit once).
-   <logMessage> (string, optional): A message to log when the breakpoint is hit.

### Examples:

1.  **Set a temporary breakpoint at line 33 of \`src/app.py\`:**
    \`\`\`xml
    <debug_set_temp_breakpoint>
      <path>src/app.py</path>
      <line>33</line>
    </debug_set_temp_breakpoint>
    \`\`\`

2.  **Set a conditional temporary breakpoint in the active file:**
    \`\`\`xml
    <debug_set_temp_breakpoint>
      <line>88</line>
      <condition>result.status === 'ERROR'</condition>
    </debug_set_temp_breakpoint>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
