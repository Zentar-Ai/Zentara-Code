# Guide: Integrating a New Tool Operation

This guide outlines the general steps to develop and integrate a new individual tool operation (e.g., `yourprefix_new_operation_name`) into the codebase.

## Prerequisites

- Familiarity with the project's overall architecture, especially how tools are defined, registered, and invoked.
- Understanding of the roles of core services, controllers, and prompt generation mechanisms.

## Steps for Integration

### 1. Implement Core Tool Logic

The first step is to implement the actual functionality of your new tool.

-   **Define Service/Controller Interface (If Applicable)**:
    If your tool's logic resides within a structured service or controller, define its method signature in the relevant interface file.
    ```typescript
    // Example in a hypothetical IYourService.ts
    export interface IYourService {
        // ... existing methods ...
        newOperationName(params: NewOperationParams): Promise<NewOperationResult>;
    }
    ```
-   **Implement Core Logic**:
    Implement the new method in the corresponding service/controller implementation file. This is where the main business logic of your tool will reside.
    ```typescript
    // Example in a hypothetical YourService.ts
    public async newOperationName(params: NewOperationParams): Promise<NewOperationResult> {
        // ... your tool's logic here ...
        console.log(`[YourService] Handling newOperation with params: ${JSON.stringify(params)}`);
        // ...
        return { success: true, /* ... other result fields ... */ };
    }
    ```
-   **Ensure Logic is Callable**:
    Make sure this core logic can be invoked from the tool handling mechanism that will be set up in later steps. This might involve a central tool dispatcher or a direct call from the tool's invocation bridge.

### 2. Create the Tool Prompt File

This file provides the description and usage instructions for the LLM.

