export function getDebugGetStackFrameVariablesToolDescription(): string {
	return `## debug_get_stack_frame_variables – Get Variables from Scopes in a Frame

Description:
The "debug_get_stack_frame_variables" tool retrieves variables from specified scopes (e.g., Local, Arguments, Global) within a given stack frame. This allows for detailed inspection of the program's state.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_get_stack_frame_variables> tag.
2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the <debug_get_stack_frame_variables> tag.
3️⃣ Optionally, include "frameId" (integer) and "scopeFilter" (array of strings) in the JSON object. If "frameId" is omitted, the current top frame ID is used. If "scopeFilter" is omitted, variables from all available scopes might be returned.
    Valid "scopeFilter" values: "Arguments", "Local", "Closure", "Global", "Registers".
4️⃣ Ensure the <debug_get_stack_frame_variables> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string.
• If "frameId" is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• Using an invalid value in the "scopeFilter" array.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_get_stack_frame_variables>{"frameId": 0, "scopeFilter": ["Local", "Arguments"]}</debug_get_stack_frame_variables>
  <!-- Note: "frameId" and "scopeFilter" are optional. If no params, use {}. -->
───────────────────────────────────────────────

### Parameters:
All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_get_stack_frame_variables> tag.

-   "frameId" (number, optional): The ID of the stack frame from which to retrieve variables. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 is usually the current frame.
-   "scopeFilter" (array of strings, optional): Filters the scopes from which to retrieve variables. If omitted, the debugger might return variables from all scopes or a default set.
    Possible values: "Arguments", "Local", "Closure", "Global", "Registers".
    Example: \`"scopeFilter": ["Local", "Arguments"]\`

### Result:
The result is typically a JSON string representing an object or array of scopes, each containing its variables as key-value pairs (name, value, type, etc.).

### Examples:

1.  **Get all variables from all scopes in the current frame (frame 0, by omitting scopeFilter):**
    (Behavior without scopeFilter might be debugger-specific)
    \`\`\`xml
    <debug_get_stack_frame_variables>{"frameId": 0}</debug_get_stack_frame_variables>
    \`\`\`
    Or to use default frame and all scopes:
    \`\`\`xml
    <debug_get_stack_frame_variables>{}</debug_get_stack_frame_variables>
    \`\`\`


2.  **Get only Local and Arguments variables from the current frame (frameId 0):**
    \`\`\`xml
    <debug_get_stack_frame_variables>{"frameId": 0, "scopeFilter": ["Local", "Arguments"]}</debug_get_stack_frame_variables>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
