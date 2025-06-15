import { ToolArgs } from "../types"

export function getDebugSetBreakpointToolDescription(args: ToolArgs): string {
	return `## debug_set_breakpoint – Add a Breakpoint

Description:
The "debug_set_breakpoint" tool adds a breakpoint at a specified location in a source file. Execution will pause when this line is reached. You can optionally specify a column for inline breakpoints, a condition, hit condition, or log message for the breakpoint.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_set_breakpoint> tag.
2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the <debug_set_breakpoint> tag.
3️⃣ The JSON object MUST contain a "line" key with the line number (integer).
4️⃣ Optionally, include "path" (string), "column" (integer), "condition" (string), "hitCondition" (string), or "logMessage" (string) in the JSON object for advanced breakpoint behavior. If "path" is omitted, the currently active file will be used.
5️⃣ Ensure the <debug_set_breakpoint> tag is correctly closed.

You MUST provide the "line" number in the JSON. If you forget to provide the "line" key or its value, the operation will fail and you cannot process further. Exception will be generated. So do not do that in any case.
⚠️ **Common Breakers**
• Malformed JSON string.
• Missing "line" key in the JSON object.
• If "path" is provided, ensuring its value is a complete and valid path (e.g., file path misspelling, non-existent file, missing extension).
• Incorrect line number value (e.g., not an integer, out of range).
• Invalid expression for "condition" or "hitCondition" values.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_set_breakpoint>{"line": LINE_NUMBER, "path": "PATH_TO_FILE", "column": COLUMN_NUMBER, "condition": "i > 10", "hitCondition": "% 5 == 0", "logMessage": "Value of x is {x}"}</debug_set_breakpoint>
  <!-- Note: "path", "column", "condition", "hitCondition", "logMessage" are optional. "line" is REQUIRED. -->
───────────────────────────────────────────────

### Parameters:
All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_set_breakpoint> tag.

-   "path" (string, optional): The path to the source file (relative to the current workspace directory ${args.cwd}). If omitted, the path of the currently active file will be used. If provided, it must be a complete and valid path.
-   "line" (number, REQUIRED): The line number in the file to set the breakpoint.
-   "column" (number, optional): The column number within the line for an inline breakpoint. Inline breakpoints are only hit when the execution reaches the specific column. This is particularly useful when debugging minified code which may contain multiple statements in a single line.
-   "condition" (string, optional): An expression that must evaluate to true for the breakpoint to hit. Example: \`"condition": "i > 5"\`.
-   "hitCondition" (string, optional): An expression that controls how many times the breakpoint is hit before it breaks. Examples: \`"hitCondition": "% 3 == 0"\` (break every 3rd hit), \`"hitCondition": "> 5"\` (break on 6th hit and onwards).
-   "logMessage" (string, optional): A message to log to the console when the breakpoint is hit. Expressions can be embedded in curly braces, e.g., \`"logMessage": "Value of x is {x}"\`. The program does not break execution if a log message is set (unless a condition also evaluates to true).

### Examples:

1.  **Set a simple breakpoint at line 15 of \`src/app.py\`:**
    \`\`\`xml
    <debug_set_breakpoint>{"path": "src/app.py", "line": 15}</debug_set_breakpoint>
    \`\`\`

2.  **Set a conditional breakpoint in the active file (omitting "path"):**
    \`\`\`xml
    <debug_set_breakpoint>{"line": 27, "condition": "user.id === '123'"}</debug_set_breakpoint>
    \`\`\`

3.  **Set a breakpoint with a log message (does not break execution) in \`src/data_processor.py\`:**
    \`\`\`xml
    <debug_set_breakpoint>{"path": "src/data_processor.py", "line": 102, "logMessage": "Processing item {item_id}, status: {status}"}</debug_set_breakpoint>
    \`\`\`

4.  **Set a breakpoint with a hit condition (break every 2nd time) in the active file:**
    \`\`\`xml
    <debug_set_breakpoint>{"line": 42, "hitCondition": "% 2 == 0"}</debug_set_breakpoint>
    \`\`\`

5.  **Set an inline breakpoint in minified JavaScript (\`dist/app.min.js\`):**
    \`\`\`xml
    <debug_set_breakpoint>{"path": "dist/app.min.js", "line": 1, "column": 58}</debug_set_breakpoint> <!-- Assuming a statement starts at column 58 on line 1 -->
    \`\`\`
────────────────────────────────────────────────────────────────────────────

### Bad Examples:
The following are **critical errors** that will cause the \`debug_set_breakpoint\` operation to **FAIL**. You MUST avoid these mistakes at all costs:

1.  **Missing the required "line" key in JSON:**
    \`\`\`xml
    <debug_set_breakpoint>{"path": "src/app.py"}</debug_set_breakpoint>
    \`\`\`
    *Correction: The "line" key with a line number is REQUIRED in the JSON. Add \`"line": LINE_NUMBER\`.*

2.  **Providing "line" key but with a non-integer or missing value:**
    \`\`\`xml
    <debug_set_breakpoint>{"path": "src/app.py", "line": "fifteen"}</debug_set_breakpoint>
    \`\`\`
    or
    \`\`\`xml
    <debug_set_breakpoint>{"path": "src/app.py", "line": null}</debug_set_breakpoint>
    \`\`\`
    *Correction: Provide a valid integer line number for the "line" key, e.g., \`"line": 15\`.*

3.  **Malformed JSON (e.g., missing comma):**
    \`\`\`xml
    <debug_set_breakpoint>{"path": "src/app.py" "line": 15}</debug_set_breakpoint>
    \`\`\`
    *Correction: Ensure the JSON is well-formed, e.g., \`<debug_set_breakpoint>{"path": "src/app.py", "line": 15}</debug_set_breakpoint>\`.*
────────────────────────────────────────────────────────────────────────────
`
}
