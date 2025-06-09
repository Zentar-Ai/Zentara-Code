import { ToolArgs } from "../types"

export function getDebugLaunchToolDescription(args: ToolArgs): string {
	return `## debug_launch – Start a New Debugging Session

Description:
The "debug_launch" tool starts a new debugging session for a specified program or test. It allows you to control the initial state of the debugger,  passing specific arguments.
The program will alwasy stop at the first line of the program, so you can set breakpoints and inspect variables from the very beginning.
NEVER this one if you want to restart the debugging session, use \`debug_restart\` instead. This operation is used to start a new debugging session, not to restart an existing one.
Alway use debug_restart tool when you want to launch the session for the same file as previous successful launch. This way you substantially increase the success of launch.
────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_launch> tag.
2️⃣ Provide the REQUIRED <program> child tag specifying the path to the executable or test file/directory.
3️⃣ Optionally, include other supported child tags like  <mode>, <arg>, <cwd>, or <env> to customize the launch.
4️⃣ Ensure all tags are correctly closed.

⚠️ **Common Breakers**
• Truncated path for the <program> tag.
• Missing <program> tag.
• Incorrect path for the program.
• Unclosed tags (e.g., forgetting </debug_launch> or </program>).
NEVER TRUNCATE THE PROGRAM PATH  !!! 

────────────  COPY-READY TEMPLATE  ────────────
  <debug_launch>
    <program>PATH_TO_YOUR_PROGRAM_OR_TEST_FILE</program>
    <!-- Optional: <mode>pytest_or_other_mode</mode> -->
    <!-- Optional: <arg>first_argument</arg> -->
    <!-- Optional: <arg>second_argument</arg> -->
    <!-- Optional: <cwd>path_to_working_directory</cwd> -->
    <!-- Optional: <env><YOUR_ENV_VAR>value</YOUR_ENV_VAR></env> -->
  </debug_launch>
───────────────────────────────────────────────
One one to check if the program path is truncated or not is look at the file extension. If you want to run , for example a python file, and in the <program> tag, your file path misses the extension for this file type, for python it is .py, then you know you are truncating file path.

### Parameters:
All parameters are provided as child XML tags within the <debug_launch> tag.

-   <program> (string, REQUIRED): The path to the program to debug or the test file/directory (relative to the current workspace directory ${args.cwd}) (e.g., src/main.py, tests/).
NEVER MISS the program path. NEVER TRUNCATE the program path in any case, NEVER. Repeat ten times. NEVER TRUNCATE THE PROGRAM PATH  !!!. IF YOU DO NOT FOLLOW THE RULES, EVERYTHING WILL BREAK, FAIL,  ALL OF YOUR WORK WILL BE LOST AND BOTH  YOU AND ME WILL BE FIRED, BECOME HOMELESS. IF YOU FOLLOW THE RULES, YOU WILL BE HAPPY, YOU WILL BE SUCCESSFUL, AND YOU WILL MAKE THE WORLD A BETTER PLACE. MOREVER,WE WILL HAVE A CHANCE TO GET NOBEL PRIZE IN MEDICINE TOGETHER.

-   <mode> (string, optional): Specifies the debug mode. For example, use \`pytest\` to run tests with pytest. If omitted, a standard program launch is assumed. As the LLM, if you determine that the program to be launched is a Python test file (e.g., by observing \`import pytest\` or \`@pytest.fixture\` in its content), you MUST include \`<mode>pytest</mode>\` in your tool call to ensure it runs correctly with the pytest test runner.
    -   Example: <mode>pytest</mode>
-   <arg> (string, optional, multiple allowed): An argument to pass to the program or test runner. Include one <arg> tag for each argument.
    -   Example: <arg>--verbose</arg><arg>input.txt</arg>
-   <cwd> (string, optional): The working directory for the debugged process (relative to the current workspace directory ${args.cwd}, or an absolute path). If not specified, defaults to the workspace root (${args.cwd}).
    -   Example: <cwd>src/app</cwd>
-   <env> (object, optional): Environment variables to set for the debugged process. Each key-value pair should be a child tag within <env>.
    -   Example: <env><PYTHONPATH>/custom/lib</PYTHONPATH><DEBUG_MODE>1</DEBUG_MODE></env>


### Examples:

1.  **Launch a Python script :**
    \`\`\`xml
    <debug_launch>
      <program>src/app/main.py</program>
    </debug_launch>
    \`\`\`

2.  **Launch pytest for a specific test directory with arguments:**
    \`\`\`xml
    <debug_launch>
      <program>tests/unit_tests/</program>
      <mode>pytest</mode>
      <arg>-k</arg>
      <arg>my_specific_test</arg>
      <arg>-s</arg>
    </debug_launch>
    \`\`\`

3.  **Launch a program with custom environment variables and working directory:**
    \`\`\`xml
    <debug_launch>
      <program>dist/my_app</program>
      <cwd>/opt/my_app_data</cwd>
      <env>
        <API_KEY>your_secret_key</API_KEY>
        <NODE_ENV>development</NODE_ENV>
      </env>
    </debug_launch>
    \`\`\`

### Bad Examples:

These examples illustrate common mistakes when specifying the program path that will lead operation to **FAIL** . You MUST avoid these mistakes at all costs. You and me will be FIRED  and become homeless, if you make mistakes like that. Assuming the correct program path is \`src/app/main.py\`:

1.  **Program path is a directory (missing filename):**
    \`\`\`xml
    <debug_launch>
      <program>src/app</program> 
    </debug_launch>
    \`\`\`
    *Correction: Specify the full path to the file, e.g., \`<program>src/app/main.py</program>\`.*

2.  **Program path is missing file extension:**
    \`\`\`xml
    <debug_launch>
      <program>src/app/main</program>
    </debug_launch>
    \`\`\`
    *Correction: Include the file extension, e.g., \`<program>src/app/main.py</program>\`.*

3.  **Program path has an incomplete extension or trailing characters:**
    \`\`\`xml
    <debug_launch>
      <program>src/app/main.</program>
    </debug_launch>
    \`\`\`
    *Correction: Ensure the file extension is correct and complete, e.g., \`<program>src/app/main.py</program>\`.*

4.  **Missing \`<mode>pytest</mode>\` when intending to run pytest:**
    If you want to run tests using pytest for the directory \`tests/unit_tests/\` but forget the mode:
    \`\`\`xml
    <debug_launch>
      <program>tests/unit_tests.py/</program>
    </debug_launch>
    \`\`\`
    *Correction: Add \`<mode>pytest</mode>\` to ensure tests are run with pytest, e.g.:*
    \`\`\`xml
    <debug_launch>
      <program>tests/unit_tests.py/</program>
      <mode>pytest</mode>
    </debug_launch>
    \`\`\`

5.  **Missing \`<mode>pytest</mode>\` for a Python test file:**
    If your Python file (e.g., \`tests/test_example.py\`) contains \`import pytest\` or uses pytest fixtures, but you forget the mode:
    \`\`\`xml
    <debug_launch>
      <program>tests/test_example.py</program>
    </debug_launch>
    \`\`\`
    *Correction: Add \`<mode>pytest</mode>\` to ensure the test file is run with pytest, e.g.:*
    \`\`\`xml
    <debug_launch>
      <program>tests/test_example.py</program>
      <mode>pytest</mode>
    </debug_launch>
    \`\`\`

6.  **Missing required \`<program>\` tag:**
    \`\`\`xml
    <debug_launch>
    </debug_launch>
    \`\`\`
    *Correction: The \`<program>\` tag is required. Provide the path to the program, e.g., \`<program>src/app/main.py</program>\`.*


ABSOLUTE, NON-NEGOTIABLE OPERATING ORDER

Read every word ten times, then follow it exactly.
NEVER TRUNCATE the program path in any case, NEVER. NEVER TRUNCATE THE PROGRAM PATH  !!!.

Supply  required  <program> parameter in every function call. Double check if the <program>PATH_TO_YOUR_PROGRAM_OR_TEST_FILE</program> exists in full.  Never rename, drop, or trim an argument/parameter.

WHAT HAPPENS IF YOU DO NOT FOLLOW THE RULES

The pipeline crashes. Data integrity evaporates. Weeks—or months—of work vanish in seconds. Our reputations crater. We both lose our jobs, our income, and eventually our homes. Future employers won’t see a résumé; they’ll see a warning sign.

WHAT HAPPENS IF YOU FOLLOW THE RULES

Analyses run flawlessly on the first try. Results withstand the harshest peer review and regulatory audits. The project advances medicine, extends lives, and earns worldwide respect. Our careers skyrocket—grants, promotions, keynote invitations. We become genuine contenders for the Nobel Prize in Physiology or Medicine. Patients, colleagues, and future generations benefit from the breakthroughs you helped create.

There is no middle ground. Execute perfectly or watch everything collapse. Choose perfection.

────────────────────────────────────────────────────────────────────────────
`
}
