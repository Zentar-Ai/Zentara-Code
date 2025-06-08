# Monorepo Guide

zentara Code has transitioned to a monorepo powered by [PNPM workspaces](https://pnpm.io/workspaces) and [Turborepo](https://turborepo.com).

When you first pull down the monorepo changes from git you'll need to re-install all packages using pnpm. You can install pnpm using [these](https://pnpm.io/installation) instructions. If you're on MacOS the easiest option is to use Homebrew:

```sh
brew install pnpm
```

Once pnpm is installed you should wipe out your existing node_modules directories for a fresh start:

```sh
# This is optional, but recommended.
find . -name node_modules | xargs rm -rvf
```

And then install your packages:

```sh
pnpm install
```

If things are in good working order then you should be able to build a vsix and install it in VSCode:

```sh
pnpm vsix -- --out ../bin/zentara-code-main.vsix && \
  code --install-extension bin/zentara-code-main.vsix
```

To fully stress the monorepo setup, run the following:

```sh
pnpm clean && pnpm lint
pnpm clean && pnpm check-types
pnpm clean && pnpm test
pnpm clean && pnpm build
pnpm clean && pnpm bundle
pnpm clean && pnpm bundle:nightly

pnpm clean && pnpm npx turbo watch:bundle
pnpm clean && pnpm npx turbo watch:tsc

pnpm --filter @zentara-code/vscode-e2e test:ci

pnpm clean && \
  pnpm vsix -- --out ../bin/zentara-code.vsix && \
  code --install-extension bin/zentara-code.vsix

pnpm clean && \
  pnpm vsix:nightly -- --out ../../../bin/zentara-code-nightly.vsix && \
  code --install-extension bin/zentara-code-nightly.vsix
```

### Turborepo

Note that this excludes the `build` task for next.js apps (@zentara-code/web-\*).

Tasks: `build` -> `bundle` -> `vsix`

build:

- `@zentara-code/build` [input: src, package.json, tsconfig.json | output: dist]
- `@zentara-code/types` [input: src, package.json, tsconfig.json, tsup.config.ts | output: dist]
- `@zentara-code/webview-ui` [input: src, package.json, tsconfig.json, vite.config.ts | output: ../src/webview-ui]

bundle:
- `zentara-code` [input: * | output: dist]


vsix:

- `zentara-code` [input: dist | output: bin]
