export function getDebugUntilToolDescription(): string {
	return `## debug_until – Run Until a Specific Line

Description:
The "debug_until" tool continues program execution until it reaches a specified line number in the current source file. If the line is encountered, the debugger will stop there. This is useful for running the code up to a certain point without setting a permanent breakpoint.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_until> tag.
2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the <debug_until> tag.
3️⃣ The JSON object MUST contain a "line" key with the target line number (integer) in the current source file.
4️⃣ Optionally, include "frameId" (integer) in the JSON object. If "frameId" is omitted, the operation applies to the current top frame.
5️⃣ Ensure the <debug_until> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• Missing "line" key in the JSON object.
• Specifying a "line" number that will not be reached in the current execution flow from the current position.
• Invalid "frameId" if provided.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_until>{"line": TARGET_LINE_NUMBER, "frameId": 0}</debug_until>
  <!-- Note: "frameId" is optional. "line" is REQUIRED. -->
───────────────────────────────────────────────

### Parameters:
All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_until> tag.

-   "line" (number, REQUIRED): The line number in the current source file to run until.
-   "frameId" (number, optional): The ID of the stack frame in which the "until" operation should apply. If omitted, it defaults to the current top frame.

### Examples:

1.  **Run the program until line 42 is reached in the current file (current frame):**
    \`\`\`xml
    <debug_until>{"line": 42}</debug_until>
    \`\`\`

2.  **Run the program until line 42 is reached in frame 0:**
    \`\`\`xml
    <debug_until>{"line": 42, "frameId": 0}</debug_until>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
