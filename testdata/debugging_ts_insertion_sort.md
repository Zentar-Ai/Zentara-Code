# Debugging Tools Demonstration Script (for LLM) - TypeScript Insertion Sort

This document outlines a step-by-step demonstration of runtime debugging capabilities using a TypeScript script implementing the Insertion Sort algorithm. The target audience for this demonstration is an LLM that will be guided through the debugging process. Zentara will automatically use `tsx` to execute the TypeScript code, so no compilation is needed.

## Objective

To showcase the use of various debugging concepts such as launching a debug session, setting breakpoints, stepping through code, inspecting variables, and analyzing the call stack to identify and understand potential issues in a TypeScript script, all performed by an LLM. The focus is on understanding runtime behavior through debugging tools.

## Prerequisites

- The file [`testdata/insertion_sort_buggy.ts`](testdata/insertion_sort_buggy.ts) must exist in the workspace. This file contains an insertion sort algorithm with simple assertion-based tests.
- `npm` and `tsx` must be installed. To install `tsx`, run the following command:
  ```bash
  npm install --save-dev tsx
  ```
  You can also install it globally if you prefer:
  ```bash
  npm install -g tsx
  ```
- The LLM must have access to and knowledge of how to use debugging tools for TypeScript.

## Demonstration Steps

### 1. Manual Debugging Setup

First, verify that the script can be run manually using `tsx`. The `launch.json` file in your VS Code setup should include a configuration similar to the following:

```json
 {
  "type": "node",
  "request": "launch",
  "name": "Debug TypeScript",
  "runtimeExecutable": "tsx",
  "program": "${workspaceFolder}/testdata/insertion_sort_buggy.debug.ts",
  "sourceMaps": true
}
```

### 2. Launch a Debugging Session with Zentara

**Instruction for LLM:**

To preserve the original buggy file, first create a copy of [`testdata/insertion_sort_buggy.ts`](testdata/insertion_sort_buggy.ts) by using command line only (do not use write file tool) and name it `testdata/insertion_sort_buggy.debug.ts`. All debugging activities will be performed on this new file.

Now, start a debugging session for the copied file: [`testdata/insertion_sort_buggy.debug.ts`](testdata/insertion_sort_buggy.debug.ts).
Configure the debugger to stop at the very beginning of the script's execution (stop on entry).

_Action:_ First, copy the file. Then, launch the new TypeScript file in a debugging session
### 3. Initial Run and Observing Failures

**Instruction for LLM:**

The script contains simple assertions that will indicate if the sorting works correctly. After the initial stop at entry, continue program execution without any additional breakpoints. Let the program run until it finishes or hits an unhandled exception.
Report the output, including any assertion failures observed.

_Action:_ Continue program execution and report the results.

### 4. Iterative Debugging and Diagnosis

**(This section will be guided interactively. The LLM will use various debugging tools based on the observed errors.)**

**General Instructions for LLM for this phase:**

Based on the assertion failures from the initial run, you will now use your debugging capabilities to pinpoint the cause of a specific failure. Focus on runtime analysis using the debugger to understand *why* it's failing.

**Example Scenario (to be adapted based on actual first error):**

Let's assume a failure occurred related to the first test case (`arr1`).

**Instruction for LLM (Example):**

It appears a failure occurred related to the first test case. Let's investigate this.

1.  Restart the debugging session for [`testdata/insertion_sort_buggy.debug.ts`](testdata/insertion_sort_buggy.debug.ts), again stopping at the entry point.
2.  Identify the line number where the `insertionSort` function begins and set a breakpoint there.
3.  Identify the line number within the `runTests` function where `insertionSort` is called for the first test case (`arr1`) and set a breakpoint there.
4.  Continue execution until the breakpoint (related to the first test case call) is hit.

_Action:_ Perform the restart and set the specified breakpoints, then continue execution.

**Instruction for LLM (Example continued):**

Now that execution is paused before calling `insertionSort` for the first test case:

1.  Inspect the values of the arguments that will be passed to `insertionSort` (e.g., the array `arr`).
2.  Step into the `insertionSort` function.

_Action:_ Evaluate the relevant variables and then step into the function call.

**Instruction for LLM (Example continued):**

You are now inside the `insertionSort` function, presumably called with the first test array.

1.  Note the current line of execution.
2.  Step through the function line by line. As you step, observe the values of key local variables (e.g., `i`, `j`, `current`, `arr`).
3.  Pay close attention to the loops and how elements are shifted and inserted.
4.  Based on the execution flow and variable states observed through the debugger, identify why the function might be failing or behaving incorrectly for this test case.

_Action:_ Step through the code, evaluate variables, and analyze the control flow to diagnose the issue.

**Further Debugging Scenarios (LLM to explore as needed):**

- **Investigating the inner `while` loop:** If a bug is suspected in the shifting logic, set breakpoints within the `while` loop. Step through its iterations, examine how `j` changes and how elements are moved. Look for off-by-one errors or incorrect comparisons by inspecting variable states.
- **Analyzing edge cases:** If tests for empty or single-element arrays fail, use the debugger to step through `insertionSort` with these inputs, paying close attention to loop conditions and array indexing.
- **Variable inspection:** Use your capability to evaluate expressions and variables extensively at critical points to understand the program's state.
- **Call stack analysis:** If an error occurs within a nested call (though less likely in simple insertion sort), analyze the call stack to understand the sequence of calls and the state at each frame that led to the error.

### 5. Identifying a Bug (Example)

**Instruction for LLM:**

After stepping through the relevant code sections and inspecting variable states using the debugger (e.g., for the first test case in `insertionSort`), explain the specific bug you've identified. Your explanation should be based _solely_ on the information gathered from the runtime debugging session.

_Action:_ Provide a diagnosis of a bug based on debugger information.

### 6. (Optional) Proposing a Fix and Verifying

**Instruction for LLM:**

Based on your runtime diagnosis, you might be asked to propose a minimal code change to fix the identified bug. If instructed, and if your tools allow code modification, you would then apply the fix, restart the debugging session (or relevant part of the test), and verify if the specific test case now passes.

**Note:** The primary goal of this demonstration is diagnosis using debug tools, not necessarily fixing all bugs.

## Conclusion

This demonstration should highlight how an LLM can utilize runtime debugging tools to systematically analyze code execution, inspect state, and pinpoint the root causes of errors in a TypeScript context. This is a critical capability for advanced code understanding and assistance in software development.