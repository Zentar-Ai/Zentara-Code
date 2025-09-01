import * as esbuild from "esbuild"
import fs from "fs" // Changed to default import
import path from "path" // Changed to default import
import { rimrafSync } from "rimraf" // Added rimraf import
import { fileURLToPath } from "url"
import process from "node:process"
import * as console from "node:console"

import { copyPaths, copyWasms, copyLocales, setupLocaleWatcher } from "@roo-code/build"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
	const name = "extension"
	const production = process.argv.includes("--production")
	const watch = process.argv.includes("--watch")
	const minify = production
	const sourcemap = true // Always generate source maps for error handling

	/**
	 * @type {import('esbuild').BuildOptions}
	 */
	const buildOptions = {
		bundle: true,
		minify,
		sourcemap,
		logLevel: "silent",
		format: "cjs",
		sourcesContent: false,
		platform: "node",
	}

	const srcDir = __dirname
	const buildDir = __dirname
	const distDir = path.join(buildDir, "dist")

	if (fs.existsSync(distDir)) {
		console.log(`[${name}] Cleaning dist directory: ${distDir}`)
		rimrafSync(distDir) // Use rimrafSync
	}

	/**
	 * @type {import('esbuild').Plugin[]}
	 */
	const plugins = [
		{
			name: "copyFiles",
			setup(build) {
				build.onEnd(() => {
					copyPaths(
						[
							["../README.md", "README.md"],
							["../CHANGELOG.md", "CHANGELOG.md"],
							["../LICENSE", "LICENSE"],
							["../.env", ".env", { optional: true }],
							["node_modules/vscode-material-icons/generated", "assets/vscode-material-icons"],
							["roo_debug/src/debug_helper", "dist/debug_helper"],
							["../webview-ui/audio", "webview-ui/audio"],
						],
						srcDir,
						buildDir,
					)
				})
			},
		},
		{
			name: "copyWasms",
			setup(build) {
				build.onEnd(() => copyWasms(srcDir, distDir))
			},
		},
		{
			name: "copyLocales",
			setup(build) {
				build.onEnd(() => copyLocales(srcDir, distDir))
			},
		},
		{
			name: "esbuild-problem-matcher",
			setup(build) {
				build.onStart(() => console.log("[esbuild-problem-matcher#onStart]"))
				build.onEnd((result) => {
					result.errors.forEach(({ text, location }) => {
						console.error(`✘ [ERROR] ${text}`)
						if (location && location.file) {
							console.error(`    ${location.file}:${location.line}:${location.column}:`)
						}
					})

					console.log("[esbuild-problem-matcher#onEnd]")
				})
			},
		},
	]

	/**
	 * @type {import('esbuild').BuildOptions}
	 */
	const extensionConfig = {
		...buildOptions,
		plugins,
		entryPoints: ["extension.ts"],
		outfile: "dist/extension.js",
		external: ["vscode"],
	}

	/**
	 * @type {import('esbuild').BuildOptions}
	 */
	const workerConfig = {
		...buildOptions,
		entryPoints: ["workers/countTokens.ts"],
		outdir: "dist/workers",
	}

	const [extensionCtx, workerCtx] = await Promise.all([
		esbuild.context(extensionConfig),
		esbuild.context(workerConfig),
	])

	if (watch) {
		await Promise.all([extensionCtx.watch(), workerCtx.watch()])
		copyLocales(srcDir, distDir)
		setupLocaleWatcher(srcDir, distDir)
	} else {
		await Promise.all([extensionCtx.rebuild(), workerCtx.rebuild()])
		await Promise.all([extensionCtx.dispose(), workerCtx.dispose()])
	}
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
