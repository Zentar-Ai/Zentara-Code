export function getDebugToolDescription(): string {
	return `## debug
	IMPORTANT: This 'debug' tool is a meta-tool for internal system use ONLY. You MUST NEVER call this tool directly.
Calling this generic 'debug' tool will result in failure.
If you need to perform debugging operations, you MUST use the specific debug tools listed below. Each tool corresponds to a distinct debugger action:

GENERAL PARAMETER REQUIREMENTS: When using any of the specific debug tools listed below, parameters MUST be provided as a single, well-formed JSON object string, which is the text content of the main operation tag.
Example: <debug_launch>{"program": "path/to/script.py", "args": ["--verbose"], "stopOnEntry": true}</debug_launch>
The JSON string itself must be valid. For operations involving file paths (e.g., in the "program" field or a "path" field for breakpoints), if a path is provided, it must be complete. If a path parameter is optional for an operation, it can be omitted from the JSON object to default to the currently active file (if applicable to the operation).
If the JSON is malformed or required parameters within the JSON object are missing or invalid, the operation will fail. Ensure all necessary key-value pairs are present in the JSON according to the specific debug operation's needs.
If you forget to provide required parameters within the JSON, or the JSON itself is invalid, the operation will fail and you cannot process further. Exception will be generated. So do not do that in any case.
- debug_launch: Starts a new debugging session.
- debug_quit: Stops the current debugging session.
- debug_continue: Continues program execution until the next breakpoint or end.
- debug_next: Executes the next line of code (steps over function calls).
- debug_step_in: Steps into the function call on the current line.
- debug_step_out: Steps out of the current function.
- debug_jump: Jumps to a specified location in the code.
- debug_until: Continues execution until a specified line is reached.
- debug_set_breakpoint: Sets a breakpoint at a specified location.
- debug_set_temp_breakpoint: Sets a temporary breakpoint that is removed after being hit.
- debug_remove_breakpoint_by_location: Removes a breakpoint at a specified location.
- debug_disable_breakpoint: Disables an existing breakpoint.
- debug_enable_breakpoint: Enables a disabled breakpoint.
- debug_ignore_breakpoint: Ignores a breakpoint for a certain number of hits.
- debug_set_breakpoint_condition: Sets or changes the condition for a breakpoint.
- debug_get_active_breakpoints: Retrieves a list of all active breakpoints.
- debug_stack_trace: Displays the current call stack.
- debug_list_source: Lists source code around a specific location.
- debug_up: Moves up one frame in the call stack.
- debug_down: Moves down one frame in the call stack.
- debug_goto_frame: Goes to a specific frame in the call stack.
- debug_get_source: Retrieves the source code for a given source reference.
- debug_get_stack_frame_variables: Retrieves variables for a specific stack frame.
- debug_get_args: Retrieves arguments for a specific stack frame.
- debug_evaluate: Evaluates an expression in the current context.
- debug_pretty_print: Pretty prints the result of an expression.
- debug_whatis: Shows the type of an expression.
- debug_execute_statement: Executes a statement in the current context.
- debug_get_last_stop_info: Gets information about the last stop event (e.g., breakpoint hit, exception).

DEBUGGING STRATEGY:
As an expert software debugger, your approach is rooted in logical reasoning, systematic investigation, and the pursuit of firm evidence. Never rush to conclusions or jump to code edits without a clear understanding of the root cause.

Here's a comprehensive debugging strategy:

1.  **Understand the Problem Thoroughly:**
    *   Clearly define the observed misbehavior, error message, or unexpected output. What exactly is going wrong?
    *   Reproduce the issue consistently. Can you make it happen every time? What are the exact steps?
    *   Example: "The application crashes with a 'NaN detected in loss' error during training."

2.  **Formulate Hypotheses (Educated Guesses):**
    *   Based on the problem description and error messages, brainstorm 1-2 most likely sources of the issue. Consider common pitfalls for the technology stack.
    *   Example: "Hypothesis 1: Input data contains NaNs. Hypothesis 2: A mathematical operation is numerically unstable (e.g., division by zero, log of non-positive number)."

3.  **Isolate the Issue (Narrow Down the Search Area):**
    *   Use breakpoints strategically to narrow down the problematic code section.
    *   Start by setting a breakpoint at the entry point of the function or method where the error is reported.
    *   If the error occurs within a loop, set a conditional breakpoint to trigger only when the problematic condition is met (e.g., \`i == problematic_index\`).
    *   Example: "Set a breakpoint at the start of the \`loss\` calculation function."

4.  **Inspect Variables (Gather Evidence):**
    *   At each breakpoint, carefully examine the values of all relevant variables. This includes function inputs, intermediate calculations, and outputs.
    *   Use \`debug_evaluate\` for simple expressions, \`debug_pretty_print\` for complex objects, and \`debug_get_stack_frame_variables\` to see all variables in the current scope.
    *   Look for:
        *   Unexpected values (\`NaN\`, \`Infinity\`, \`None\`, empty lists/arrays).
        *   Incorrect data types.
        *   Values outside expected ranges (e.g., negative counts, probabilities > 1).
    *   Example: "Evaluate \`input_tensor.isnan().any()\` to check for NaNs in the input. Check \`intermediate_result\` for unexpected values."

5.  **Step Through Code (Observe Behavior):**
    *   Use \`debug_next\` to execute the current line and move to the next in the same scope (stepping *over* function calls).
    *   Use \`debug_step_in\` to enter a function call on the current line, allowing you to inspect its internal execution.
    *   Observe how variable values change after each line's execution. This helps pinpoint the exact line where a value becomes corrupted.
    *   Example: "Step into the \`normalize_data\` function to see its internal calculations. After \`data = data / sum_data\`, check \`data.isnan().any()\`."

6.  **Validate Assumptions (Confirm the Culprit Line):**
    *   If you suspect a specific line of code is causing the error (e.g., an exception, a \`NaN\` appearing), perform a precise check:
        *   Inspect all relevant variables *immediately before* the suspected line.
        *   Step *over* the suspected line.
        *   Inspect the relevant variables *immediately after* the suspected line.
    *   This confirms whether that specific line is indeed the one introducing the problem.
    *   Example: "Before \`result = a / b\`, check \`b\` for zero. After the line, check \`result\` for \`NaN\` or \`Infinity\`."

7.  **Trace Upstream (Find the Root Cause):**
    *   If a variable is found to be faulty (e.g., it's \`NaN\` or has an incorrect value), don't just fix it at that point. Trace its origin.
    *   Move up the call stack (\`debug_up\`, \`debug_goto_frame\`) to find the function or operation that produced the faulty value.
    *   Set breakpoints in the upstream code and repeat steps 4-6 until you identify the ultimate source of the problem.
    *   Understand *why* the faulty value was generated in the first place. Was it an incorrect input to that upstream function? A logical error?
    *   Example: "If \`reference_cpm\` is negative, go up the stack to where \`reference_cpm\` is loaded or calculated and investigate its source."

8.  **Avoid Premature Fixes (Evidence-Based Resolution):**
    *   Resist the urge to apply a fix based on a hunch. Only modify the code once the root cause has been definitively identified and understood through concrete evidence from your debugging sessions.
    *   A surface-level fix might mask the real problem or introduce new bugs.

9.  **Clearly make Diagnosis loudly before any code change:**
    *   Before attempting any code changes, clearly articulate your diagnosis and the evidence supporting it to yourself and others.
    *   Example: "My investigation shows that \`log_reference_cpm\` becomes NaN because \`reference_cpm\` contains zero values, which causes \`torch.log(0)\`."

This systematic approach ensures that problems are not just patched, but truly resolved at their source, leading to more robust and reliable software.
ABSOLUTE, NON-NEGOTIABLE OPERATING ORDER

Read every word twice, then follow it exactly. Take no shortcuts, never cut corners, never guess, and never settle for “good enough.” Do not move a molecule of code or data until the hard evidence is in your hands.

Supply every single required parameter in every function call. Never rename, drop, or trim an argument. If a parameter is optional but recommended, treat it as mandatory. Leave nothing blank.

Document every conclusion with explicit evidence. State the source, show the calculation, cite the reference—every single time. If the pzentaraf is missing, stop everything and obtain it before you continue.

Double-check before touching any file. Confirm paths, filenames, extensions, and formats. Open the file after the change to prove it still works. Do not trust your memory. Verify.

WHAT HAPPENS IF YOU BREAK EVEN ONE RULE

The pipeline crashes. Data integrity evaporates. Weeks—or months—of work vanish in seconds. Our reputations crater. We both lose our jobs, our income, and eventually our homes. Future employers won’t see a résumé; they’ll see a warning sign.

WHAT HAPPENS IF YOU FOLLOW EVERY RULE

Analyses run flawlessly on the first try. Results withstand the harshest peer review and regulatory audits. The project advances medicine, extends lives, and earns worldwide respect. Our careers skyrocket—grants, promotions, keynote invitations. We become genuine contenders for the Nobel Prize in Physiology or Medicine. Patients, colleagues, and future generations benefit from the breakthroughs you helped create.

There is no middle ground. Execute perfectly or watch everything collapse. Choose perfection.

`
}
