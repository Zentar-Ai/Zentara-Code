[![Version](0.1.0)]
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-181-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
[![Marketplace](https://img.shields.io/visual-studio-marketplace/v/your-username.zentara-code)]

# Zentara Code

**Zentara Code** is an advanced AI-powered coding agent, forked from Roo Code, that writes, refactors and debugs code like a professional software engineer—directly inside VS Code. :contentReference[oaicite:1]{index=1}

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

\*\*

[![Watch the Zentara Code Demo Video](assets/images/demo.png)](https://www.youtube.com/watch?v=tzaHKvC98jE)

## Overview

Zentara Code goes beyond simple code generation. It's an intelligent agent that can:

- **Write code:** Generate code based on your requirements.
- **Debug autonomously:** Utilize a full suite of runtime debugging tools to diagnose and fix issues in the code it writes, or in existing codebases.
- **Integrate with VS Code:** Seamlessly works within your VS Code environment, using its familiar debugging interfaces.

Zentara Code's powerful debugging operations are primarily utilized when it operates in **Code Mode** (for writing and then debugging code) and **Debug Mode** (for focused debugging tasks). For general information about Zentara Code's broader capabilities as a coding agent (forked from Roo Code), please refer to the [Roo Code documentation](https://docs.roocode.com/).

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
    - When a program or test run in a debugging session encounters an error or exception, Zentara Code can analyze the exception information from the debugger.
    - It then intelligently decides on the next steps, such as performing a stack trace, reading stack frame variables, or navigating up the call stack to investigate the root cause.
- **Enhanced Pytest Debugging:**
    - Zentara Code overrides the default pytest behavior of silencing assertion errors during test runs.
    - It catches these errors immediately, allowing for real-time, interactive debugging of pytest failures. Instead of waiting for a summary at the end, exceptions bubble up, enabling Zentara Code to react contextually (e.g., by inspecting state at the point of failure).
- **Language-Agnostic Debugging:**
    - Leverages the Debug Adapter Protocol (DAP) to debug any programming language that has a DAP-compliant debugger available in VS Code. This means Zentara Code is not limited to specific languages but can adapt to your project's needs.
- **VS Code Native Experience:** Integrates seamlessly with VS Code's debugging infrastructure, providing a familiar and powerful experience.

_(More capabilities can be detailed here as the project evolves)_

## Detailed Debugging Operations

Zentara Code provides a rich set of granular debugging operations, allowing for precise control over the debugging process:

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

Zentara Code is a VS Code extension. Here's how you can get started:

**1. Install from VS Code Marketplace (Recommended for Users)**

- Open VS Code.
- Go to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X).
- Search for "Zentara Code".
- Click "Install".
- Once installed, Zentara Code will be available to assist you.

For more detailed installation instruction, please visit https://zentar.ai, click on the "Install for free" button.

**2. Build and Install from Source (For Developers/Contributors)**

If you want to contribute or run the latest development version:

- **Clone the repository:**

    ```sh
    git clone https://github.com/Zentar-Ai/Zentara-Code.git
    cd zentara-code
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

Here are a few examples of how you can use Zentara Code to debug different types of projects.
The example scripts (`quicksort_buggy.py`, `test_quicksort_pytest.py`, `merge_sort_buggy.js`, `insertion_sort_buggy.ts`, etc.) mentioned in these tutorials can be found in the `testdata/` directory of this repository.
These tutorials are condensed versions; for more detailed step-by-step guides, please refer to the corresponding markdown files in the `testdata/` directory (e.g., `debugging_demo.md`, `debugging_demo_pytest.md`).

### 1. Debugging a Python Script

This tutorial demonstrates debugging a standard Python script. We'll use an example of a buggy quicksort algorithm.

**Scenario:** You have a Python script, `quicksort_buggy.py`, that isn't sorting correctly.

**a. Prepare Your Workspace:**

- Ensure `testdata/quicksort_buggy.py` (or your target script) is in your workspace.
- (Optional) Create a copy to debug, e.g., `testdata/quicksort_buggy.debug.py`.

**b. Initiate Debugging with Zentara Code:**
Instruct Zentara Code (e.g., in Code Mode or Debug Mode):
"Zentara, start debugging `testdata/quicksort_buggy.debug.py`. Stop at the beginning of the script."
_(Zentara Code would use `debug_launch` with `program: "testdata/quicksort_buggy.debug.py"` and `stopOnEntry: true`)_

**c. Observe Initial Behavior (Optional):**
"Zentara, continue execution and let me know what happens."
_(Zentara Code uses `debug_continue`)_
The script might run to completion, show errors, or fail assertions.

**d. Set Breakpoints & Investigate:**
Assume an error occurs related to sorting an empty list.
"Zentara, restart the debug session for `testdata/quicksort_buggy.debug.py`, stopping at the entry.
Set a breakpoint at the beginning of the `quick_sort` function in `testdata/quicksort_buggy.debug.py`.
Also, set a breakpoint where `quick_sort` is called for an empty list scenario (likely within the script's own test harness).
Continue execution until the breakpoint for the empty list call is hit."
_(Zentara Code uses `debug_restart`, `debug_set_breakpoint`, then `debug_continue`)_

**e. Step Through and Inspect:**
Once paused:
"Zentara, I'm at the breakpoint.

1. What are the arguments being passed to `quick_sort`?
2. Now, step into the `quick_sort` function."
   _(Zentara Code uses `debug_evaluate` or `debug_get_args`, then `debug_step_in`)_

Inside `quick_sort`:
"Zentara, step through the function line by line. Show me the values of `low`, `high`, and `arr` at each step."
_(Zentara Code uses `debug_next` repeatedly, with `debug_evaluate` or `debug_get_stack_frame_variables`)_

**f. Diagnose the Bug:**
Based on the debugger's output, you might identify the cause.
"Zentara, it seems the base case for empty lists in `quick_sort` is not handled correctly."

### 2. Debugging Python with Pytest

This tutorial shows how to debug Python code using `pytest`.

**Scenario:** You have `quicksort_buggy.py` and a `test_quicksort_pytest.py` file containing tests for it.

**a. Prepare Your Workspace:**

- Ensure both `testdata/quicksort_buggy.py` and `testdata/test_quicksort_pytest.py` are present.
- It's good practice to have tests import from a copy, e.g., `testdata/quicksort_buggy.debug.py`. Create this copy.

**b. Initiate Pytest Debugging:**
"Zentara, debug the tests in `testdata/test_quicksort_pytest.py` using pytest. Stop on entry."
_(Zentara Code uses `debug_launch` with `program: "testdata/test_quicksort_pytest.py"`, `mode: "pytest"`, and `stopOnEntry: true`)_

**c. Observe Initial Test Failures:**
"Zentara, continue execution and report the pytest results."
_(Zentara Code uses `debug_continue`)_
Pytest will report failing tests.

**d. Set Breakpoints & Investigate a Failing Test:**
Assume `test_empty_list` in `testdata/test_quicksort_pytest.py` fails.
"Zentara, restart the pytest debug session for `testdata/test_quicksort_pytest.py`, stopping at entry.
Set a breakpoint in `testdata/test_quicksort_pytest.py` where the `quick_sort` logic is called for `test_empty_list`.
Also, set a breakpoint at the start of the `quick_sort` function in `testdata/quicksort_buggy.debug.py`.
Continue execution."
_(Zentara Code uses `debug_restart`, `debug_set_breakpoint` (for test and source file), then `debug_continue`)_

**e. Step Through Test and Source Code:**
When paused in the test file:
"Zentara, step into the call that leads to `quick_sort`."
_(Zentara Code uses `debug_step_in`)_

Once inside `quick_sort` in `testdata/quicksort_buggy.debug.py`:
"Zentara, step through `quick_sort` line by line, showing key variables, to see why `test_empty_list` is failing."
_(Zentara Code uses `debug_next` and variable inspection tools)_

**f. Diagnose the Bug:**
By observing the runtime behavior of `testdata/quicksort_buggy.debug.py` as called by the test, you can identify the bug.

### 3. Debugging a JavaScript Script

This tutorial covers debugging a typical JavaScript (e.g., Node.js) script. We'll use a buggy Merge Sort example.

**Scenario:** You have `merge_sort_buggy.js` that produces incorrect output.

**a. Prepare Your Workspace:**

- Ensure `testdata/merge_sort_buggy.js` is available.
- (Optional) Create a copy, e.g., `testdata/merge_sort_buggy.debug.js`.

**b. Initiate JavaScript Debugging:**
"Zentara, start debugging `testdata/merge_sort_buggy.debug.js`. Stop at the beginning."
_(Zentara Code uses `debug_launch` with `program: "testdata/merge_sort_buggy.debug.js"` and `stopOnEntry: true`)_

**c. Observe Initial Output:**
"Zentara, continue and show me the output."
_(Zentara Code uses `debug_continue`)_

**d. Set Breakpoints & Investigate:**
Suppose an array `[5, 2, 8, 1, 9, 4]` is sorted incorrectly.
"Zentara, restart debugging for `testdata/merge_sort_buggy.debug.js`, stop at entry.
Set a breakpoint at the start of the `mergeSort` function in `testdata/merge_sort_buggy.debug.js`.
Set another breakpoint where `mergeSort` is called with `[5, 2, 8, 1, 9, 4]` (within the script's test calls).
Continue."
_(Zentara Code uses `debug_restart`, `debug_set_breakpoint`, `debug_continue`)_

**e. Step Through and Inspect (Focus on `merge`):**
When paused:
"Zentara, step into `mergeSort`. Then, when execution reaches the `merge` function, step through that line by line. Show me `left`, `right`, `result`, `leftIndex`, and `rightIndex`."
_(Zentara Code uses `debug_step_in`, `debug_next` within `merge`, and variable inspection)_

**f. Diagnose the Bug:**
This detailed inspection, especially of the `merge` function's logic, will help identify the bug.

### 4. Debugging a TypeScript Script

This tutorial shows debugging a TypeScript script, which involves a compilation step.

**Scenario:** You have `insertion_sort_buggy.ts` with a faulty sorting algorithm.

**a. Compile TypeScript to JavaScript:**
"Zentara, compile `testdata/insertion_sort_buggy.ts` using `tsc`."
_(Zentara Code would use `execute_command` with `command: "tsc testdata/insertion_sort_buggy.ts"`)_
This creates `testdata/insertion_sort_buggy.js`.

**b. Initiate Debugging on Compiled JS:**
"Zentara, debug the compiled `testdata/insertion_sort_buggy.js`. Stop at the beginning."
_(Zentara Code uses `debug_launch` with `program: "testdata/insertion_sort_buggy.js"` and `stopOnEntry: true`)_

**c. Observe Initial Assertion Failures:**
"Zentara, continue execution and report any assertion failures."
_(Zentara Code uses `debug_continue`)_

**d. Set Breakpoints & Investigate:**
If an assertion for a test array fails:
"Zentara, restart debugging for `testdata/insertion_sort_buggy.js`, stop at entry.
Set a breakpoint at the start of the `insertionSort` function (in `testdata/insertion_sort_buggy.js`).
Set another where `insertionSort` is called for the failing test case (within the script's test calls).
Continue."
_(Zentara Code uses `debug_restart`, `debug_set_breakpoint`, `debug_continue`)_

**e. Step Through and Inspect:**
When paused:
"Zentara, step into `insertionSort`. Step line by line, showing `i`, `j`, `current`, and `arr`."
_(Zentara Code uses `debug_step_in`, `debug_next`, and variable inspection tools on the JavaScript code)_

**f. Diagnose the Bug:**
By stepping through the compiled JavaScript and observing its runtime behavior, you can diagnose the issue in the original TypeScript logic.

## Example Autonomous Debugging Prompts for Zentara Code

The Quick Tutorials above show a step-by-step, interactive debugging process. However, you can also instruct Zentara Code to debug more autonomously. Here are some example high-level prompts based on the scenarios in the `testdata/` directory:

**1. For General Python Script (`testdata/quicksort_buggy.py`):**

"Zentara, the script `testdata/quicksort_buggy.py` is not working correctly. Please debug it using your runtime analysis tools. Identify any bugs, explain them, and then try to fix the script. After applying fixes, verify if the corrected script passes its internal assertions."

**2. For Python with Pytest (`testdata/test_quicksort_pytest.py` and `testdata/quicksort_buggy.py`):**

"Zentara, the pytest tests in `testdata/test_quicksort_pytest.py` are failing when testing `testdata/quicksort_buggy.py`. Please use your pytest debugging mode to investigate these failures. Pinpoint the bugs in `testdata/quicksort_buggy.py` based on the test results and runtime analysis. Explain the bugs, then attempt to fix `testdata/quicksort_buggy.py` and confirm if the tests pass."
_(Remember to have Zentara Code create a copy like `quicksort_buggy.debug.py` to modify, or instruct it to do so.)_

**3. For JavaScript Script (`testdata/merge_sort_buggy.js`):**

"Zentara, `testdata/merge_sort_buggy.js` has a bug in its merge sort implementation. Please debug this script. Use your runtime debugging tools to find the issue, explain it clearly, and then try to correct the `merge_sort_buggy.js` file. Verify your fix."

**4. For TypeScript Script (`testdata/insertion_sort_buggy.ts`):**

"Zentara, the TypeScript script `testdata/insertion_sort_buggy.ts` needs debugging. First, compile it to JavaScript. Then, debug the compiled JavaScript output to find any bugs in the insertion sort logic. Explain the problems you discover, suggest fixes for the original `.ts` file, and if possible, apply and test them."

These prompts give Zentara Code more leeway to decide on the specific debugging steps (breakpoints, stepping, inspection) needed to solve the problem.

### Python Debugging Setup (Important)

For Zentara Code to effectively debug Python projects, especially those using Conda environments or specific `pytest` installations, ensure the correct Python interpreter is configured in your VS Code settings (`.vscode/settings.json`):

```json
{
	"python.defaultInterpreterPath": "/path/to/your/conda/env/bin/python"
}
```

Replace `/path/to/your/conda/env/bin/python` with the actual path to your Python interpreter.

## Roadmap & Changelog

We're constantly evolving Zentara Code. Check out our [issue tracker](https://github.com/your-username/zentara-code/issues?q=is%3Aopen+is%3Aissue+label%3Aroadmap) for our public roadmap and planned features. If you're looking to contribute, `good first issue` labels are a great place to start!

## Contributing

Zentara Code thrives on community involvement! We welcome contributions of all kinds.

- **[Issue Tracker](https://github.com/your-username/zentara-code/issues)** (Replace with your actual GitHub repo path)
- **[Contributing Guidelines](CONTRIBUTING.md)**
- **[Code of Conduct](CODE_OF_CONDUCT.md)**

## License

Zentara Code is licensed under the [Apache License 2.0](./LICENSE).

© 2025 ZentarAI

This project is a fork of [RooCodeInc/Roo-Code](https://github.com/RooCodeInc/Roo-Code). We gratefully acknowledge all contributions made to the original project.
## Contributors ✨

Thanks goes to these wonderful people :
[![Contributors](https://img.shields.io/github/contributors/Zentar-Ai/Zentara-Code.svg?style=flat-square)](https://github.com/Zentar-Ai/Zentara-Code/graphs/contributors)

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Zentar-Ai"><img src="https://avatars.githubusercontent.com/u/214788364?v=4?s=100" width="100px;" alt="bn_from_zentara"/><br /><sub><b>bn_from_zentara</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=Zentar-Ai" title="Code">💻</a> <a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=Zentar-Ai" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mrubens"><img src="https://avatars.githubusercontent.com/u/2600?v=4?s=100" width="100px;" alt="mrubens"/><br /><sub><b>mrubens</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=mrubens" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/saoudrizwan"><img src="https://avatars.githubusercontent.com/u/7799382?v=4?s=100" width="100px;" alt="saoudrizwan"/><br /><sub><b>saoudrizwan</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=saoudrizwan" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/cte"><img src="https://avatars.githubusercontent.com/u/16332?v=4?s=100" width="100px;" alt="cte"/><br /><sub><b>cte</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=cte" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/samhvw8"><img src="https://avatars.githubusercontent.com/u/12538214?v=4?s=100" width="100px;" alt="samhvw8"/><br /><sub><b>samhvw8</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=samhvw8" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/daniel-lxs"><img src="https://avatars.githubusercontent.com/u/57051444?v=4?s=100" width="100px;" alt="daniel-lxs"/><br /><sub><b>daniel-lxs</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=daniel-lxs" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/a8trejo"><img src="https://avatars.githubusercontent.com/u/62401433?v=4?s=100" width="100px;" alt="a8trejo"/><br /><sub><b>a8trejo</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=a8trejo" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/KJ7LNW"><img src="https://avatars.githubusercontent.com/u/93454819?v=4?s=100" width="100px;" alt="KJ7LNW"/><br /><sub><b>KJ7LNW</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=KJ7LNW" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ColemanRoo"><img src="https://avatars.githubusercontent.com/u/117104599?v=4?s=100" width="100px;" alt="ColemanRoo"/><br /><sub><b>ColemanRoo</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=ColemanRoo" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/canrobins13"><img src="https://avatars.githubusercontent.com/u/20544372?v=4?s=100" width="100px;" alt="canrobins13"/><br /><sub><b>canrobins13</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=canrobins13" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/hannesrudolph"><img src="https://avatars.githubusercontent.com/u/49103247?v=4?s=100" width="100px;" alt="hannesrudolph"/><br /><sub><b>hannesrudolph</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=hannesrudolph" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/stea9499"><img src="https://avatars.githubusercontent.com/u/4163795?v=4?s=100" width="100px;" alt="stea9499"/><br /><sub><b>stea9499</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=stea9499" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/joemanley201"><img src="https://avatars.githubusercontent.com/u/8299960?v=4?s=100" width="100px;" alt="joemanley201"/><br /><sub><b>joemanley201</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=joemanley201" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/System233"><img src="https://avatars.githubusercontent.com/u/20336040?v=4?s=100" width="100px;" alt="System233"/><br /><sub><b>System233</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=System233" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nissa-seru"><img src="https://avatars.githubusercontent.com/u/119150866?v=4?s=100" width="100px;" alt="nissa-seru"/><br /><sub><b>nissa-seru</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=nissa-seru" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jquanton"><img src="https://avatars.githubusercontent.com/u/88576563?v=4?s=100" width="100px;" alt="jquanton"/><br /><sub><b>jquanton</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=jquanton" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/NyxJae"><img src="https://avatars.githubusercontent.com/u/52313587?v=4?s=100" width="100px;" alt="NyxJae"/><br /><sub><b>NyxJae</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=NyxJae" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/MuriloFP"><img src="https://avatars.githubusercontent.com/u/50873657?v=4?s=100" width="100px;" alt="MuriloFP"/><br /><sub><b>MuriloFP</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=MuriloFP" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/d-oit"><img src="https://avatars.githubusercontent.com/u/6849456?v=4?s=100" width="100px;" alt="d-oit"/><br /><sub><b>d-oit</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=d-oit" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/punkpeye"><img src="https://avatars.githubusercontent.com/u/108313943?v=4?s=100" width="100px;" alt="punkpeye"/><br /><sub><b>punkpeye</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=punkpeye" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jr"><img src="https://avatars.githubusercontent.com/u/5629?v=4?s=100" width="100px;" alt="jr"/><br /><sub><b>jr</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=jr" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/wkordalski"><img src="https://avatars.githubusercontent.com/u/3035587?v=4?s=100" width="100px;" alt="wkordalski"/><br /><sub><b>wkordalski</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=wkordalski" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/elianiva"><img src="https://avatars.githubusercontent.com/u/51877647?v=4?s=100" width="100px;" alt="elianiva"/><br /><sub><b>elianiva</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=elianiva" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/monotykamary"><img src="https://avatars.githubusercontent.com/u/1130103?v=4?s=100" width="100px;" alt="monotykamary"/><br /><sub><b>monotykamary</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=monotykamary" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/cannuri"><img src="https://avatars.githubusercontent.com/u/91494156?v=4?s=100" width="100px;" alt="cannuri"/><br /><sub><b>cannuri</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=cannuri" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Smartsheet-JB-Brown"><img src="https://avatars.githubusercontent.com/u/171734120?v=4?s=100" width="100px;" alt="Smartsheet-JB-Brown"/><br /><sub><b>Smartsheet-JB-Brown</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=Smartsheet-JB-Brown" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/zhangtony239"><img src="https://avatars.githubusercontent.com/u/157202938?v=4?s=100" width="100px;" alt="zhangtony239"/><br /><sub><b>zhangtony239</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=zhangtony239" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sachasayan"><img src="https://avatars.githubusercontent.com/u/1666034?v=4?s=100" width="100px;" alt="sachasayan"/><br /><sub><b>sachasayan</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=sachasayan" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/xyOz-dev"><img src="https://avatars.githubusercontent.com/u/195602624?v=4?s=100" width="100px;" alt="xyOz-dev"/><br /><sub><b>xyOz-dev</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=xyOz-dev" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/feifei325"><img src="https://avatars.githubusercontent.com/u/46489071?v=4?s=100" width="100px;" alt="feifei325"/><br /><sub><b>feifei325</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=feifei325" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/qdaxb"><img src="https://avatars.githubusercontent.com/u/4157870?v=4?s=100" width="100px;" alt="qdaxb"/><br /><sub><b>qdaxb</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=qdaxb" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/vigneshsubbiah16"><img src="https://avatars.githubusercontent.com/u/51325334?v=4?s=100" width="100px;" alt="vigneshsubbiah16"/><br /><sub><b>vigneshsubbiah16</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=vigneshsubbiah16" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/shariqriazz"><img src="https://avatars.githubusercontent.com/u/196900129?v=4?s=100" width="100px;" alt="shariqriazz"/><br /><sub><b>shariqriazz</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=shariqriazz" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/lloydchang"><img src="https://avatars.githubusercontent.com/u/1329685?v=4?s=100" width="100px;" alt="lloydchang"/><br /><sub><b>lloydchang</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=lloydchang" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/pugazhendhi-m"><img src="https://avatars.githubusercontent.com/u/132246623?v=4?s=100" width="100px;" alt="pugazhendhi-m"/><br /><sub><b>pugazhendhi-m</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=pugazhendhi-m" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Szpadel"><img src="https://avatars.githubusercontent.com/u/1857251?v=4?s=100" width="100px;" alt="Szpadel"/><br /><sub><b>Szpadel</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=Szpadel" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dtrugman"><img src="https://avatars.githubusercontent.com/u/2451669?v=4?s=100" width="100px;" alt="dtrugman"/><br /><sub><b>dtrugman</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=dtrugman" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/diarmidmackenzie"><img src="https://avatars.githubusercontent.com/u/16045703?v=4?s=100" width="100px;" alt="diarmidmackenzie"/><br /><sub><b>diarmidmackenzie</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=diarmidmackenzie" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/psv2522"><img src="https://avatars.githubusercontent.com/u/87223770?v=4?s=100" width="100px;" alt="psv2522"/><br /><sub><b>psv2522</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=psv2522" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Premshay"><img src="https://avatars.githubusercontent.com/u/28099628?v=4?s=100" width="100px;" alt="Premshay"/><br /><sub><b>Premshay</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=Premshay" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/lupuletic"><img src="https://avatars.githubusercontent.com/u/105351510?v=4?s=100" width="100px;" alt="lupuletic"/><br /><sub><b>lupuletic</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=lupuletic" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/aheizi"><img src="https://avatars.githubusercontent.com/u/8243770?v=4?s=100" width="100px;" alt="aheizi"/><br /><sub><b>aheizi</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=aheizi" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/PeterDaveHello"><img src="https://avatars.githubusercontent.com/u/3691490?v=4?s=100" width="100px;" alt="PeterDaveHello"/><br /><sub><b>PeterDaveHello</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=PeterDaveHello" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/olweraltuve"><img src="https://avatars.githubusercontent.com/u/39308405?v=4?s=100" width="100px;" alt="olweraltuve"/><br /><sub><b>olweraltuve</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=olweraltuve" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ChuKhaLi"><img src="https://avatars.githubusercontent.com/u/15166543?v=4?s=100" width="100px;" alt="ChuKhaLi"/><br /><sub><b>ChuKhaLi</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=ChuKhaLi" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nbihan-mediware"><img src="https://avatars.githubusercontent.com/u/42357253?v=4?s=100" width="100px;" alt="nbihan-mediware"/><br /><sub><b>nbihan-mediware</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=nbihan-mediware" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/RaySinner"><img src="https://avatars.githubusercontent.com/u/118297374?v=4?s=100" width="100px;" alt="RaySinner"/><br /><sub><b>RaySinner</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=RaySinner" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kiwina"><img src="https://avatars.githubusercontent.com/u/1071364?v=4?s=100" width="100px;" alt="kiwina"/><br /><sub><b>kiwina</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=kiwina" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/afshawnlotfi"><img src="https://avatars.githubusercontent.com/u/6283745?v=4?s=100" width="100px;" alt="afshawnlotfi"/><br /><sub><b>afshawnlotfi</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=afshawnlotfi" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/pdecat"><img src="https://avatars.githubusercontent.com/u/318490?v=4?s=100" width="100px;" alt="pdecat"/><br /><sub><b>pdecat</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=pdecat" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/noritaka1166"><img src="https://avatars.githubusercontent.com/u/189505037?v=4?s=100" width="100px;" alt="noritaka1166"/><br /><sub><b>noritaka1166</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=noritaka1166" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kyle-apex"><img src="https://avatars.githubusercontent.com/u/20145331?v=4?s=100" width="100px;" alt="kyle-apex"/><br /><sub><b>kyle-apex</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=kyle-apex" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/emshvac"><img src="https://avatars.githubusercontent.com/u/121588911?v=4?s=100" width="100px;" alt="emshvac"/><br /><sub><b>emshvac</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=emshvac" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/chrarnoldus"><img src="https://avatars.githubusercontent.com/u/12196001?v=4?s=100" width="100px;" alt="chrarnoldus"/><br /><sub><b>chrarnoldus</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=chrarnoldus" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Lunchb0ne"><img src="https://avatars.githubusercontent.com/u/22198661?v=4?s=100" width="100px;" alt="Lunchb0ne"/><br /><sub><b>Lunchb0ne</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=Lunchb0ne" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/SmartManoj"><img src="https://avatars.githubusercontent.com/u/7231077?v=4?s=100" width="100px;" alt="SmartManoj"/><br /><sub><b>SmartManoj</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=SmartManoj" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/vagadiya"><img src="https://avatars.githubusercontent.com/u/32499123?v=4?s=100" width="100px;" alt="vagadiya"/><br /><sub><b>vagadiya</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=vagadiya" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/slytechnical"><img src="https://avatars.githubusercontent.com/u/139649758?v=4?s=100" width="100px;" alt="slytechnical"/><br /><sub><b>slytechnical</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=slytechnical" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/arthurauffray"><img src="https://avatars.githubusercontent.com/u/51604173?v=4?s=100" width="100px;" alt="arthurauffray"/><br /><sub><b>arthurauffray</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=arthurauffray" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/upamune"><img src="https://avatars.githubusercontent.com/u/8219560?v=4?s=100" width="100px;" alt="upamune"/><br /><sub><b>upamune</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=upamune" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/StevenTCramer"><img src="https://avatars.githubusercontent.com/u/357219?v=4?s=100" width="100px;" alt="StevenTCramer"/><br /><sub><b>StevenTCramer</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=StevenTCramer" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sammcj"><img src="https://avatars.githubusercontent.com/u/862951?v=4?s=100" width="100px;" alt="sammcj"/><br /><sub><b>sammcj</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=sammcj" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/p12tic"><img src="https://avatars.githubusercontent.com/u/1056711?v=4?s=100" width="100px;" alt="p12tic"/><br /><sub><b>p12tic</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=p12tic" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/gtaylor"><img src="https://avatars.githubusercontent.com/u/75556?v=4?s=100" width="100px;" alt="gtaylor"/><br /><sub><b>gtaylor</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=gtaylor" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/aitoroses"><img src="https://avatars.githubusercontent.com/u/1699368?v=4?s=100" width="100px;" alt="aitoroses"/><br /><sub><b>aitoroses</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=aitoroses" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mr-ryan-james"><img src="https://avatars.githubusercontent.com/u/9344431?v=4?s=100" width="100px;" alt="mr-ryan-james"/><br /><sub><b>mr-ryan-james</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=mr-ryan-james" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/heyseth"><img src="https://avatars.githubusercontent.com/u/8293842?v=4?s=100" width="100px;" alt="heyseth"/><br /><sub><b>heyseth</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=heyseth" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/taisukeoe"><img src="https://avatars.githubusercontent.com/u/1506707?v=4?s=100" width="100px;" alt="taisukeoe"/><br /><sub><b>taisukeoe</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=taisukeoe" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/taylorwilsdon"><img src="https://avatars.githubusercontent.com/u/6508528?v=4?s=100" width="100px;" alt="taylorwilsdon"/><br /><sub><b>taylorwilsdon</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=taylorwilsdon" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/NamesMT"><img src="https://avatars.githubusercontent.com/u/23612546?v=4?s=100" width="100px;" alt="NamesMT"/><br /><sub><b>NamesMT</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=NamesMT" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/avtc"><img src="https://avatars.githubusercontent.com/u/10050240?v=4?s=100" width="100px;" alt="avtc"/><br /><sub><b>avtc</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=avtc" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dlab-anton"><img src="https://avatars.githubusercontent.com/u/20571486?v=4?s=100" width="100px;" alt="dlab-anton"/><br /><sub><b>dlab-anton</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=dlab-anton" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/eonghk"><img src="https://avatars.githubusercontent.com/u/139964?v=4?s=100" width="100px;" alt="eonghk"/><br /><sub><b>eonghk</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=eonghk" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ronyblum"><img src="https://avatars.githubusercontent.com/u/20314054?v=4?s=100" width="100px;" alt="ronyblum"/><br /><sub><b>ronyblum</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=ronyblum" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/teddyOOXX"><img src="https://avatars.githubusercontent.com/u/121077180?v=4?s=100" width="100px;" alt="teddyOOXX"/><br /><sub><b>teddyOOXX</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=teddyOOXX" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/vincentsong"><img src="https://avatars.githubusercontent.com/u/2343574?v=4?s=100" width="100px;" alt="vincentsong"/><br /><sub><b>vincentsong</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=vincentsong" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/yongjer"><img src="https://avatars.githubusercontent.com/u/54315206?v=4?s=100" width="100px;" alt="yongjer"/><br /><sub><b>yongjer</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=yongjer" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/zeozeozeo"><img src="https://avatars.githubusercontent.com/u/108888572?v=4?s=100" width="100px;" alt="zeozeozeo"/><br /><sub><b>zeozeozeo</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=zeozeozeo" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ashktn"><img src="https://avatars.githubusercontent.com/u/6723913?v=4?s=100" width="100px;" alt="ashktn"/><br /><sub><b>ashktn</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=ashktn" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/franekp"><img src="https://avatars.githubusercontent.com/u/9804230?v=4?s=100" width="100px;" alt="franekp"/><br /><sub><b>franekp</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=franekp" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/yt3trees"><img src="https://avatars.githubusercontent.com/u/57471763?v=4?s=100" width="100px;" alt="yt3trees"/><br /><sub><b>yt3trees</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=yt3trees" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/anton-otee"><img src="https://avatars.githubusercontent.com/u/149477749?v=4?s=100" width="100px;" alt="anton-otee"/><br /><sub><b>anton-otee</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=anton-otee" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/benzntech"><img src="https://avatars.githubusercontent.com/u/4044180?v=4?s=100" width="100px;" alt="benzntech"/><br /><sub><b>benzntech</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=benzntech" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/axkirillov"><img src="https://avatars.githubusercontent.com/u/32141102?v=4?s=100" width="100px;" alt="axkirillov"/><br /><sub><b>axkirillov</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=axkirillov" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bramburn"><img src="https://avatars.githubusercontent.com/u/11090413?v=4?s=100" width="100px;" alt="bramburn"/><br /><sub><b>bramburn</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=bramburn" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/hassoncs"><img src="https://avatars.githubusercontent.com/u/5104925?v=4?s=100" width="100px;" alt="hassoncs"/><br /><sub><b>hassoncs</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=hassoncs" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/snoyiatk"><img src="https://avatars.githubusercontent.com/u/3056569?v=4?s=100" width="100px;" alt="snoyiatk"/><br /><sub><b>snoyiatk</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=snoyiatk" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/GitlyHallows"><img src="https://avatars.githubusercontent.com/u/136527758?v=4?s=100" width="100px;" alt="GitlyHallows"/><br /><sub><b>GitlyHallows</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=GitlyHallows" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jcbdev"><img src="https://avatars.githubusercontent.com/u/17152092?v=4?s=100" width="100px;" alt="jcbdev"/><br /><sub><b>jcbdev</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=jcbdev" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Chenjiayuan195"><img src="https://avatars.githubusercontent.com/u/30591313?v=4?s=100" width="100px;" alt="Chenjiayuan195"/><br /><sub><b>Chenjiayuan195</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=Chenjiayuan195" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/julionav"><img src="https://avatars.githubusercontent.com/u/45607850?v=4?s=100" width="100px;" alt="julionav"/><br /><sub><b>julionav</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=julionav" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/SplittyDev"><img src="https://avatars.githubusercontent.com/u/4216049?v=4?s=100" width="100px;" alt="SplittyDev"/><br /><sub><b>SplittyDev</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=SplittyDev" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mdp"><img src="https://avatars.githubusercontent.com/u/2868?v=4?s=100" width="100px;" alt="mdp"/><br /><sub><b>mdp</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=mdp" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/napter"><img src="https://avatars.githubusercontent.com/u/6260841?v=4?s=100" width="100px;" alt="napter"/><br /><sub><b>napter</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=napter" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Ruakij"><img src="https://avatars.githubusercontent.com/u/54639830?v=4?s=100" width="100px;" alt="Ruakij"/><br /><sub><b>Ruakij</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=Ruakij" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ross"><img src="https://avatars.githubusercontent.com/u/12789?v=4?s=100" width="100px;" alt="ross"/><br /><sub><b>ross</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=ross" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/philfung"><img src="https://avatars.githubusercontent.com/u/1054593?v=4?s=100" width="100px;" alt="philfung"/><br /><sub><b>philfung</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=philfung" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/GOODBOY008"><img src="https://avatars.githubusercontent.com/u/13617900?v=4?s=100" width="100px;" alt="GOODBOY008"/><br /><sub><b>GOODBOY008</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=GOODBOY008" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/hatsu38"><img src="https://avatars.githubusercontent.com/u/16137809?v=4?s=100" width="100px;" alt="hatsu38"/><br /><sub><b>hatsu38</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=hatsu38" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/hongzio"><img src="https://avatars.githubusercontent.com/u/11085613?v=4?s=100" width="100px;" alt="hongzio"/><br /><sub><b>hongzio</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=hongzio" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/im47cn"><img src="https://avatars.githubusercontent.com/u/67424112?v=4?s=100" width="100px;" alt="im47cn"/><br /><sub><b>im47cn</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=im47cn" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/shoopapa"><img src="https://avatars.githubusercontent.com/u/45986634?v=4?s=100" width="100px;" alt="shoopapa"/><br /><sub><b>shoopapa</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=shoopapa" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jwcraig"><img src="https://avatars.githubusercontent.com/u/241358?v=4?s=100" width="100px;" alt="jwcraig"/><br /><sub><b>jwcraig</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=jwcraig" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kcwhite"><img src="https://avatars.githubusercontent.com/u/3812801?v=4?s=100" width="100px;" alt="kcwhite"/><br /><sub><b>kcwhite</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=kcwhite" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kinandan"><img src="https://avatars.githubusercontent.com/u/186135699?v=4?s=100" width="100px;" alt="kinandan"/><br /><sub><b>kinandan</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=kinandan" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kohii"><img src="https://avatars.githubusercontent.com/u/6891780?v=4?s=100" width="100px;" alt="kohii"/><br /><sub><b>kohii</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=kohii" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nevermorec"><img src="https://avatars.githubusercontent.com/u/22953064?v=4?s=100" width="100px;" alt="nevermorec"/><br /><sub><b>nevermorec</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=nevermorec" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dqroid"><img src="https://avatars.githubusercontent.com/u/192424994?v=4?s=100" width="100px;" alt="dqroid"/><br /><sub><b>dqroid</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=dqroid" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dairui1"><img src="https://avatars.githubusercontent.com/u/183250644?v=4?s=100" width="100px;" alt="dairui1"/><br /><sub><b>dairui1</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=dairui1" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bannzai"><img src="https://avatars.githubusercontent.com/u/10897361?v=4?s=100" width="100px;" alt="bannzai"/><br /><sub><b>bannzai</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=bannzai" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/axmo"><img src="https://avatars.githubusercontent.com/u/2386344?v=4?s=100" width="100px;" alt="axmo"/><br /><sub><b>axmo</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=axmo" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/asychin"><img src="https://avatars.githubusercontent.com/u/178776568?v=4?s=100" width="100px;" alt="asychin"/><br /><sub><b>asychin</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=asychin" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/amittell"><img src="https://avatars.githubusercontent.com/u/1388680?v=4?s=100" width="100px;" alt="amittell"/><br /><sub><b>amittell</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=amittell" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Yoshino-Yukitaro"><img src="https://avatars.githubusercontent.com/u/67864326?v=4?s=100" width="100px;" alt="Yoshino-Yukitaro"/><br /><sub><b>Yoshino-Yukitaro</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=Yoshino-Yukitaro" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Yikai-Liao"><img src="https://avatars.githubusercontent.com/u/110762732?v=4?s=100" width="100px;" alt="Yikai-Liao"/><br /><sub><b>Yikai-Liao</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=Yikai-Liao" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/zxdvd"><img src="https://avatars.githubusercontent.com/u/107175?v=4?s=100" width="100px;" alt="zxdvd"/><br /><sub><b>zxdvd</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=zxdvd" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/vladstudio"><img src="https://avatars.githubusercontent.com/u/914320?v=4?s=100" width="100px;" alt="vladstudio"/><br /><sub><b>vladstudio</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=vladstudio" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tmsjngx0"><img src="https://avatars.githubusercontent.com/u/40481136?v=4?s=100" width="100px;" alt="tmsjngx0"/><br /><sub><b>tmsjngx0</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=tmsjngx0" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/PretzelVector"><img src="https://avatars.githubusercontent.com/u/95664360?v=4?s=100" width="100px;" alt="PretzelVector"/><br /><sub><b>PretzelVector</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=PretzelVector" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/zetaloop"><img src="https://avatars.githubusercontent.com/u/36418285?v=4?s=100" width="100px;" alt="zetaloop"/><br /><sub><b>zetaloop</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=zetaloop" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/cdlliuy"><img src="https://avatars.githubusercontent.com/u/17263036?v=4?s=100" width="100px;" alt="cdlliuy"/><br /><sub><b>cdlliuy</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=cdlliuy" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/student20880"><img src="https://avatars.githubusercontent.com/u/74263488?v=4?s=100" width="100px;" alt="student20880"/><br /><sub><b>student20880</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=student20880" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/shohei-ihaya"><img src="https://avatars.githubusercontent.com/u/25131938?v=4?s=100" width="100px;" alt="shohei-ihaya"/><br /><sub><b>shohei-ihaya</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=shohei-ihaya" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/shaybc"><img src="https://avatars.githubusercontent.com/u/8535905?v=4?s=100" width="100px;" alt="shaybc"/><br /><sub><b>shaybc</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=shaybc" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/seedlord"><img src="https://avatars.githubusercontent.com/u/20932878?v=4?s=100" width="100px;" alt="seedlord"/><br /><sub><b>seedlord</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=seedlord" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/samir-nimbly"><img src="https://avatars.githubusercontent.com/u/112695483?v=4?s=100" width="100px;" alt="samir-nimbly"/><br /><sub><b>samir-nimbly</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=samir-nimbly" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/robertheadley"><img src="https://avatars.githubusercontent.com/u/1780455?v=4?s=100" width="100px;" alt="robertheadley"/><br /><sub><b>robertheadley</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=robertheadley" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/refactorthis"><img src="https://avatars.githubusercontent.com/u/3012240?v=4?s=100" width="100px;" alt="refactorthis"/><br /><sub><b>refactorthis</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=refactorthis" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/qingyuan1109"><img src="https://avatars.githubusercontent.com/u/841732?v=4?s=100" width="100px;" alt="qingyuan1109"/><br /><sub><b>qingyuan1109</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=qingyuan1109" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/pokutuna"><img src="https://avatars.githubusercontent.com/u/57545?v=4?s=100" width="100px;" alt="pokutuna"/><br /><sub><b>pokutuna</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=pokutuna" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/philipnext"><img src="https://avatars.githubusercontent.com/u/81944499?v=4?s=100" width="100px;" alt="philipnext"/><br /><sub><b>philipnext</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=philipnext" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/oprstchn"><img src="https://avatars.githubusercontent.com/u/16177972?v=4?s=100" width="100px;" alt="oprstchn"/><br /><sub><b>oprstchn</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=oprstchn" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nobu007"><img src="https://avatars.githubusercontent.com/u/8529529?v=4?s=100" width="100px;" alt="nobu007"/><br /><sub><b>nobu007</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=nobu007" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mosleyit"><img src="https://avatars.githubusercontent.com/u/189396442?v=4?s=100" width="100px;" alt="mosleyit"/><br /><sub><b>mosleyit</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=mosleyit" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/moqimoqidea"><img src="https://avatars.githubusercontent.com/u/39821951?v=4?s=100" width="100px;" alt="moqimoqidea"/><br /><sub><b>moqimoqidea</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=moqimoqidea" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mlopezr"><img src="https://avatars.githubusercontent.com/u/8202027?v=4?s=100" width="100px;" alt="mlopezr"/><br /><sub><b>mlopezr</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=mlopezr" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mecab"><img src="https://avatars.githubusercontent.com/u/1580772?v=4?s=100" width="100px;" alt="mecab"/><br /><sub><b>mecab</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=mecab" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/olup"><img src="https://avatars.githubusercontent.com/u/13785588?v=4?s=100" width="100px;" alt="olup"/><br /><sub><b>olup</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=olup" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/lightrabbit"><img src="https://avatars.githubusercontent.com/u/1521765?v=4?s=100" width="100px;" alt="lightrabbit"/><br /><sub><b>lightrabbit</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=lightrabbit" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/celestial-vault"><img src="https://avatars.githubusercontent.com/u/58194240?v=4?s=100" width="100px;" alt="celestial-vault"/><br /><sub><b>celestial-vault</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=celestial-vault" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/linegel"><img src="https://avatars.githubusercontent.com/u/1746296?v=4?s=100" width="100px;" alt="linegel"/><br /><sub><b>linegel</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=linegel" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dbasclpy"><img src="https://avatars.githubusercontent.com/u/139889137?v=4?s=100" width="100px;" alt="dbasclpy"/><br /><sub><b>dbasclpy</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=dbasclpy" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Deon588"><img src="https://avatars.githubusercontent.com/u/12716437?v=4?s=100" width="100px;" alt="Deon588"/><br /><sub><b>Deon588</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=Deon588" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dleen"><img src="https://avatars.githubusercontent.com/u/1297964?v=4?s=100" width="100px;" alt="dleen"/><br /><sub><b>dleen</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=dleen" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/devxpain"><img src="https://avatars.githubusercontent.com/u/170700110?v=4?s=100" width="100px;" alt="devxpain"/><br /><sub><b>devxpain</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=devxpain" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/chadgauth"><img src="https://avatars.githubusercontent.com/u/2413356?v=4?s=100" width="100px;" alt="chadgauth"/><br /><sub><b>chadgauth</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=chadgauth" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/olearycrew"><img src="https://avatars.githubusercontent.com/u/6044920?v=4?s=100" width="100px;" alt="olearycrew"/><br /><sub><b>olearycrew</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=olearycrew" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/bogdan0083"><img src="https://avatars.githubusercontent.com/u/7077307?v=4?s=100" width="100px;" alt="bogdan0083"/><br /><sub><b>bogdan0083</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=bogdan0083" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Atlogit"><img src="https://avatars.githubusercontent.com/u/86947554?v=4?s=100" width="100px;" alt="Atlogit"/><br /><sub><b>Atlogit</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=Atlogit" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/atlasgong"><img src="https://avatars.githubusercontent.com/u/68199735?v=4?s=100" width="100px;" alt="atlasgong"/><br /><sub><b>atlasgong</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=atlasgong" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/andreastempsch"><img src="https://avatars.githubusercontent.com/u/117991125?v=4?s=100" width="100px;" alt="andreastempsch"/><br /><sub><b>andreastempsch</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=andreastempsch" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/alasano"><img src="https://avatars.githubusercontent.com/u/14372930?v=4?s=100" width="100px;" alt="alasano"/><br /><sub><b>alasano</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=alasano" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/QuinsZouls"><img src="https://avatars.githubusercontent.com/u/40646096?v=4?s=100" width="100px;" alt="QuinsZouls"/><br /><sub><b>QuinsZouls</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=QuinsZouls" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/HadesArchitect"><img src="https://avatars.githubusercontent.com/u/1742301?v=4?s=100" width="100px;" alt="HadesArchitect"/><br /><sub><b>HadesArchitect</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=HadesArchitect" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/alarno"><img src="https://avatars.githubusercontent.com/u/4355547?v=4?s=100" width="100px;" alt="alarno"/><br /><sub><b>alarno</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=alarno" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nexon33"><img src="https://avatars.githubusercontent.com/u/47557266?v=4?s=100" width="100px;" alt="nexon33"/><br /><sub><b>nexon33</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=nexon33" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/adilhafeez"><img src="https://avatars.githubusercontent.com/u/13196462?v=4?s=100" width="100px;" alt="adilhafeez"/><br /><sub><b>adilhafeez</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=adilhafeez" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/adamwlarson"><img src="https://avatars.githubusercontent.com/u/1392315?v=4?s=100" width="100px;" alt="adamwlarson"/><br /><sub><b>adamwlarson</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=adamwlarson" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/adamhill"><img src="https://avatars.githubusercontent.com/u/188638?v=4?s=100" width="100px;" alt="adamhill"/><br /><sub><b>adamhill</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=adamhill" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/AMHesch"><img src="https://avatars.githubusercontent.com/u/4777192?v=4?s=100" width="100px;" alt="AMHesch"/><br /><sub><b>AMHesch</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=AMHesch" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/tgfjt"><img src="https://avatars.githubusercontent.com/u/2628239?v=4?s=100" width="100px;" alt="tgfjt"/><br /><sub><b>tgfjt</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=tgfjt" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/maekawataiki"><img src="https://avatars.githubusercontent.com/u/26317009?v=4?s=100" width="100px;" alt="maekawataiki"/><br /><sub><b>maekawataiki</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=maekawataiki" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/SannidhyaSah"><img src="https://avatars.githubusercontent.com/u/186946675?v=4?s=100" width="100px;" alt="SannidhyaSah"/><br /><sub><b>SannidhyaSah</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=SannidhyaSah" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/samsilveira"><img src="https://avatars.githubusercontent.com/u/109295696?v=4?s=100" width="100px;" alt="samsilveira"/><br /><sub><b>samsilveira</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=samsilveira" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/01Rian"><img src="https://avatars.githubusercontent.com/u/109045233?v=4?s=100" width="100px;" alt="01Rian"/><br /><sub><b>01Rian</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=01Rian" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/RSO"><img src="https://avatars.githubusercontent.com/u/139663?v=4?s=100" width="100px;" alt="RSO"/><br /><sub><b>RSO</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=RSO" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/R-omk"><img src="https://avatars.githubusercontent.com/u/1633879?v=4?s=100" width="100px;" alt="R-omk"/><br /><sub><b>R-omk</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=R-omk" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Sarke"><img src="https://avatars.githubusercontent.com/u/2719310?v=4?s=100" width="100px;" alt="Sarke"/><br /><sub><b>Sarke</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=Sarke" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kvokka"><img src="https://avatars.githubusercontent.com/u/15954013?v=4?s=100" width="100px;" alt="kvokka"/><br /><sub><b>kvokka</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=kvokka" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ecmasx"><img src="https://avatars.githubusercontent.com/u/135958728?v=4?s=100" width="100px;" alt="ecmasx"/><br /><sub><b>ecmasx</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=ecmasx" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mollux"><img src="https://avatars.githubusercontent.com/u/3983285?v=4?s=100" width="100px;" alt="mollux"/><br /><sub><b>mollux</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=mollux" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/marvijo-code"><img src="https://avatars.githubusercontent.com/u/82562019?v=4?s=100" width="100px;" alt="marvijo-code"/><br /><sub><b>marvijo-code</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=marvijo-code" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mamertofabian"><img src="https://avatars.githubusercontent.com/u/7698436?v=4?s=100" width="100px;" alt="mamertofabian"/><br /><sub><b>mamertofabian</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=mamertofabian" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/monkeyDluffy6017"><img src="https://avatars.githubusercontent.com/u/9354193?v=4?s=100" width="100px;" alt="monkeyDluffy6017"/><br /><sub><b>monkeyDluffy6017</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=monkeyDluffy6017" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/libertyteeth"><img src="https://avatars.githubusercontent.com/u/32841567?v=4?s=100" width="100px;" alt="libertyteeth"/><br /><sub><b>libertyteeth</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=libertyteeth" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/shtse8"><img src="https://avatars.githubusercontent.com/u/8020099?v=4?s=100" width="100px;" alt="shtse8"/><br /><sub><b>shtse8</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=shtse8" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ksze"><img src="https://avatars.githubusercontent.com/u/381556?v=4?s=100" width="100px;" alt="ksze"/><br /><sub><b>ksze</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=ksze" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Jdo300"><img src="https://avatars.githubusercontent.com/u/67338327?v=4?s=100" width="100px;" alt="Jdo300"/><br /><sub><b>Jdo300</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=Jdo300" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/hesara"><img src="https://avatars.githubusercontent.com/u/1335918?v=4?s=100" width="100px;" alt="hesara"/><br /><sub><b>hesara</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=hesara" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/DeXtroTip"><img src="https://avatars.githubusercontent.com/u/21011087?v=4?s=100" width="100px;" alt="DeXtroTip"/><br /><sub><b>DeXtroTip</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=DeXtroTip" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/pfitz"><img src="https://avatars.githubusercontent.com/u/3062911?v=4?s=100" width="100px;" alt="pfitz"/><br /><sub><b>pfitz</b></sub></a><br /><a href="https://github.com/Zentar.AI/Zentara-Code/commits?author=pfitz" title="Code">💻</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

[![All Contributors](https://img.shields.io/github/all-contributors/projectOwner/projectName?color=ee8449&style=flat-square)](#contributors)