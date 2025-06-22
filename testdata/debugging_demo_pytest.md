# Debugging with Pytest Demonstration Script (for LLM)

This document outlines a step-by-step demonstration of runtime debugging capabilities using pytest to test a buggy Python script. The target audience for this demonstration is an LLM that will be guided through the debugging process.

## Objective

To showcase the use of various debugging concepts such as launching a pytest debug session, setting breakpoints in test code and library code, stepping through code, inspecting variables, and analyzing the call stack to identify and understand bugs in a Python script invoked by pytest tests, all performed by an LLM. The goal is to repair the file based on a deep understanding of the runtime behavior of the program as revealed by the pytest execution, not based on static analysis alone.

## Prerequisites

- The file [`testdata/quicksort_buggy.py`](testdata/quicksort_buggy.py) must exist in the workspace. This file contains the original quicksort algorithm with several intentional bugs.
- A copy of this file, named [`testdata/quicksort_buggy_debug.py`](testdata/quicksort_buggy_debug.py), will be created and used for the debugging session to preserve the original.
- The file [`testdata/test_quicksort_pytest.py`](testdata/test_quicksort_pytest.py) must exist in the workspace. This file contains pytest tests designed to import and test `quicksort_buggy_debug.py`.
- The LLM must have access to and knowledge of how to use debugging tools, specifically with the `pytest` mode.

## Demonstration Steps

### 1. Prepare the Debugging Target

**Instruction for LLM:**

To ensure the original buggy script ([`testdata/quicksort_buggy.py`](testdata/quicksort_buggy.py)) remains untouched for other demonstrations, your first step is to create a copy that will be used for this debugging session. The pytest tests in [`testdata/test_quicksort_pytest.py`](testdata/test_quicksort_pytest.py) are configured to import from this copied file.

_Action:_ Copy the file [`testdata/quicksort_buggy.py`](testdata/quicksort_buggy.py) to a new file named [`testdata/quicksort_buggy_debug.py`](testdata/quicksort_buggy_debug.py) using an appropriate command (e.g., `cp testdata/quicksort_buggy.py testdata/quicksort_buggy_debug.py`).

### 2. Launch a Pytest Debugging Session

**Instruction for LLM:**

Start a debugging session for the pytest tests located in [`testdata/test_quicksort_pytest.py`](testdata/test_quicksort_pytest.py).
Configure the debugger to stop at the very beginning of the test execution (stop on entry).

_Action:_ Launch the specified pytest test file in a debugging session using `mode: pytest` and with `stopOnEntry` enabled. The program path should be the test file: [`testdata/test_quicksort_pytest.py`](testdata/test_quicksort_pytest.py).

### 3. Initial Run and Observing Failures

**Instruction for LLM:**

