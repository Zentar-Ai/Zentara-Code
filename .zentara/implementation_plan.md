# Debug Tool Parameter Conversion: JSON in XML Implementation Plan

This plan outlines the steps to convert the parameter passing mechanism for debug tools. Instead of parameters being individual XML child tags, they will be passed as a single JSON object string, which is the text content of the main operation tag (e.g., using a format like `"\"<specific_debug_operation_tag>{ /* JSON string here */ }</specific_debug_operation_tag>\""`).

## Phase 1: Core Logic Modification & Initial Setup

- [ ] **Task 1: Analyze `DebugToolUse` Interface and Parameter Access**
    - Investigate how the raw string content of a specific debug operation tag (e.g., the content of what would be `"\"<debug_launch>\""`) will be accessible within the `debugTool.ts` function, given the existing `DebugToolUse` structure (`block.params`).
    - Determine if `block.params` will directly contain the JSON string (e.g., as a special key like `_text` or `json_payload`) or if another property of the `block` object needs to be accessed. This depends on the upstream XML parsing that populates `DebugToolUse`.

- [ ] **Task 2: Modify `debugTool.ts` Parameter Handling**
    - [ ] Based on Task 1, implement logic to retrieve the raw JSON string from the appropriate source.
    - [ ] Replace the old logic for constructing/parsing XML parameters (previously `argsXml`) with `JSON.parse()` for this retrieved JSON string.
    - [ ] Populate `operationArgs` with the object resulting from `JSON.parse()`.
    - [ ] Implement robust error handling for `JSON.parse()` (e.g., for malformed JSON).
    - [ ] Update the approval prompt content generation in `debugTool.ts` (currently `JSON.stringify(otherParams)`) to display the new JSON arguments, either by stringifying the parsed JSON object or showing the raw JSON string.

- [ ] **Task 3: Review and Adapt `debugToolValidation.ts`**
    - [ ] Confirm that `validateOperationArgs` in [`debugToolValidation.ts`](src/core/tools/debugToolValidation.ts:1) correctly processes `operationArgs` when it's derived directly from a parsed JSON object. (It's likely to be compatible as it already expects an object).
    - [ ] Review transformations within `validateOperationArgs` (e.g., `ensureArray` for launch `arg`). If the new JSON format directly provides arrays where appropriate (e.g., `"\"args\"": ["arg1", "arg2"]` within the JSON), some transformations might be simplified or become redundant.
    - [ ] Adjust validation logic if the structure of `operationArgs` (derived from JSON) differs significantly from what was derived from the flatter XML structure.

## Phase 2: Documentation & Prompt Updates

- [ ] **Task 4: Update General Debug Tool Documentation**
    - [ ] Modify [`src/core/prompts/tools/debug.ts`](src/core/prompts/tools/debug.ts:1) to reflect the new JSON-based parameter format.
    - [ ] All examples must use the new format, presented as quoted strings. For instance, an example for a 'debug_launch' operation should be a string like: `"\"<debug_launch> { \\\"program\\\": \\\"path/to/file.py\\\", \\\"mode\\\": \\\"pytest\\\" } </debug_launch>\""`.
    - [ ] Remove or textually describe (without direct XML examples) the old parameter passing method.

- [ ] **Task 5: Update Individual Debug Operation Prompts/Docs**
    - [ ] Review files in `src/core/prompts/tools/debug_operations/` (e.g., `launch.ts`) and update any format examples to the new JSON-in-XML style, ensuring examples are quoted strings as described above.

- [ ] **Task 6: Update LLM Prompt Templates**
    - [ ] Modify all system prompts and few-shot examples that instruct the LLM on how to call debug tools.
    - [ ] Clearly demonstrate the new required format, for example: `"\"<debug_operation_name_goes_here>{ \\\"param1\\\": \\\"value1\\\", ... }</debug_operation_name_goes_here>\""`.

## Phase 3: Testing & Refinement

- [ ] **Task 7: Comprehensive Testing**
    - [ ] Test all debug operations with various valid parameter combinations in the new JSON format.
    - [ ] Test with missing required parameters within the JSON.
    - [ ] Test with malformed/invalid JSON to ensure error handling is robust and provides clear feedback.
    - [ ] Test operations that take no arguments (e.g., using an empty JSON object `{}` as content like in `"\"<debug_quit>{}</debug_quit>\""`, or no content if permitted by the parser for parameter-less calls like in `"\"<debug_quit></debug_quit>\""`).
    - [ ] Test operations with optional arguments.

- [ ] **Task 8: Backward Compatibility Strategy**
    - [ ] **Decision:** Determine if backward compatibility with the old XML child tag format is necessary for a transition period.
        - If **yes**:
            - [ ] Design and implement logic in `debugTool.ts` to detect the parameter format (JSON string content vs. multiple child-tag-derived `otherParams`).
            - [ ] Parse accordingly, ensuring both paths lead to a correctly structured `operationArgs`.
        - If **no**:
            - [ ] Clearly document this as a breaking change for any direct users or integrations.

- [ ] **Task 9: Code Review and Merge**
    - [ ] Conduct a thorough code review of all changes.
    - [ ] Merge the implemented changes into the main codebase.

## Phase 4: Post-Implementation

- [ ] **Task 10: Monitoring and Iteration**
    - [ ] After deployment, monitor the performance and error rates of LLM-generated debug tool calls.
    - [ ] Collect feedback and iterate on prompts or parsing logic if new issues arise with the JSON format.