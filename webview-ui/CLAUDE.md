# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the webview UI component of Zentara Code, an AI-powered VS Code extension that combines AI code generation with AI debugging capabilities. This React-based UI runs within VS Code's webview context and communicates with the extension host.

## Key Commands

### Development
```bash
pnpm dev          # Start Vite dev server (http://localhost:5173)
pnpm build        # Build production bundle
pnpm clean        # Clean build artifacts
```

### Code Quality
```bash
pnpm lint         # Run ESLint (must have zero warnings)
pnpm check-types  # Run TypeScript type checking
pnpm format       # Format code with Prettier
pnpm test         # Run tests with Vitest
```

## Architecture Overview

### Technology Stack
- **React 18** with TypeScript (strict mode)
- **Vite 6** for fast builds and HMR
- **Tailwind CSS 4** with Radix UI components
- **i18next** for internationalization (17+ languages)
- **TanStack Query** for data fetching
- **Vitest** with React Testing Library

### Directory Structure
```
src/
├── components/       # Shared UI components
│   ├── chat/        # Chat interface components
│   ├── history/     # Conversation history
│   ├── marketplace/ # Extension marketplace
│   ├── settings/    # Settings interface
│   └── ui/          # Base UI components
├── context/         # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── locales/         # i18n translation files
└── utils/           # Type definitions and utilities
```

### Import Path Aliases
- `@/` → `src/`
- `@src/` → `../src/` (extension source)
- `@zentara/` → `../packages/zentara-` 
- `@zentara-code/` → `../packages/zentara-code-`

### State Management
- Uses React Context API with custom providers
- Key contexts: ExtensionState, Config, ChatContext
- Communication with VS Code extension via `vscode.postMessage` API

### Testing Guidelines
- Test files: `*.spec.ts` or `*.spec.tsx`
- Use Vitest with jsdom environment
- Mock VS Code API with `__mocks__/vscode.ts`
- Focus on component behavior over implementation

### Build Process
- Vite builds to `../src/webview-ui/` for production
- Separate build outputs for main and nightly versions
- Source maps enabled for debugging
- Assets inlined or copied to output

### VS Code Integration
- Uses `@vscode/webview-ui-toolkit` for native VS Code UI elements
- Communicates with extension host via message passing
- Supports VS Code themes and color schemes
- Handles VS Code state persistence

### Component Patterns
- Feature-based organization (chat, settings, history, etc.)
- Compound components for complex UI (e.g., ChatView)
- Custom hooks for business logic
- Extensive use of Radix UI primitives with Tailwind styling

### i18n Implementation
- All user-facing strings use i18n keys
- Translations in `src/locales/[lang].json`
- Language selection synced with VS Code settings
- Support for RTL languages

### Development Notes
- Hot Module Replacement (HMR) enabled in dev mode
- TypeScript strict mode enforced
- ESLint must pass with zero warnings
- Prettier formatting required
- Extensive mocking for tests due to VS Code API dependencies