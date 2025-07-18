# Guide: Integrating a New Tool Operation

This guide outlines the modern steps to develop and integrate a new tool operation into the codebase. Zentara-Code has transitioned to a more robust JSON-based parameter system for tools, which this guide reflects.

## Prerequisites

- Familiarity with the project's overall architecture, especially how tools are defined, registered, and invoked.
- Understanding of the roles of core services, controllers, and prompt generation mechanisms.

## Steps for Integration

### 1. Plan Your Tool's Structure

Before writing code, decide on the structure.

- **Simple Tool**: For a single, straightforward operation, you can follow the traditional path of adding a handler and prompt file.
- **Complex Tool (e.g., a "meta-tool" with sub-operations)**: For complex tools like the `debug` tool, it is best practice to create a dedicated module inside a new directory, such as `src/zentara_debug/`. This encapsulates all related logic (controllers, event handling, helpers) and makes the tool easier to maintain.

### 2. Implement Core Tool Logic

The first step is to implement the actual functionality of your new tool. This logic should be callable from the central tool dispatcher.

- **Define Service/Controller Interface (If Applicable)**:
  If your tool's logic resides within a structured service or controller, define its method signature in the relevant interface file. For the new `debug` tool, this is handled within the [`src/zentara_debug/src/IDebugController.ts`](src/zentara_debug/src/IDebugController.ts:1) interface.

    ```typescript
    // Example in src/zentara_debug/src/IDebugController.ts
    export interface LaunchParams {
	program?: string
	[key: string]: any
    }

    export interface IDebugController {
	launch(params: LaunchParams): Promise<DebuggerResponse>
	// ... other debug operations
    }
    ```

- **Implement Core Logic**:
  Implement the new method in the corresponding service/controller implementation file. For the `debug` tool, this is [`src/zentara_debug/src/VsCodeDebugController.ts`](src/zentara_debug/src/VsCodeDebugController.ts).

    ```typescript
    // Example in src/zentara_debug/src/VsCodeDebugController.ts
    public async launch(params: LaunchParams): Promise<DebuggerResponse> {
        // ... your tool's logic here ...
        console.log(`[DebugController] Handling launch with params: ${JSON.stringify(params)}`);
        // ...
        return { success: true, /* ... other result fields ... */ };
    }
    ```

### 3. Create the Tool Prompt File

This file provides the description and usage instructions for the LLM. The modern approach uses a single JSON object for parameters instead of multiple XML child tags.

