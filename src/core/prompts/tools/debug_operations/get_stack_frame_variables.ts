export function getDebugGetStackFrameVariablesToolDescription(): string {
	return `## debug_get_stack_frame_variables – Get Variables from Scopes in a Frame

Description:
The "debug_get_stack_frame_variables" tool retrieves variables from specified scopes (e.g., Local, Arguments, Global) within a given stack frame. This allows for detailed inspection of the program's state.

────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_get_stack_frame_variables> tag.
2️⃣ Optionally, provide the <frameId> child tag. If omitted, the current top frame ID from the last debugger stop event will be used.
3️⃣ Optionally, provide one or more <scopeFilter> tags to specify which scopes to retrieve variables from. If no filter is provided, variables from all available scopes might be returned (debugger-dependent).
    Valid scopeFilter values: "Arguments", "Local", "Closure", "Global", "Registers".
4️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• If <frameId> is omitted, the current top frame will be used (if available). An error will occur if no frameId is provided and no global current frame ID is available.
• Using an invalid value for <scopeFilter>.

────────────  COPY-READY TEMPLATE  ────────────
  <debug_get_stack_frame_variables>
    <!-- Optional: <frameId>0</frameId> (Defaults to current top frame if omitted) -->
    <!-- Optional: <scopeFilter>Local</scopeFilter> -->
    <!-- Optional: <scopeFilter>Arguments</scopeFilter> -->
  </debug_get_stack_frame_variables>
───────────────────────────────────────────────

### Parameters:
All parameters are provided as child XML tags within the <debug_get_stack_frame_variables> tag.

-   <frameId> (number, optional): The ID of the stack frame from which to retrieve variables. If omitted, the current top frame ID from the last debugger stop event will be used. An error will occur if no frameId is provided and no global current frame ID is available. Frame ID 0 is usually the current frame.
-   <scopeFilter> (string, optional, multiple allowed): Filters the scopes from which to retrieve variables. If omitted, the debugger might return variables from all scopes or a default set.
    Possible values: "Arguments", "Local", "Closure", "Global", "Registers".
    You can include multiple <scopeFilter> tags.

### Result:
The result is typically a JSON string representing an object or array of scopes, each containing its variables as key-value pairs (name, value, type, etc.).

### Examples:

1.  **Get all variables from all scopes in the current frame (frame 0):**
    (Behavior without scopeFilter might be debugger-specific)
    \`\`\`xml
    <debug_get_stack_frame_variables>
      <frameId>0</frameId>
    </debug_get_stack_frame_variables>
    \`\`\`

2.  **Get only Local and Arguments variables from the current frame:**
    \`\`\`xml
    <debug_get_stack_frame_variables>
      <frameId>0</frameId>
      <scopeFilter>Local</scopeFilter>
      <scopeFilter>Arguments</scopeFilter>
    </debug_get_stack_frame_variables>
    \`\`\`
────────────────────────────────────────────────────────────────────────────
`
}
