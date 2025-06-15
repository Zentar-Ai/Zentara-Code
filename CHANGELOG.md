# Zentara Code Changelog

## [3.20.3] - 2025-06-13

- Resolve diff editor race condition in multi-monitor setups (thanks @daniel-lxs!)
- Add logic to prevent auto-approving edits of configuration files
- Adjust searching and listing files outside of the workspace to respect the auto-approve settings
- Add Indonesian translation support (thanks @chrarnoldus and @daniel-lxs!)
- Fix multi-file diff error handling and UI feedback (thanks @daniel-lxs!)
- Improve prompt history navigation to not interfere with text editing (thanks @daniel-lxs!)
- Fix errant maxReadFileLine default

## [3.20.2] - 2025-06-13

- Limit search_files to only look within the workspace for improved security
- Force tar-fs >=2.1.3 for security vulnerability fix
- Add cache breakpoints for custom vertex models on Unbound (thanks @pugazhendhi-m!)
- Reapply reasoning for bedrock with fix (thanks @daniel-lxs!)
- Sync BatchDiffApproval styling with BatchFilePermission for UI consistency (thanks @samhvw8!)
- Add max height constraint to MCP execution response for better UX (thanks @samhvw8!)
- Prevent MCP 'installed' label from being squeezed #4630 (thanks @daniel-lxs!)
- Allow a lower context condesning threshold (thanks @SECKainersdorfer!)
- Avoid type system duplication for cleaner codebase (thanks @EamonNerbonne!)

## [3.20.1] - 2025-06-12

- Temporarily revert thinking support for Bedrock models
- Improve performance of MCP execution block
- Add indexing status badge to chat view

## [3.20.0] - 2025-06-12

- Add experimental Marketplace for extensions and modes (thanks @Smartsheet-JB-Brown, @elianiva, @monkeyDluffy6017, @NamesMT, @daniel-lxs, Cline, and more!)
- Add experimental multi-file edits (thanks @samhvw8!)
- Move concurrent reads setting to context settings with default of 5
- Improve MCP execution UX (thanks @samhvw8!)
- Add magic variables support for MCPs with `workspaceFolder` injection (thanks @NamesMT!)
- Add prompt history navigation via arrow up/down in prompt field
- Add support for escaping context mentions (thanks @KJ7LNW!)
- Add DeepSeek R1 support to Chutes provider
- Add reasoning budget support to Bedrock models for extended thinking
- Add mermaid diagram support buttons (thanks @qdaxb!)
- Update XAI models and pricing (thanks @edwin-truthsearch-io!)
- Update O3 model pricing
- Add manual OpenAI-compatible format specification and parsing (thanks @dflatline!)
- Add core tools integration tests for comprehensive coverage
- Add JSDoc documentation for ClineAsk and ClineSay types (thanks @hannesrudolph!)
- Populate whenToUse descriptions for built-in modes
- Fix file write tool with early relPath & newContent validation checks (thanks @Ruakij!)
- Fix TaskItem display and copy issues with HTML tags in task messages (thanks @forestyoo!)
- Fix OpenRouter cost calculation with BYOK (thanks @chrarnoldus!)
- Fix terminal busy state reset after manual commands complete
- Fix undefined output on multi-file apply_diff operations (thanks @daniel-lxs!)

## [3.19.7] - 2025-06-11

- Fix McpHub sidebar focus behavior to prevent unwanted focus grabbing
- Disable checkpoint functionality when nested git repositories are detected to prevent conflicts
- Remove unused Storybook components and dependencies to reduce bundle size
- Add data-testid ESLint rule for improved testing standards (thanks @elianiva!)
- Update development dependencies including eslint, knip, @types/node, i18next, fast-xml-parser, and @google/genai
- Improve CI infrastructure with GitHub Actions and Blacksmith runner migrations

## [3.19.6] - 2025-06-09

- Replace explicit caching with implicit caching to reduce latency for Gemini models
- Clarify that the default concurrent file read limit is 15 files (thanks @olearycrew!)
- Fix copy button logic (thanks @samhvw8!)
- Fade buttons on history preview if no interaction in progress (thanks @sachasayan!)
- Allow MCP server refreshing, fix state changes in MCP server management UI view (thanks @taylorwilsdon!)
- Remove unnecessary npx usage in some npm scripts (thanks @user202729!)
- Bug fix for trailing slash error when using LiteLLM provider (thanks @kcwhite!)

## [3.19.5] - 2025-06-05

- Release


