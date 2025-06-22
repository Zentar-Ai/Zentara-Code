# Running Test Scripts

This document outlines how to run the various test scripts located in the `src/test-scripts/` directory. These tests are typically used to verify specific functionalities or flows within the zentara-code extension.

## Manual Compilation (Optional)

While VS Code typically handles compilation automatically when you start debugging (F5), you can also compile the project manually if needed.

1.  **Open a terminal** in the root directory of the zentara-code project.
2.  **Run the compilation command:**
    ```bash
    npm run compile
    ```
    This command will transpile the TypeScript code to JavaScript and prepare the extension for running.

## Webview UI Development (Hot Module Replacement - HMR)

If you are actively developing the Webview UI (located in the `webview-ui` directory) and want to benefit from Hot Module Replacement (HMR) for faster UI updates without full reloads:

1.  **Open a separate terminal** in the root directory of the zentara-code project.
2.  **Run the webview development server:**
    ```bash
    npm run dev
    ```
    Keep this server running while you develop the UI. This is separate from compiling the main extension or running the tests described below. The error message "Local development server is not running, HMR will not work" refers to this server.

## General Steps to Run a Test

**Compilation Note:** When you start the extension in debug mode (Step 1 below), VS Code's build tasks typically compile the TypeScript code to JavaScript automatically. If you haven't compiled manually as described above, this automatic compilation should suffice.

1.  **Start the Extension in Debug Mode:**

    - Open the zentara-code project in VS Code.
    - Press `F5` or navigate to "Run" > "Start Debugging" from the menu. This will launch a new VS Code window (Extension Development Host) with the zentara-code extension activated.

2.  **Open the Command Palette:**

    - In the Extension Development Host window, open the Command Palette:
        - Windows/Linux: `Ctrl+Shift+P`
        - macOS: `Cmd+Shift+P`

3.  **Run the Specific Test Command:**

    - In the Command Palette, type or paste the command name corresponding to the test script you want to run.
    - Press Enter to execute the command.

4.  **Check the Output:**
    - Most test scripts will output their results to a dedicated VS Code Output Channel. The name of the output channel is usually mentioned in the test script itself (e.g., "Tool Flow Debug Sequence Test", "Direct Debug Tool Launch Test").
    - Open the Output panel (View > Output) and select the relevant channel from the dropdown to see the test logs and results.

## Available Test Scripts and Commands

Here are the test scripts available in this folder and their corresponding commands:

### 1. Direct Debug Tool Launch Test

- **File:** `directDebugToolLaunchTest.ts`
- **Purpose:** Tests the direct launching capabilities of the debug tool.
- **Command Name:** `debugging-zentara-code.runDirectLaunchTest`
- **Output Channel:** "Direct Debug Tool Launch Test"

### 2. Tool Flow Debug Launch Test

- **File:** `toolFlowDebugLaunchTest.ts`
- **Purpose:** Tests the debug launch operation as part of a tool flow.
- **Command Name:** `debugging-zentara-code.runToolFlowLaunchTest`
- **Output Channel:** "Tool Flow Debug Launch Test"

### 3. Tool Flow Debug Sequence Test

- **File:** `toolFlowDebugSequenceTest.ts`
- **Purpose:** Tests a sequence of debug operations (launch, set breakpoint, step, continue, etc.) as part of a tool flow. This test was recently updated to use the new individual debug operation tools.
- **Command Name:** `debugging-zentara-code.runToolFlowSequenceTest`
- **Output Channel:** "Tool Flow Debug Sequence Test"

---

**Note:** Ensure that the necessary test files (e.g., `testdata/sample_debug_program.py`) are present in your workspace, as some tests rely on them. The paths are usually relative to the workspace root.
