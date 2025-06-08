import { ToolArgs } from "../types"

export function getDebugSetBreakpointToolDescription(args: ToolArgs): string {
	return `## debug_set_breakpoint – Add a Breakpoint

Description:
The "debug_set_breakpoint" tool adds a breakpoint at a specified location in a source file. Execution will pause when this line is reached. You can optionally specify a column for inline breakpoints, a condition, hit condition, or log message for the breakpoint.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_set_breakpoint> tag.
2️⃣ Optionally, provide the <path> child tag with the file pa"th. If omitted, the currently active file will be used.
3️⃣ Provide the REQUIRED <line> child tag with the line number.
4️⃣ Optionally, include <column>, <condition>, <hitCondition>, or <logMessage> for advanced breakpoint behavior.
5️⃣ Ensure all tags are correctly closed.

You MUST provide the line number.  If you forget to provide the line number, the operation will fail and you cannot process further. Exception will be generated.  So do not do that in any case.
⚠️ **Common Breakers**
• Missing <line> tag.
• If <path> is provided, ensuring it's a complete and valid path (e.g., file path misspelling, non-existent file, missing extension).
• Incorrect line number (out of range).
• Invalid expression for <condition> or <hitCondition>.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_set_breakpoint>
    <!-- Optional: <path>PATH_TO_FILE</path> (Defaults to active file if omitted) -->
    <line>LINE_NUMBER</line>
    <!-- Optional: <column>COLUMN_NUMBER</column> -->
    <!-- Optional: <condition>i > 10</condition> -->
    <!-- Optional: <hitCondition>% 5 == 0</hitCondition> -->
    <!-- Optional: <logMessage>Value of x is {x}</logMessage> -->
  </debug_set_breakpoint>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_set_breakpoint> tag.

-   <path> (string, optional): The path to the source file (relative to the current workspace directory ${args.cwd}). If omitted, the path of the currently active file will be used. If provided, it must be a complete and valid path.
-   <line> (number, REQUIRED): The line number in the file to set the breakpoint.
-   <column> (number, optional): The column number within the line for an inline breakpoint. Inline breakpoints are only hit when the execution reaches the specific column. This is particularly useful when debugging minified code which may contain multiple statements in a single line.
-   <condition> (string, optional): An expression that must evaluate to true for the breakpoint to hit. Example: \`i > 5\`.
-   <hitCondition> (string, optional): An expression that controls how many times the breakpoint is hit before it breaks. Examples: \`% 3 == 0\` (break every 3rd hit), \`> 5\` (break on 6th hit and onwards).
-   <logMessage> (string, optional): A message to log to the console when the breakpoint is hit. Expressions can be embedded in curly braces, e.g., \`Value of x is {x}\`. The program does not break execution if a log message is set (unless a condition also evaluates to true).

### Examples:

1.  **Set a simple breakpoint at line 15 of \`src/app.py\`:**
    \`\`\`xml
    <debug_set_breakpoint>
      <path>src/app.py</path>
      <line>15</line>
    </debug_set_breakpoint>
    \`\`\`

2.  **Set a conditional breakpoint in the active file:**
    \`\`\`xml
    <debug_set_breakpoint>
      <line>27</line>
      <condition>user.id === '123'</condition>
    </debug_set_breakpoint>
    \`\`\`

3.  **Set a breakpoint with a log message (does not break execution) in \`src/data_processor.py\`:**
    \`\`\`xml
    <debug_set_breakpoint>
      <path>src/data_processor.py</path>
      <line>102</line>
      <logMessage>Processing item {item_id}, status: {status}</logMessage>
    </debug_set_breakpoint>
    \`\`\`

4.  **Set a breakpoint with a hit condition (break every 2nd time) in the active file:**
    \`\`\`xml
    <debug_set_breakpoint>
      <line>42</line>
      <hitCondition>% 2 == 0</hitCondition>
    </debug_set_breakpoint>
    \`\`\`

5.  **Set an inline breakpoint in minified JavaScript (\`dist/app.min.js\`):**
    \`\`\`xml
    <debug_set_breakpoint>
      <path>dist/app.min.js</path>
      <line>1</line>
      <column>58</column> <!-- Assuming a statement starts at column 58 on line 1 -->
    </debug_set_breakpoint>
    \`\`\`
────────────────────────────────────────────────────────────────────────────

### Bad Examples:
The following are **critical errors** that will cause the \`debug_set_breakpoint\` operation to **FAIL**. You MUST avoid these mistakes at all costs:

1.  **Missing the entire <line> tag:**
    \`\`\`xml
    <debug_set_breakpoint>
      <path>src/app.py</path>
      <!-- <line> tag is completely missing -->
    </debug_set_breakpoint>
    \`\`\`
    *Correction: The <line> tag with a line number is REQUIRED. Add <line>LINE_NUMBER</line>.*

2.  **Having the <line> tag but no line number:**
    \`\`\`xml
    <debug_set_breakpoint>
      <path>src/app.py</path>
      <line></line> <!-- Line number is missing -->
    </debug_set_breakpoint>
    \`\`\`
    *Correction: Provide a valid line number within the <line> tag, e.g., <line>15</line>.*
────────────────────────────────────────────────────────────────────────────
`
}
