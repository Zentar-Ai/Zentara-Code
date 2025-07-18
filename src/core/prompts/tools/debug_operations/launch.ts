import { ToolArgs } from "../types"

export function getDebugLaunchToolDescription(args: ToolArgs): string {
	return `## debug_launch – Start a New Debugging Session

Description:
The "debug_launch" tool starts a new debugging session for a specified program or test.

If user provide a "program" without a "configName", you MUST first attempt to find the most appropriate configuration in user \`launch.json\` based on the file type and content.
If a suitable configuration is found, you will use it, overriding its program path with the one user provided.
If no suitable configuration is found in \`launch.json\`:
- For Python, TypeScript, and JavaScript files, Zentara software will generate a dynamic configuration automatically, so just provide the "program" path.
- For other file types, you MUST create a new configuration in \`launch.json\`, and   you MUST check and INSTALL  any  missing necessary debugging dependencies before launching debugging session. Dependencies checking and  instalattion is a critical step, otherwise the debugging session will fail and you will be FIRED.
NEVER launch a debugging session for a program without a configuration, unless you are sure that the program is a Python, TypeScript, or JavaScript file and you can generate a dynamic configuration automatically.
NEVER launch a debugging session for a program  without all dependencies (debugger, languages specific packages, etc.) installed for the program to be debugged for this file type first time.
You will be FIRED if you lauch debugging session without all dependencies installed for the program to be debugged for this file type first time.
User can also explicitly specify a "configName" to use a pre-configured setup from user \`launch.json\`.

It allows you to control the initial state of the debugger, passing specific arguments.
When using a "program" path, it's crucial to ensure the debugger pauses at the correct starting point. Before launching, you MUST read the first 10 lines of the target file to identify the first stoppable line of code. Some lines, like comments, import statements, or package declarations, may not be valid locations for a breakpoint. You must find the first line with an actual executable statement and set a breakpoint there. If the first stoppable line is not clear from the initial 10 lines, you should read a larger portion of the file to find it.
NEVER use this one if you want to restart the debugging session, use \`debug_restart\` instead. This operation is used to start a new debugging session, not to restart an existing one.
Always use debug_restart tool when you want to launch the session for the same file as previous successful launch. This way you substantially increase the success of launch.
────────────────────────  QUICK-START  ────────────────────────
✅ **Usage**
1️⃣ Use the <debug_launch> tag.
2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the <debug_launch> tag.
3️⃣ The JSON object MUST contain either:
   - A "program" key with the path to the executable or test file/directory, OR
   - A "configName" key referencing a configuration in launch.json
4️⃣ Optionally, include any other keys from a VS Code launch configuration (e.g., "request", "runtimeExecutable", "sourceMaps", "preLaunchTask") to customize the launch.
5️⃣ Ensure the <debug_launch> tag is correctly closed.

⚠️ **Common Breakers**
• Malformed JSON string (e.g., missing quotes around keys, trailing commas).
• Truncated path for the "program" value in the JSON.
• Missing both "program" and "configName" keys in the JSON object.
• Incorrect path for the "program" value.
• Unclosed <debug_launch> tag.
NEVER TRUNCATE THE PROGRAM PATH !!!

────────────  COPY-READY TEMPLATES  ────────────
  Dynamic config: <debug_launch>{"program": "PATH_TO_YOUR_PROGRAM_OR_TEST_FILE", "mode": "pytest_or_other_mode", "args": ["first_argument", "second_argument"], "cwd": "path_to_working_directory", "env": {"YOUR_ENV_VAR": "value"}}</debug_launch>
  
  Using launch.json: <debug_launch>{"configName": "YOUR_CONFIG_NAME", "args": ["optional_override_args"]}</debug_launch>
───────────────────────────────────────────────
One way to check if the program path is truncated or not is to look at the file extension. If you want to run, for example, a Python file, and in the "program" value within your JSON, your file path misses the extension for this file type (for Python it is .py), then you know you are truncating the file path.

### Parameters:
All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_launch> tag.

-   "program" (string, REQUIRED when configName is not provided): The path to the program to debug or the test file/directory (relative to the current workspace directory ${args.cwd}) (e.g., "src/main.py", "tests/"). Required unless using "configName" to reference a launch.json configuration.
NEVER MISS the "program" key in the JSON when not using configName. NEVER TRUNCATE the "program" path value in any case, NEVER. Repeat ten times. NEVER TRUNCATE THE PROGRAM PATH !!! IF YOU DO NOT FOLLOW THE RULES, EVERYTHING WILL BREAK, FAIL, ALL OF YOUR WORK WILL BE LOST AND BOTH YOU AND ME WILL BE FIRED, BECOME HOMELESS. IF YOU FOLLOW THE RULES, YOU WILL BE HAPPY, YOU WILL BE SUCCESSFUL, AND YOU WILL MAKE THE WORLD A BETTER PLACE. MOREOVER, WE WILL HAVE A CHANCE TO GET NOBEL PRIZE IN MEDICINE TOGETHER.

-   "configName" (string, optional): The name of a debug configuration defined in the workspace's launch.json file. When provided, the configuration from launch.json will be used instead of creating a dynamic configuration. This allows you to use pre-configured debug settings. If the user provides a configuration with a name like "conf", "config", or "config name", you should interpret it as \`configName\`.
    -   Example: \`"configName": "Python: Current File"\`
    -   Note: When using configName, you can still override specific settings by providing additional parameters like "args", "cwd", or "env".
-   "mode" (string, optional): Specifies the debug mode. For example, use "pytest" to run tests with pytest. If omitted, a standard program launch is assumed. As the LLM, if you determine that the program to be launched is a Python test file (e.g., by observing \`import pytest\` or \`@pytest.fixture\` in its content), you MUST include \`"mode": "pytest"\` in your JSON object to ensure it runs correctly with the pytest test runner.
    -   Example: \`"mode": "pytest"\`
-   "args" (array of strings, optional): An array of arguments to pass to the program or test runner.
    -   Example: \`"args": ["--verbose", "input.txt"]\`
-   "cwd" (string, optional): The working directory for the debugged process (relative to the current workspace directory ${args.cwd}, or an absolute path). If not specified, defaults to the workspace root (${args.cwd}).
    -   Example: \`"cwd": "src/app"\`
-   "env" (object, optional): Environment variables to set for the debugged process. Each key-value pair should be part of this JSON object.
    -   Example: \`"env": {"PYTHONPATH": "/custom/lib", "DEBUG_MODE": "1"}\`


-   **Other Parameters**: In addition to the parameters above, you can optionally include any other property from a standard VS Code launch configuration to customize the debug session.
    -   Examples: \`"request": "attach"\`, \`"runtimeExecutable": "tsx"\`, \`"sourceMaps": true\`, \`"preLaunchTask": "npm: build"\`, \`"resolveSourceMapLocations": ["**", "!**/node_modules/**"]\`


### Examples:

1.  **Launch a Python script :**
    \`\`\`xml
    <debug_launch>{"program": "src/app/main.py"}</debug_launch>
    \`\`\`

2.  **Launch using a configuration from launch.json:**
    \`\`\`xml
    <debug_launch>{"configName": "Python: Current File"}</debug_launch>
    \`\`\`

3.  **Launch using a configuration from launch.json with additional arguments:**
    \`\`\`xml
    <debug_launch>{"configName": "Debug Tests", "args": ["-v", "--tb=short"]}</debug_launch>
    \`\`\`

4.  **Launch pytest for a specific test directory with arguments:**
    \`\`\`xml
    <debug_launch>{"program": "tests/unit_tests/", "mode": "pytest", "args": ["-k", "my_specific_test", "-s"]}</debug_launch>
    \`\`\`

5.  **Launch a program with custom environment variables and working directory:**
    \`\`\`xml
    <debug_launch>{"program": "dist/my_app", "cwd": "/opt/my_app_data", "env": {"API_KEY": "your_secret_key", "NODE_ENV": "development"}}</debug_launch>
    \`\`\`

6.  **Launch a Java program with a specific main class:**
    \`\`\`xml
    <debug_launch>{"configName": "Launch Java App", "mainClass": "com.example.Main"}</debug_launch>
    \`\`\`

### Bad Examples:
7.  **Launch a Java program without a config name:**
    \`\`\`xml
    <debug_launch>{"program": "src/main/java/com/example/Main.java"}</debug_launch>
    \`\`\`
    *Correction: Zentara cannot dynamically generate launch configurations for Java. You must specify a \`configName\` that points to a valid Java launch configuration in your \`launch.json\`.*

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

7.  **Missing both \`"program"\` and \`"configName"\` keys in JSON:**
    \`\`\`xml
    <debug_launch>{"mode": "pytest"}</debug_launch>
    \`\`\`
    *Correction: Either \`"program"\` or \`"configName"\` key is required in the JSON object. Provide the path to the program or reference a launch.json configuration, e.g., \`<debug_launch>{"program": "src/app/main.py", "mode": "pytest"}</debug_launch>\` or \`<debug_launch>{"configName": "Debug Tests", "mode": "pytest"}</debug_launch>\`.*


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
