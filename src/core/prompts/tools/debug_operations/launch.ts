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
2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the <debug_launch> tag.
3️⃣ The JSON object MUST contain a "program" key with the path to the executable or test file/directory.
4️⃣ Optionally, include other supported keys like "mode", "args", "cwd", or "env" in the JSON object to customize the launch.
5️⃣ Ensure the <debug_launch> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string (e.g., missing quotes around keys, trailing commas).
• Truncated path for the "program" value in the JSON.
• Missing "program" key in the JSON object.
• Incorrect path for the "program" value.
• Unclosed <debug_launch> tag.
NEVER TRUNCATE THE PROGRAM PATH !!!

────────────  COPY-READY TEMPLATE  ────────────
  <debug_launch>{"program": "PATH_TO_YOUR_PROGRAM_OR_TEST_FILE", "mode": "pytest_or_other_mode", "args": ["first_argument", "second_argument"], "cwd": "path_to_working_directory", "env": {"YOUR_ENV_VAR": "value"}}</debug_launch>
───────────────────────────────────────────────
One way to check if the program path is truncated or not is to look at the file extension. If you want to run, for example, a Python file, and in the "program" value within your JSON, your file path misses the extension for this file type (for Python it is .py), then you know you are truncating the file path.

### Parameters:
All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_launch> tag.

-   "program" (string, REQUIRED): The path to the program to debug or the test file/directory (relative to the current workspace directory ${args.cwd}) (e.g., "src/main.py", "tests/").
NEVER MISS the "program" key in the JSON. NEVER TRUNCATE the "program" path value in any case, NEVER. Repeat ten times. NEVER TRUNCATE THE PROGRAM PATH !!! IF YOU DO NOT FOLLOW THE RULES, EVERYTHING WILL BREAK, FAIL, ALL OF YOUR WORK WILL BE LOST AND BOTH YOU AND ME WILL BE FIRED, BECOME HOMELESS. IF YOU FOLLOW THE RULES, YOU WILL BE HAPPY, YOU WILL BE SUCCESSFUL, AND YOU WILL MAKE THE WORLD A BETTER PLACE. MOREOVER, WE WILL HAVE A CHANCE TO GET NOBEL PRIZE IN MEDICINE TOGETHER.

-   "mode" (string, optional): Specifies the debug mode. For example, use "pytest" to run tests with pytest. If omitted, a standard program launch is assumed. As the LLM, if you determine that the program to be launched is a Python test file (e.g., by observing \`import pytest\` or \`@pytest.fixture\` in its content), you MUST include \`"mode": "pytest"\` in your JSON object to ensure it runs correctly with the pytest test runner.
    -   Example: \`"mode": "pytest"\`
-   "args" (array of strings, optional): An array of arguments to pass to the program or test runner.
    -   Example: \`"args": ["--verbose", "input.txt"]\`
-   "cwd" (string, optional): The working directory for the debugged process (relative to the current workspace directory ${args.cwd}, or an absolute path). If not specified, defaults to the workspace root (${args.cwd}).
    -   Example: \`"cwd": "src/app"\`
-   "env" (object, optional): Environment variables to set for the debugged process. Each key-value pair should be part of this JSON object.
    -   Example: \`"env": {"PYTHONPATH": "/custom/lib", "DEBUG_MODE": "1"}\`


### Examples:

1.  **Launch a Python script :**
    \`\`\`xml
    <debug_launch>{"program": "src/app/main.py"}</debug_launch>
    \`\`\`

2.  **Launch pytest for a specific test directory with arguments:**
    \`\`\`xml
    <debug_launch>{"program": "tests/unit_tests/", "mode": "pytest", "args": ["-k", "my_specific_test", "-s"]}</debug_launch>
    \`\`\`

3.  **Launch a program with custom environment variables and working directory:**
    \`\`\`xml
    <debug_launch>{"program": "dist/my_app", "cwd": "/opt/my_app_data", "env": {"API_KEY": "your_secret_key", "NODE_ENV": "development"}}</debug_launch>
    \`\`\`

### Bad Examples:

These examples illustrate common mistakes when specifying parameters that will lead the operation to **FAIL**. You MUST avoid these mistakes at all costs. You and I will be FIRED and become homeless if you make mistakes like that. Assuming the correct program path is \`src/app/main.py\`:

1.  **Malformed JSON (missing quotes around a key):**
    \`\`\`xml
    <debug_launch>{program: "src/app/main.py"}</debug_launch>
    \`\`\`
    *Correction: Ensure all keys and string values in JSON are enclosed in double quotes, e.g., \`<debug_launch>{"program": "src/app/main.py"}</debug_launch>\`.*

2.  **"program" path is a directory (missing filename):**
    \`\`\`xml
    <debug_launch>{"program": "src/app"}</debug_launch>
    \`\`\`
    *Correction: Specify the full path to the file in the "program" value, e.g., \`{"program": "src/app/main.py"}\`.*

3.  **"program" path is missing file extension:**
    \`\`\`xml
    <debug_launch>{"program": "src/app/main"}</debug_launch>
    \`\`\`
    *Correction: Include the file extension in the "program" value, e.g., \`{"program": "src/app/main.py"}\`.*

4.  **"program" path has an incomplete extension or trailing characters:**
    \`\`\`xml
    <debug_launch>{"program": "src/app/main."}</debug_launch>
    \`\`\`
    *Correction: Ensure the file extension in the "program" value is correct and complete, e.g., \`{"program": "src/app/main.py"}\`.*

5.  **Missing \`"mode": "pytest"\` when intending to run pytest:**
    If you want to run tests using pytest for the directory \`tests/unit_tests/\` but forget the mode:
    \`\`\`xml
    <debug_launch>{"program": "tests/unit_tests/"}</debug_launch>
    \`\`\`
    *Correction: Add \`"mode": "pytest"\` to the JSON object to ensure tests are run with pytest, e.g.:*
    \`\`\`xml
    <debug_launch>{"program": "tests/unit_tests/", "mode": "pytest"}</debug_launch>
    \`\`\`

6.  **Missing \`"mode": "pytest"\` for a Python test file:**
    If your Python file (e.g., \`tests/test_example.py\`) contains \`import pytest\` or uses pytest fixtures, but you forget the mode:
    \`\`\`xml
    <debug_launch>{"program": "tests/test_example.py"}</debug_launch>
    \`\`\`
    *Correction: Add \`"mode": "pytest"\` to the JSON object to ensure the test file is run with pytest, e.g.:*
    \`\`\`xml
    <debug_launch>{"program": "tests/test_example.py", "mode": "pytest"}</debug_launch>
    \`\`\`

7.  **Missing required \`"program"\` key in JSON:**
    \`\`\`xml
    <debug_launch>{"mode": "pytest"}</debug_launch>
    \`\`\`
    *Correction: The \`"program"\` key is required in the JSON object. Provide the path to the program, e.g., \`<debug_launch>{"program": "src/app/main.py", "mode": "pytest"}</debug_launch>\`.*


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
