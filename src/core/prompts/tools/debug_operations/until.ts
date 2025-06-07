export function getDebugUntilToolDescription(): string {
	return `## debug_until – Run Until a Specific Line

Description:
The "debug_until" tool continues program execution until it reaches a specified line number in the current source file. If the line is encountered, the debugger will stop there. This is useful for running the code up to a certain point without setting a permanent breakpoint.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_until> tag.
2️⃣ Provide the REQUIRED <line> child tag with the target line number in the current source file.
3️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Missing <line> tag.
• Specifying a line number that will not be reached in the current execution flow from the current position.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_until>
    <line>TARGET_LINE_NUMBER</line>
  </debug_until>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_until> tag.

-   <line> (number, REQUIRED): The line number in the current source file to run until.

### Examples:

1.  **Run the program until line 42 is reached in the current file:**
    \`\`\`xml
    <debug_until>
      <line>42</line>
    </debug_until>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