- Create a new TypeScript file in an appropriate subdirectory within `src/core/prompts/tools/` (e.g., `src/core/prompts/tools/debug_operations/`). Name it after your operation (e.g., `launch.ts`).
- This file should export a function that returns the tool's description string. The template should clearly show parameters as a single JSON object inside the tool's main tag.

    ```typescript
    // src/core/prompts/tools/debug_operations/launch.ts
    // Note: This is an example. For the actual debug tool, you would have separate files for each sub-operation like launch, set_breakpoint, etc.
    import type { ToolArgs } from "../types"

    export function getDebugLaunchToolDescription(args: ToolArgs): string {
	return `## debug_launch – Start a New Debugging Session

    Description:
    The "debug_launch" tool starts a new debugging session for a specified program or test.

    ────────────────────────  QUICK-START  ────────────────────────
    ✅ **Usage**
    1️⃣ Use the <debug_launch> tag.
    2️⃣ Provide all parameters as a single, well-formed JSON object string as the text content of the tag.
    3️⃣ The JSON object MUST contain a "program" key with the path to the executable.

    ⚠️ **Common Breakers**
    • Malformed JSON string (e.g., missing quotes around keys).
    • Missing required "program" key in the JSON.

    ────────────  COPY-READY TEMPLATE  ────────────
      <debug_launch>{"program": "path/to/your/program.py", "args": ["--verbose"]}</debug_launch>
    ───────────────────────────────────────────────

    ### Parameters:
    All parameters are provided as key-value pairs within a single JSON object, which is the text content of the <debug_launch> tag.

    - "program" (string, REQUIRED): The path to the program to debug.
    - "args" (array of strings, optional): Arguments to pass to the program.

    ### Examples:

    1.  **Launch a Python script:**
        \`\`\`xml
        <debug_launch>{"program": "src/app/main.py"}</debug_launch>
        \`\`\`
    ────────────────────────────────────────────────────────────────────────────
    `
    }
    ```

### 4. Update Prompt Index File

Export your new tool description function from its category's index file.

- Open the `index.ts` file in the directory where you created your prompt file (e.g., [`src/core/prompts/tools/debug_operations/index.ts`](src/core/prompts/tools/debug_operations/index.ts)).
- Add an export for your new tool description function:
    ```typescript
    // src/core/prompts/tools/debug_operations/index.ts
    // ... other exports ...
    export * from "./launch"
    ```

### 5. Register the Tool in Shared Configuration

Update shared configuration files to make the system aware of the new tool.

- **`src/schemas/index.ts`**:

    1.  Add your new tool name (e.g., `"debug_launch"`) to the `toolNames` array.
        ```typescript
        // in src/schemas/index.ts
        export const toolNames = [
		// ... existing tool names ...
		"debug_launch",
		// ... other tool names ...
        ] as const
        ```

- **[`webview-ui/src/components/settings/AutoApproveToggle.tsx`](webview-ui/src/components/settings/AutoApproveToggle.tsx:83) (If applicable)**:
  If your tool belongs to a new category that needs its own auto-approval setting, add it here.

    ```typescript
    // webview-ui/src/components/settings/AutoApproveToggle.tsx
    export const autoApproveSettingsConfig: Record<AutoApproveSetting, AutoApproveConfig> = {
	// ...
	alwaysAllowDebug: {
		key: "alwaysAllowDebug",
		labelKey: "settings:autoApprove.debug.label",
		descriptionKey: "settings:autoApprove.debug.description",
		icon: "debug",
		testId: "always-allow-debug-toggle",
	},
    }
    ```

- **[`webview-ui/src/context/ExtensionStateContext.tsx`](webview-ui/src/context/ExtensionStateContext.tsx:53) (If applicable)**:
  Add the state and setter for your new auto-approval setting.
    ```typescript
    // webview-ui/src/context/ExtensionStateContext.tsx
    export interface ExtensionStateContextType extends ExtensionState {
	// ...
	alwaysAllowDebug?: boolean
	setAlwaysAllowDebug: (value: boolean) => void
    }
    ```

### 6. Map Tool Name to Description Getter

Connect the tool's string name to its description-generating function.

- **[`src/core/prompts/tools/index.ts`](src/core/prompts/tools/index.ts:152:1)**:
    1.  Import your new description getter function.
        ```typescript
        import {
		// ...
		getDebugLaunchToolDescription,
        } from "./debug_operations"
        ```
    2.  Add an entry to the `toolDescriptionMap` object.
        ```typescript
        const toolDescriptionMap: Record<string, (args: ToolArgs) => string | undefined> = {
		// ...
		debug_launch: (args) => getDebugLaunchToolDescription(args),
        }
        ```

### 7. Implement Invocation Bridge and Validation

This step ensures your tool can be called by the LLM and its JSON arguments are parsed and validated correctly.

- **Invocation Bridge**:
  The system needs a way to route an LLM's request for `your_tool_name` to the core logic. This typically happens in a central request handler like [`src/core/assistant-message/presentAssistantMessage.ts`](src/core/assistant-message/presentAssistantMessage.ts:1).

    The handler should now expect the arguments as a JSON string in `toolCall.args`.

    ```typescript
    // Example handler logic
    import { vsCodeDebugController } from "../../zentara_debug" // Import your controller

    // ... inside a handler function in presentAssistantMessage.ts
    // if (toolCall.toolName.startsWith("debug_")) {
    //    return handleDebugTools(toolCall, ...);
    // }

    async function handleDebugTools(toolCall: ToolCall /*...*/) {
	const operation = toolCall.toolName.replace("debug_", "") // e.g., "launch"
	let params = {}
	try {
		// New: Parse params from JSON string in toolCall.args
		if (toolCall.args) {
			params = JSON.parse(toolCall.args)
		}
	} catch (e) {
		return { success: false, errorMessage: `Invalid JSON for arguments: ${e}` }
	}

	// Validate params against a schema if needed

	// Call your core logic
	switch (operation) {
		case "launch":
			return vsCodeDebugController.launch(params)
		// ... other debug operations
	}
    }
    ```

- **Validation**:
  Implement argument validation for your new tool. You can use a library like Zod to define schemas and validate the parsed JSON object. This ensures the LLM provides necessary arguments in the correct format.

### 8. Testing

Thoroughly test your new tool.

- **Unit Tests**:
    - Test the core logic implemented in Step 2.
    - Test your validation logic with various valid and invalid JSON inputs.
- **Integration Tests**:
    - Test the full flow: from a simulated LLM tool call (XML string with JSON content) through the Invocation Bridge, parsing, validation, to the execution of your core logic.
    - Verify correct behavior with valid arguments.
    - Verify appropriate error handling for malformed JSON, missing or invalid arguments.
- **End-to-End Testing**:
    - Manually test the new tool to ensure the LLM understands the prompt (from Step 3) and uses the tool correctly.

### 9. Documentation

- **Developer Documentation**:
    - Update any relevant internal developer documentation, architectural diagrams, or READMEs.
    - Comment your code clearly.
- **LLM-Facing Documentation**:
    - The prompt file created in Step 3 is the primary documentation for the LLM. Ensure it is comprehensive, clear, accurate, and provides helpful examples of the new JSON-in-XML format.

By following these steps, you can systematically add new tool operations to the extension, ensuring they are well-integrated, robust, and understandable to both developers and the LLM.
