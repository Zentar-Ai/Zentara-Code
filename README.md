# Roo Code

**Roo Code** is an advanced AI-powered coding agent, forked from [PLCHLD]-Code, that writes, refactors and debugs code like a professional software engineer—directly inside VS Code.

[More Info](https://zentar.ai)

<details>
  <summary>📑 Table of Contents</summary>

- [Overview](#overview)
- [Core Capabilities](#core-capabilities)
- [Detailed Debugging Operations](#detailed-debugging-operations)
- [Getting Started](#Getting-Started)
- [Quick Example](#quick-example)
- [Roadmap & Changelog](#roadmap--changelog)
- [Contributing](#contributing)
- [License](#license)
    </details>

---

[![Watch the Roo Code Demo Video](assets/images/demo.png)](https://www.youtube.com/watch?v=tzaHKvC98jE)

## Overview

Roo Code goes beyond simple code generation. It's an intelligent agent that can:

- **Write code:** Generate code based on your requirements.
- **Debug autonomously:** Utilize a full suite of runtime debugging tools to diagnose and fix issues in the code it writes, or in existing codebases.
- **Integrate with VS Code:** Seamlessly works within your VS Code environment, using its familiar debugging interfaces.

Roo Code's powerful debugging operations are primarily utilized when it operates in **Code Mode** (for writing and then debugging code) and **Debug Mode** (for focused debugging tasks). For general information about Roo Code's broader capabilities as a coding agent (forked from Roo-Code), please refer to the Roo-Code documentation at https://github.com/RooCodeInc/Roo-Code.

This empowers developers by automating complex coding and debugging tasks, allowing for faster development cycles and more robust software.

## Core Capabilities

- **AI-Powered Code Generation & Modification:**
    - Understands natural language prompts to create and modify code.
- **Integrated Runtime Debugging:**
    - **Full Debug Session Control:** Programmatically launches, and quits debugging sessions.
    - **Precise Execution Control:** Steps through code (over, into, out), sets execution pointers, and runs to specific lines.
    - **Advanced Breakpoint Management:** Sets, removes, and configures conditional, temporary, and standard breakpoints.
    - **In-Depth State Inspection:** Examines call stacks, inspects variables (locals, arguments, globals), and views source code in context.
    - **Dynamic Code Evaluation:** Evaluates expressions and executes statements during a debug session to understand and alter program state.
- **Intelligent Exception Handling:**
    - When a program or test run in a debugging session encounters an error or exception, Roo Code can analyze the exception information from the debugger.
    - It then intelligently decides on the next steps, such as performing a stack trace, reading stack frame variables, or navigating up the call stack to investigate the root cause.
- **Enhanced Pytest Debugging:**
    - Roo Code overrides the default pytest behavior of silencing assertion errors during test runs.
    - It catches these errors immediately, allowing for real-time, interactive debugging of pytest failures. Instead of waiting for a summary at the end, exceptions bubble up, enabling Roo Code to react contextually (e.g., by inspecting state at the point of failure).
- **Language-Agnostic Debugging:**
    - Leverages the Debug Adapter Protocol (DAP) to debug any programming language that has a DAP-compliant debugger available in VS Code. This means Roo Code is not limited to specific languages but can adapt to your project's needs.
- **VS Code Native Experience:** Integrates seamlessly with VS Code's debugging infrastructure, providing a familiar and powerful experience.

## Detailed Debugging Operations

Roo Code provides a rich set of granular debugging operations, allowing for precise control over the debugging process:

### Session Management

- `debug_launch`: Starts a new debugging session for a specified program or test.
- `debug_quit`: Terminates the currently running program and exits the debugger.

### Execution Control

- `debug_continue`: Resumes program execution until the next breakpoint or program end.
- `debug_next`: Executes the current line and stops at the next line in the current function (steps over calls).
- `debug_step_in`: Steps into a function call on the current line, or to the next line if no function call.
- `debug_step_out`: Continues execution until the current function returns, then stops.
- `debug_jump`: Changes the next line of code that will be executed within the current stack frame.
- `debug_until`: Continues program execution until it reaches a specified line number in the current source file.

### Breakpoint Management

- `debug_set_breakpoint`: Adds a breakpoint at a specified location.
- `debug_set_temp_breakpoint`: Adds a temporary breakpoint that is removed after being hit once.
- `debug_remove_breakpoint`: Removes an existing breakpoint.
- `debug_remove_all_breakpoints_in_file`: Removes all breakpoints currently set in a specified source file.
- `debug_disable_breakpoint`: Disables an existing breakpoint without removing it.
- `debug_enable_breakpoint`: Re-enables a previously disabled breakpoint.
- `debug_ignore_breakpoint`: Sets or clears an ignore count for a breakpoint (skip N hits).
- `debug_set_breakpoint_condition`: Sets or clears the condition for an existing breakpoint.
- `debug_get_active_breakpoints`: Retrieves a list of all currently set breakpoints.

### Stack & Source Inspection

- `debug_stack_trace`: Displays the current call stack of the paused program.
- `debug_list_source`: Displays lines of source code around the current execution point in a frame.
- `debug_up`: Moves the debugger's current focus one level up in the call stack.
- `debug_down`: Moves the debugger's current focus one level down in the call stack.
- `debug_goto_frame`: Changes the debugger's current focus to a specific stack frame by ID.
- `debug_get_source`: Retrieves the source code definition for an object, function, or class.

### State Inspection & Evaluation

- `debug_get_stack_frame_variables`: Retrieves variables from specified scopes (Local, Arguments, etc.) within a frame.
- `debug_get_args`: Retrieves the arguments passed to the function/method of a specified stack frame.
- `debug_evaluate`: Evaluates an arbitrary expression within the context of a specified stack frame.
- `debug_pretty_print`: Evaluates an expression and returns a formatted, human-readable string of its value.
- `debug_whatis`: Evaluates an expression and returns the type of the resulting value.
- `debug_execute_statement`: Executes a given statement (potentially with side effects) in a frame.

### Status Information

- `debug_get_last_stop_info`: Retrieves the full body of the last "stopped" event from the debugger.

## Getting Started

Roo Code is a VS Code extension. Here's how you can get started:

**1. Install from VS Code Marketplace (Recommended for Users)**

- Open VS Code.
- Go to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X).
- Search for "Roo Code".
- Click "Install".
- Once installed, Roo Code will be available to assist you.

For more detailed installation instruction, please visit https://zentar.ai, click on the "Install for free" button.

**2. Build and Install from Source (For Developers/Contributors)**

If you want to contribute or run the latest development version:

- **Clone the repository:**

    ```sh
    git clone https://github.com/Zentar-Ai/Roo-Code.git
    cd roo-code
    ```

- **Install dependencies:**
  This project uses pnpm. Ensure you have Node.js npm , pnpm installed.
    ```sh
    pnpm install
    ```
- **Build the extension:**

    ```sh
    pnpm vsix
    ```

    This will typically compile the TypeScript code and package the extension into a `.vsix` file in a `bin/` directory.

- **Install the .vsix file in VS Code:**
    1.  Go to the Extensions view in VS Code.
    2.  Click the "..." (More Actions) menu in the top-right corner of the Extensions view.
    3.  Select "Install from VSIX..."
    4.  Navigate to and select the generated `.vsix` file.

## Quick Example

**_Important_**: This extension has been validated with Google Gemini 2.5 Pro (build 0506). Other models are not fully supported because they cannot invoke the function tool reliably.

Here are a few examples of how you can use Roo Code to debug different types of projects.
The example scripts (`quicksort_buggy.py`, `test_quicksort_pytest.py`, `merge_sort_buggy.js`, `insertion_sort_buggy.ts`, etc.) mentioned in these tutorials can be found in the `testdata/` directory of this repository.
These tutorials are condensed versions; for more detailed step-by-step guides, please refer to the corresponding markdown files in the `testdata/` directory (e.g., `debugging_demo.md`, `debugging_demo_pytest.md`).

### 1. Debugging a Python Script

This tutorial demonstrates debugging a standard Python script. We'll use an example of a buggy quicksort algorithm.

**Scenario:** You have a Python script, `quicksort_buggy.py`, that isn't sorting correctly.

**a. Prepare Your Workspace:**

- Ensure `testdata/quicksort_buggy.py` (or your target script) is in your workspace.
- (Optional) Create a copy to debug, e.g., `testdata/quicksort_buggy.debug.py`.

**b. Initiate Debugging with Roo Code:**
Instruct Roo Code (e.g., in Code Mode or Debug Mode):
"Roo, start debugging `testdata/quicksort_buggy.debug.py`"
_(Roo Code would use `debug_launch` with `program: "testdata/quicksort_buggy.debug.py"`)_

**c. Observe Initial Behavior (Optional):**
"Roo, continue execution and let me know what happens."
_(Roo Code uses `debug_continue`)_
The script might run to completion, show errors, or fail assertions.

**d. Set Breakpoints & Investigate:**
Assume an error occurs related to sorting an empty list.
"Roo, restart the debug session for `testdata/quicksort_buggy.debug.py`.
Set a breakpoint at the beginning of the `quick_sort` function in `testdata/quicksort_buggy.debug.py`.
Also, set a breakpoint where `quick_sort` is called for an empty list scenario (likely within the script's own test harness).
Continue execution until the breakpoint for the empty list call is hit."
_(Roo Code uses `debug_restart`, `debug_set_breakpoint`, then `debug_continue`)_

**e. Step Through and Inspect:**
Once paused:
"Roo, I'm at the breakpoint.

1. What are the arguments being passed to `quick_sort`?
2. Now, step into the `quick_sort` function."
   _(Roo Code uses `debug_evaluate` or `debug_get_args`, then `debug_step_in`)_

Inside `quick_sort`:
"Roo, step through the function line by line. Show me the values of `low`, `high`, and `arr` at each step."
_(Roo Code uses `debug_next` repeatedly, with `debug_evaluate` or `debug_get_stack_frame_variables`)_

**f. Diagnose the Bug:**
Based on the debugger's output, you might identify the cause.
"Roo, it seems the base case for empty lists in `quick_sort` is not handled correctly."

### 2. Debugging Python with Pytest

This tutorial shows how to debug Python code using `pytest`.

**Scenario:** You have `quicksort_buggy.py` and a `test_quicksort_pytest.py` file containing tests for it.

**a. Prepare Your Workspace:**

- Ensure both `testdata/quicksort_buggy.py` and `testdata/test_quicksort_pytest.py` are present.
- It's good practice to have tests import from a copy, e.g., `testdata/quicksort_buggy.debug.py`. Create this copy.

**b. Initiate Pytest Debugging:**
"Roo, debug the tests in `testdata/test_quicksort_pytest.py` using pytest."
_(Roo Code uses `debug_launch` with `program: "testdata/test_quicksort_pytest.py"`, `mode: "pytest"')_

**c. Observe Initial Test Failures:**
"Roo, continue execution and report the pytest results."
_(Roo Code uses `debug_continue`)_
Pytest will report failing tests.

**d. Set Breakpoints & Investigate a Failing Test:**
Assume `test_empty_list` in `testdata/test_quicksort_pytest.py` fails.
"Roo, restart the pytest debug session for `testdata/test_quicksort_pytest.py`, stopping at entry.
Set a breakpoint in `testdata/test_quicksort_pytest.py` where the `quick_sort` logic is called for `test_empty_list`.
Also, set a breakpoint at the start of the `quick_sort` function in `testdata/quicksort_buggy.debug.py`.
Continue execution."
_(Roo Code uses `debug_restart`, `debug_set_breakpoint` (for test and source file), then `debug_continue`)_

**e. Step Through Test and Source Code:**
When paused in the test file:
"Roo, step into the call that leads to `quick_sort`."
_(Roo Code uses `debug_step_in`)_

Once inside `quick_sort` in `testdata/quicksort_buggy.debug.py`:
"Roo, step through `quick_sort` line by line, showing key variables, to see why `test_empty_list` is failing."
_(Roo Code uses `debug_next` and variable inspection tools)_

**f. Diagnose the Bug:**
By observing the runtime behavior of `testdata/quicksort_buggy.debug.py` as called by the test, you can identify the bug.

### 3. Debugging a JavaScript Script

This tutorial covers debugging a typical JavaScript (e.g., Node.js) script. We'll use a buggy Merge Sort example.

**Scenario:** You have `merge_sort_buggy.js` that produces incorrect output.

**a. Prepare Your Workspace:**

- Ensure `testdata/merge_sort_buggy.js` is available.
- (Optional) Create a copy, e.g., `testdata/merge_sort_buggy.debug.js`.

**b. Initiate JavaScript Debugging:**
"Roo, start debugging `testdata/merge_sort_buggy.debug.js`"
_(Roo Code uses `debug_launch` with `program: "testdata/merge_sort_buggy.debug.js"` and `stopOnEntry: true`)_

**c. Observe Initial Output:**
"Roo, continue and show me the output."
_(Roo Code uses `debug_continue`)_

**d. Set Breakpoints & Investigate:**
Suppose an array `[5, 2, 8, 1, 9, 4]` is sorted incorrectly.
"Roo, restart debugging for `testdata/merge_sort_buggy.debug.js`.
Set a breakpoint at the start of the `mergeSort` function in `testdata/merge_sort_buggy.debug.js`.
Set another breakpoint where `mergeSort` is called with `[5, 2, 8, 1, 9, 4]` (within the script's test calls).
Continue."
_(Roo Code uses `debug_restart`, `debug_set_breakpoint`, `debug_continue`)_

**e. Step Through and Inspect (Focus on `merge`):**
When paused:
"Roo, step into `mergeSort`. Then, when execution reaches the `merge` function, step through that line by line. Show me `left`, `right`, `result`, `leftIndex`, and `rightIndex`."
_(Roo Code uses `debug_step_in`, `debug_next` within `merge`, and variable inspection)_

**f. Diagnose the Bug:**
This detailed inspection, especially of the `merge` function's logic, will help identify the bug.

### 4. Debugging a TypeScript Script

This tutorial shows debugging a TypeScript script, which involves a compilation step.

**Scenario:** You have `insertion_sort_buggy.ts` with a faulty sorting algorithm.

**a. Compile TypeScript to JavaScript:**
"Roo, compile `testdata/insertion_sort_buggy.ts` using `tsc`."
_(Roo Code would use `execute_command` with `command: "tsc testdata/insertion_sort_buggy.ts"`)_
This creates `testdata/insertion_sort_buggy.js`.

**b. Initiate Debugging on Compiled JS:**
"Roo, debug the compiled `testdata/insertion_sort_buggy.js`"
_(Roo Code uses `debug_launch` with `program: "testdata/insertion_sort_buggy.js"`)_

**c. Observe Initial Assertion Failures:**
"Roo, continue execution and report any assertion failures."
_(Roo Code uses `debug_continue`)_

**d. Set Breakpoints & Investigate:**
If an assertion for a test array fails:
"Roo, restart debugging for `testdata/insertion_sort_buggy.js`.
Set a breakpoint at the start of the `insertionSort` function (in `testdata/insertion_sort_buggy.js`).
Set another where `insertionSort` is called for the failing test case (within the script's test calls).
Continue."
_(Roo Code uses `debug_restart`, `debug_set_breakpoint`, `debug_continue`)_

**e. Step Through and Inspect:**
When paused:
"Roo, step into `insertionSort`. Step line by line, showing `i`, `j`, `current`, and `arr`."
_(Roo Code uses `debug_step_in`, `debug_next`, and variable inspection tools on the JavaScript code)_

**f. Diagnose the Bug:**
By stepping through the compiled JavaScript and observing its runtime behavior, you can diagnose the issue in the original TypeScript logic.

## Example Autonomous Debugging Prompts for Roo Code

The Quick Tutorials above show a step-by-step, interactive debugging process. However, you can also instruct Roo Code to debug more autonomously. Here are some example high-level prompts based on the scenarios in the `testdata/` directory:

**1. For General Python Script (`testdata/quicksort_buggy.py`):**

"Roo, the script `testdata/quicksort_buggy.py` is not working correctly. Please debug it using your runtime analysis tools. Identify any bugs, explain them, and then try to fix the script. After applying fixes, verify if the corrected script passes its internal assertions."

**2. For Python with Pytest (`testdata/test_quicksort_pytest.py` and `testdata/quicksort_buggy.py`):**

"Roo, the pytest tests in `testdata/test_quicksort_pytest.py` are failing when testing `testdata/quicksort_buggy.py`. Please use your pytest debugging mode to investigate these failures. Pinpoint the bugs in `testdata/quicksort_buggy.py` based on the test results and runtime analysis. Explain the bugs, then attempt to fix `testdata/quicksort_buggy.py` and confirm if the tests pass."
_(Remember to have Roo Code create a copy like `quicksort_buggy.debug.py` to modify, or instruct it to do so.)_

**3. For JavaScript Script (`testdata/merge_sort_buggy.js`):**

"Roo, `testdata/merge_sort_buggy.js` has a bug in its merge sort implementation. Please debug this script. Use your runtime debugging tools to find the issue, explain it clearly, and then try to correct the `merge_sort_buggy.js` file. Verify your fix."

**4. For TypeScript Script (`testdata/insertion_sort_buggy.ts`):**

"Roo, the TypeScript script `testdata/insertion_sort_buggy.ts` needs debugging. First, compile it to JavaScript. Then, debug the compiled JavaScript output to find any bugs in the insertion sort logic. Explain the problems you discover, suggest fixes for the original `.ts` file, and if possible, apply and test them."

These prompts give Roo Code more leeway to decide on the specific debugging steps (breakpoints, stepping, inspection) needed to solve the problem.

### Python Debugging Setup (Important)

For Roo Code to effectively debug Python projects, especially those using Conda environments or specific `pytest` installations, ensure the correct Python interpreter is configured in your VS Code settings (`.vscode/settings.json`):

```json
{
	"python.defaultInterpreterPath": "/path/to/your/conda/env/bin/python"
}
```

Replace `/path/to/your/conda/env/bin/python` with the actual path to your Python interpreter.

## Roadmap & Changelog

We're constantly evolving Roo Code. Check out our [issue tracker](https://github.com/Zentar-Ai/Roo-code/issues?q=is%3Aopen+is%3Aissue+label%3Aroadmap) for our public roadmap and planned features. If you're looking to contribute, `good first issue` labels are a great place to start!

## Contributing

Roo Code thrives on community involvement! We welcome contributions of all kinds.

- **[Issue Tracker](https://github.com/Zentar-Ai/roo-code/issues)**
- **[Code of Conduct](CODE_OF_CONDUCT.md)**

## License

Roo Code is licensed under the [Apache License 2.0](./LICENSE).

---

© 2025 ZentarAI

This project is a fork of [RooCodeInc/Roo-Code)](https://github.com/RooCodeInc/Roo-Code). We gratefully acknowledge all contributions made to the original project.