-   Create a new TypeScript file in an appropriate subdirectory within `src/core/prompts/tools/` (e.g., `src/core/prompts/tools/your_tool_category/`). Name it after your operation (e.g., `new_operation_name.ts`).
-   This file should export a function that returns the tool's description string.
    ```typescript
    // src/core/prompts/tools/your_tool_category/new_operation_name.ts
    import type { ToolArgs } from "../types"; // Adjust path as needed

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- args may be unused
    export function getYourprefixNewOperationNameToolDescription(args: ToolArgs): string {
        return `## yourprefix_new_operation_name – Description of your new tool

    Description:
    Detailed explanation of what the tool does, its purpose, and when it should be used.

    ────────────────────────  QUICK-START  ────────────────────────
    ✅ **Usage**
    1️⃣ Use the <yourprefix_new_operation_name> tag.
    2️⃣ Provide REQUIRED parameters like <param1_name>value1</param1_name>.
    3️⃣ Optionally, include other supported child tags like <optional_param>.
    4️⃣ Ensure all tags are correctly closed.

    ⚠️ **Common Breakers**
    • Missing REQUIRED parameters (e.g., <param1_name>).
    • Incorrect values or types for parameters.
    • Unclosed XML tags.

    ────────────  COPY-READY TEMPLATE  ────────────
      <yourprefix_new_operation_name>
        <param1_name>value1</param1_name>
        <!-- Optional: <optional_param>value2</optional_param> -->
      </yourprefix_new_operation_name>
    ───────────────────────────────────────────────

    ### Parameters:
    All parameters are provided as child XML tags within the <yourprefix_new_operation_name> tag.

    - <param1_name> (type, REQUIRED): Description of param1. Explain its purpose and valid values.
    - <optional_param> (type, optional): Description of optional_param. Explain when it might be used.

    ### Examples:

    1.  **Basic usage with required parameter:**
        \`\`\`xml
        <yourprefix_new_operation_name>
          <param1_name>some_example_value</param1_name>
        </yourprefix_new_operation_name>
        \`\`\`

    2.  **Usage with an optional parameter:**
        \`\`\`xml
        <yourprefix_new_operation_name>
          <param1_name>another_value</param1_name>
          <optional_param>optional_value_here</optional_param>
        </yourprefix_new_operation_name>
        \`\`\`
    ────────────────────────────────────────────────────────────────────────────
    `;
    }
    ```

### 3. Update Prompt Index File

Export your new tool description function from its category's index file.

-   Open the `index.ts` file in the directory where you created your prompt file (e.g., `src/core/prompts/tools/your_tool_category/index.ts`).
-   Add an export for your new tool description function:
    ```typescript
    // src/core/prompts/tools/your_tool_category/index.ts
    // ... other exports ...
    export * from "./new_operation_name";
    ```

### 4. Register the Tool in Shared Configuration

Update shared configuration files to make the system aware of the new tool.

-   **`src/shared/tools.ts`**:
    1.  Add your new tool name (e.g., `yourprefix_new_operation_name`) and its user-friendly display name to the `TOOL_DISPLAY_NAMES` object:
        ```typescript
        export const TOOL_DISPLAY_NAMES: Record<ToolName, string> = {
            // ... existing tools ...
            yourprefix_new_operation_name: "YourPrefix: New Operation Name", // Or a more descriptive name
        };
        ```
    2.  Add your new tool name to the `tools` array within an appropriate group (or create a new group) in the `TOOL_GROUPS` object:
        ```typescript
        export const TOOL_GROUPS: Record<ToolGroup, ToolGroupConfig> = {
            // ... other groups ...
            your_tool_group: { // This could be an existing group or a new one
                tools: [
                    // ... existing tools in this group ...
                    "yourprefix_new_operation_name",
                ],
            },
        };
        ```
-   **`src/schemas/index.ts`**:
    1.  Add your new tool name (e.g., `"yourprefix_new_operation_name"`) to the `toolNames` array. Place it logically, perhaps alphabetically or grouped with similar tools.
        ```typescript
        export const toolNames = [
            // ... existing tool names ...
            "yourprefix_new_operation_name",
            // ... other tool names ...
        ] as const;
        ```

### 5. Map Tool Name to Description Getter

Connect the tool's string name to its description-generating function.

-   **`src/core/prompts/tools/index.ts`**:
    1.  Import your new description getter function at the top of the file, ensuring the path is correct based on where you placed it in Step 2 & 3:
        ```typescript
        import {
            // ... other imports ...
            getYourprefixNewOperationNameToolDescription,
        } from "./your_tool_category"; // Adjust path if needed
        ```
    2.  Add an entry to the `toolDescriptionMap` object:
        ```typescript
        const toolDescriptionMap: Record<string, (args: ToolArgs) => string | undefined> = {
            // ... existing mappings ...
            yourprefix_new_operation_name: (args) => getYourprefixNewOperationNameToolDescription(args),
        };
        ```
    3.  Add your function to the list of exported description functions at the bottom of the file:
        ```typescript
        export {
            // ... other exports ...
            getYourprefixNewOperationNameToolDescription,
        };
        ```

### 6. Generate Types

Update derived type definitions to include your new tool.

-   Run the following command in your terminal:
    ```bash
    npm run generate-types
    ```
-   If this command fails, carefully review the error messages. It often indicates TypeScript issues in the files you've modified or related files. Resolve these errors before proceeding.

### 7. Implement Invocation Bridge and Validation

This step ensures your tool can be called by the LLM and its arguments are validated.

-   **Invocation Bridge**:
    The system needs a way to route an LLM's request for `yourprefix_new_operation_name` to the core logic you implemented in Step 1. This typically happens in a central request handler like `src/core/assistant-message/presentAssistantMessage.ts`.
    You may need to:
    *   Add a new handler function if your tool has a unique prefix or structure.
    *   Modify an existing handler if it can be generalized to include your tool.
    This handler will parse the XML arguments from the LLM's request and call your core logic function.
    ```typescript
    // Example snippet in a hypothetical tool dispatcher (e.g., presentAssistantMessage.ts)

    // if (toolCall.toolName.startsWith("yourprefix_")) {
    //     return handleYourPrefixTools(toolCall, /* ... other necessary params ... */);
    // }

    // async function handleYourPrefixTools(toolCall: ToolCall, /*...*/) {
    //    const operationName = toolCall.toolName; // e.g., "yourprefix_new_operation_name"
    //    const args = parseXmlArgs(toolCall.args); // You'll need an XML parsing utility
    //
    //    // Validate args (see below)
    //    const validationError = validateYourOperationArgs(operationName, args);
    //    if (validationError) { /* handle error */ }
    //
    //    // Call your core logic
    //    // return yourService.newOperationName(args);
    // }
    ```

-   **Validation**:
    Implement argument validation for your new tool. This ensures the LLM provides necessary arguments in the correct format.
    *   Create validation logic (e.g., in a new `yourToolValidation.ts` or by extending an existing validation module).
    *   This validation should be called from your Invocation Bridge before executing the tool's core logic.
    *   It should check for required parameters, correct types, and any other constraints.

### 8. Testing

Thoroughly test your new tool.

-   **Unit Tests**:
    -   Test the core logic implemented in Step 1.
    -   Test any argument parsing or transformation logic in your Invocation Bridge.
    -   Test your validation logic with various valid and invalid inputs.
-   **Integration Tests**:
    -   Test the full flow: from a simulated LLM tool call (XML string) through the Invocation Bridge, validation, to the execution of your core logic.
    -   Verify correct behavior with valid arguments.
    -   Verify appropriate error handling for missing or invalid arguments.
-   **End-to-End Testing**:
    -   Manually test the new tool with an LLM (if feasible in your development environment) to ensure the LLM understands the prompt (from Step 2) and uses the tool correctly in various scenarios.

### 9. Documentation

Document your new tool.

-   **Developer Documentation**:
    -   Update any relevant internal developer documentation, architectural diagrams, or READMEs if the new tool introduces significant changes or new patterns.
    -   Comment your code clearly.
-   **LLM-Facing Documentation**:
    -   The prompt file created in Step 2 is the primary documentation for the LLM. Ensure it is comprehensive, clear, accurate, and provides helpful examples.

By following these steps, you can systematically add new tool operations to the extension, ensuring they are well-integrated, robust, and understandable to both developers and the LLM.