The tests are designed to fail due to the bugs in [`testdata/quicksort_buggy_debug.py`](testdata/quicksort_buggy_debug.py) (which is a copy of [`testdata/quicksort_buggy.py`](testdata/quicksort_buggy.py)). After the initial stop at entry (which might be inside pytest's own machinery), continue program execution without any additional breakpoints. Let pytest run all tests until it finishes or hits an unhandled exception.
Report the output, including any tracebacks or test failures observed from pytest.

_Action:_ Continue program execution and report the pytest results.

### 4. Iterative Debugging and Diagnosis

**(This section will be guided interactively. The LLM will use various debugging tools based on the observed errors.)**

**General Instructions for LLM for this phase:**

Based on the errors and failed assertions reported by pytest, you will now use your debugging capabilities to pinpoint the cause of a specific failure. Focus on runtime analysis of how the test calls into the buggy code. Do NOT try to fix the code by static analysis alone. The goal is to _use the debugger_ to understand _why_ a test is failing by observing the execution of [`testdata/quicksort_buggy_debug.py`](testdata/quicksort_buggy_debug.py) as driven by the test.

**Example Scenario (to be adapted based on actual first error reported by pytest):**

Let's assume pytest reports a failure in `test_empty_list` from [`testdata/test_quicksort_pytest.py`](testdata/test_quicksort_pytest.py:13).

**Instruction for LLM (Example):**

It appears `test_empty_list` failed. Let's investigate this.

1.  Restart the debugging session for [`testdata/test_quicksort_pytest.py`](testdata/test_quicksort_pytest.py) using `mode: pytest`, again stopping at the entry point.
2.  Identify the line number in [`testdata/test_quicksort_pytest.py`](testdata/test_quicksort_pytest.py:13) where `sort_and_test` (or directly `quick_sort`) is called within `test_empty_list` and set a breakpoint there.
3.  Also, identify the line number where the `quick_sort` function begins in [`testdata/quicksort_buggy_debug.py`](testdata/quicksort_buggy_debug.py:14) (our copied file) and set a breakpoint there.
4.  Continue execution. The debugger should first stop at the breakpoint in `test_empty_list`.

_Action:_ Perform the restart, set the specified breakpoints, then continue execution.

**Instruction for LLM (Example continued):**

Now that execution is paused in `test_empty_list` just before calling the sorting logic:

1.  Inspect the `arr` variable in [`testdata/test_quicksort_pytest.py`](testdata/test_quicksort_pytest.py:14).
2.  Step into the call that leads to `quick_sort` (this might be `sort_and_test` first, then `quick_sort`).
3.  Once inside `quick_sort` in [`testdata/quicksort_buggy_debug.py`](testdata/quicksort_buggy_debug.py:14), note the values of `arr`, `low`, and `high`.

_Action:_ Evaluate relevant variables and then step into the function calls until you are inside `quick_sort`.

**Instruction for LLM (Example continued):**

You are now inside the `quick_sort` function in [`testdata/quicksort_buggy_debug.py`](testdata/quicksort_buggy_debug.py:14), called via `test_empty_list`.

1.  Note the current line of execution.
2.  Step through the `quick_sort` function line by line. As you step, observe the values of key local variables (e.g., `low`, `high`, `arr`, `pi`).
3.  Pay close attention to how the base case conditions (e.g., [`if low >= high`](testdata/quicksort_buggy_debug.py:15)) are evaluated with the current arguments.
4.  Based on the execution flow and variable states observed through the debugger, identify why the function might be failing or behaving incorrectly for an empty list, leading to the test failure.

_Action:_ Step through the code, evaluate variables, and analyze the control flow to diagnose the issue within `quicksort_buggy_debug.py`.

**Further Debugging Scenarios (LLM to explore as needed):**

- **Investigating `partition` function:** If a bug is suspected in `partition` (e.g., from a failing `test_reverse_sorted_list`), set breakpoints within `partition` in [`testdata/quicksort_buggy_debug.py`](testdata/quicksort_buggy_debug.py:4). Step through its logic, examine how the pivot is chosen, and how indices/values are updated. Look for off-by-one errors or incorrect swap logic by inspecting variable states.
- **Analyzing recursive calls:** When `quick_sort` calls itself, examine the `low` and `high` arguments for these recursive calls. Are they correct? Is any part of the array being skipped or processed multiple times (e.g., the suspected bug in [`quick_sort(arr, pi + 2, high)`](testdata/quicksort_buggy_debug.py:23))? Use the call stack to understand the depth and parameters of recursion.
- **Variable inspection:** Use your capability to evaluate expressions and variables extensively at critical points in both the test script and the `quicksort_buggy_debug.py` script to understand the program's state.
- **Call stack analysis:** If an error occurs deep in recursion, analyze the call stack to understand the sequence of calls (from pytest, through the test function, into `quick_sort` and `partition`) and the state at each frame that led to the error.

### 5. Identifying a Bug (Example)

**Instruction for LLM:**

After stepping through the relevant code sections in [`testdata/quicksort_buggy_debug.py`](testdata/quicksort_buggy_debug.py:0) (as called by a failing pytest test) and inspecting variable states using the debugger, explain the specific bug you've identified. Your explanation should be based _solely_ on the information gathered from the runtime debugging session initiated by pytest.

_Action:_ Provide a diagnosis of a bug in `quicksort_buggy_debug.py` based on debugger information from the pytest session.

### 6. (Optional) Proposing a Fix and Verifying

**Instruction for LLM:**

Based on your runtime diagnosis, propose a minimal code change to fix the identified bug in [`testdata/quicksort_buggy_debug.py`](testdata/quicksort_buggy_debug.py:0). If instructed, then apply the fix to [`testdata/quicksort_buggy_debug.py`](testdata/quicksort_buggy_debug.py:0), then restart the pytest debugging session (or re-run the specific failing test if possible via the debugger) and verify if the specific test case now passes.

**Note:** The primary goal of this demonstration is diagnosis using debug tools with pytest, not necessarily fixing all bugs in one go.

## Conclusion

This demonstration should highlight how an LLM can utilize runtime debugging tools in conjunction with pytest to systematically analyze code execution, inspect state, and pinpoint the root causes of errors in library code called by tests. This is a critical capability for advanced code understanding and assistance in software development, especially when working with test-driven development workflows.
