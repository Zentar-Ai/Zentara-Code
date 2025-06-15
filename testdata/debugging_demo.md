# Debugging Tools Demonstration Script (for LLM)

This document outlines a step-by-step demonstration of runtime debugging capabilities using a buggy Python script. The target audience for this demonstration is an LLM that will be guided through the debugging process.

## Objective

To showcase the use of various debugging concepts such as launching a debug session, setting breakpoints, stepping through code, inspecting variables, and analyzing the call stack to identify and understand bugs in a Python script, all performed by an LLM. Repair the file based on the deep understanding of the runtime behavior of the program, not based on the static analysis of the code.

## Prerequisites

- The file [`testdata/quicksort_buggy.py`](testdata/quicksort_buggy.py) must exist in the workspace. This file contains a quicksort algorithm with several intentional bugs and simple assertion-based tests.
- The LLM must have access to and knowledge of how to use debugging tools.

## Demonstration Steps

### 1. Prepare the Debugging Target

**Instruction for LLM:**

Your first step is to create a copy of the script we'll be debugging. This ensures the original buggy script remains untouched for future demonstrations.

_Action:_ Copy the file [`testdata/quicksort_buggy.py`](testdata/quicksort_buggy.py) to a new file named [`testdata/quicksort_buggy.debug.py`](testdata/quicksort_buggy.debug.py) by using command line ' cp [original file path] [new file path ] '

### 2. Launch a Debugging Session

**Instruction for LLM:**

Now, start a debugging session for the copied Python script: [`testdata/quicksort_buggy.debug.py`](testdata/quicksort_buggy.debug.py).
Configure the debugger to stop at the very beginning of the script's execution (stop on entry).

_Action:_ Launch the specified Python script in a debugging session with `stopOnEntry` enabled.

### 3. Initial Run and Observing Failures

**Instruction for LLM:**

The script is designed to fail due to its bugs. After the initial stop at entry, continue program execution without any additional breakpoints. Let the program run until it finishes or hits an unhandled exception.
Report the output, including any tracebacks or test failures observed.

_Action:_ Continue program execution and report the results.

### 4. Iterative Debugging and Diagnosis

**(This section will be guided interactively. The LLM will use various debugging tools based on the observed errors.)**

**General Instructions for LLM for this phase:**

Based on the errors and failed assertions from the initial run, you will now use your debugging capabilities to pinpoint the cause of a specific failure. Focus on runtime analysis. Do NOT try to fix the code by static analysis alone. The goal is to _use the debugger_ to understand _why_ it's failing.

**Example Scenario (to be adapted based on actual first error):**

Let's assume the first error is an `IndexError` or a failing assertion in `test_empty_list`.

**Instruction for LLM (Example):**

It appears a failure occurred related to `test_empty_list`. Let's investigate this.

1.  Restart the debugging session for [`testdata/quicksort_buggy.debug.py`](testdata/quicksort_buggy.debug.py), again stopping at the entry point.
2.  Identify the line number where the `quick_sort` function begins and set a breakpoint there.
3.  Identify the line number within the `run_tests` function where `quick_sort` is called for the `test_empty_list` scenario and set a breakpoint there.
4.  Continue execution until the breakpoint (related to `test_empty_list` call) is hit.

_Action:_ Perform the restart and set the specified breakpoints, then continue execution.

**Instruction for LLM (Example continued):**

Now that execution is paused before calling `quick_sort` for the empty list:

1.  Inspect the values of the arguments that will be passed to `quick_sort` (e.g., the array itself, `low`, and `high`).
2.  Step into the `quick_sort` function.

_Action:_ Evaluate the relevant variables and then step into the function call.

**Instruction for LLM (Example continued):**

You are now inside the `quick_sort` function, presumably called with parameters for an empty list.

1.  Note the current line of execution.
2.  Step through the function line by line. As you step, observe the values of key local variables (e.g., `low`, `high`, `arr`, `pi`).
3.  Pay close attention to how the base case conditions are evaluated with the current arguments.
4.  Based on the execution flow and variable states observed through the debugger, identify why the function might be failing or behaving incorrectly for an empty list.

_Action:_ Step through the code, evaluate variables, and analyze the control flow to diagnose the issue.

**Further Debugging Scenarios (LLM to explore as needed):**

- **Investigating `partition` function:** If a bug is suspected in `partition`, set breakpoints within it. Step through its logic, examine how the pivot is chosen, and how indices/values are updated. Look for off-by-one errors or incorrect swap logic by inspecting variable states.
- **Analyzing recursive calls:** When `quick_sort` calls itself, examine the `low` and `high` arguments for these recursive calls. Are they correct? Is any part of the array being skipped or processed multiple times? Use the call stack to understand the depth and parameters of recursion.
- **Variable inspection:** Use your capability to evaluate expressions and variables extensively at critical points to understand the program's state.
- **Call stack analysis:** If an error occurs deep in recursion, analyze the call stack to understand the sequence of calls and the state at each frame that led to the error.

### 5. Identifying a Bug (Example)

**Instruction for LLM:**

After stepping through the relevant code sections and inspecting variable states using the debugger (e.g., for the empty list scenario in `quick_sort`), explain the specific bug you've identified. Your explanation should be based _solely_ on the information gathered from the runtime debugging session.

_Action:_ Provide a diagnosis of a bug based on debugger information.

### 6. (Optional) Proposing a Fix and Verifying

**Instruction for LLM:**

Based on your runtime diagnosis, you might be asked to propose a minimal code change to fix the identified bug. If instructed, and if your tools allow code modification, you would then apply the fix, restart the debugging session (or relevant part of the test), and verify if the specific test case now passes.

**Note:** The primary goal of this demonstration is diagnosis using debug tools, not necessarily fixing all bugs.

## Conclusion

This demonstration should highlight how an LLM can utilize runtime debugging tools to systematically analyze code execution, inspect state, and pinpoint the root causes of errors. This is a critical capability for advanced code understanding and assistance in software development.
