const esbuild = require("esbuild")
const fs = require("fs")
const path = require("path")

const production = process.argv.includes("--production")
const watch = process.argv.includes("--watch")

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: "esbuild-problem-matcher",

	setup(build) {
		build.onStart(() => {
			console.log("[watch] build started")
		})
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`)
				console.error(`    ${location.file}:${location.line}:${location.column}:`)
			})
			console.log("[watch] build finished")
		})
	},
}

const copyWasmFiles = {
	name: "copy-wasm-files",
	setup(build) {
		build.onEnd(() => {
			const nodeModulesDir = path.join(__dirname, "node_modules")
			const distDir = path.join(__dirname, "dist")

			// tiktoken WASM file
			fs.copyFileSync(
				path.join(nodeModulesDir, "tiktoken", "tiktoken_bg.wasm"),
				path.join(distDir, "tiktoken_bg.wasm"),
			)

			// Main tree-sitter WASM file
			fs.copyFileSync(
				path.join(nodeModulesDir, "web-tree-sitter", "tree-sitter.wasm"),
				path.join(distDir, "tree-sitter.wasm"),
			)

			// Copy language-specific WASM files
			const languageWasmDir = path.join(__dirname, "node_modules", "tree-sitter-wasms", "out")

			// Dynamically read all WASM files from the directory instead of using a hardcoded list
			if (fs.existsSync(languageWasmDir)) {
				const wasmFiles = fs.readdirSync(languageWasmDir).filter((file) => file.endsWith(".wasm"))

				console.log(`Copying ${wasmFiles.length} tree-sitter WASM files to dist directory`)

				wasmFiles.forEach((filename) => {
					fs.copyFileSync(path.join(languageWasmDir, filename), path.join(distDir, filename))
				})
			} else {
				console.warn(`Tree-sitter WASM directory not found: ${languageWasmDir}`)
			}
		})
	},
}

// Simple function to copy locale files
function copyLocaleFiles() {
	const srcDir = path.join(__dirname, "src", "i18n", "locales")
	const destDir = path.join(__dirname, "dist", "i18n", "locales")
	const outDir = path.join(__dirname, "out", "i18n", "locales")

	// Ensure source directory exists before proceeding
	if (!fs.existsSync(srcDir)) {
		console.warn(`Source locales directory does not exist: ${srcDir}`)
		return // Exit early if source directory doesn't exist
	}

	// Create destination directories
	fs.mkdirSync(destDir, { recursive: true })
	try {
		fs.mkdirSync(outDir, { recursive: true })
	} catch (e) {}

	// Function to copy directory recursively
	function copyDir(src, dest) {
		const entries = fs.readdirSync(src, { withFileTypes: true })

		for (const entry of entries) {
			const srcPath = path.join(src, entry.name)
			const destPath = path.join(dest, entry.name)

			if (entry.isDirectory()) {
				// Create directory and copy contents
				fs.mkdirSync(destPath, { recursive: true })
				copyDir(srcPath, destPath)
			} else {
				// Copy the file
				fs.copyFileSync(srcPath, destPath)
			}
		}
	}

	// Copy files to dist directory
	copyDir(srcDir, destDir)
	console.log("Copied locale files to dist/i18n/locales")

	// Copy to out directory for debugging
	try {
		copyDir(srcDir, outDir)
		console.log("Copied locale files to out/i18n/locales")
	} catch (e) {
		console.warn("Could not copy to out directory:", e.message)
	}
}

// Set up file watcher if in watch mode
function setupLocaleWatcher() {
	if (!watch) return

	const localesDir = path.join(__dirname, "src", "i18n", "locales")

	// Ensure the locales directory exists before setting up watcher
	if (!fs.existsSync(localesDir)) {
		console.warn(`Cannot set up watcher: Source locales directory does not exist: ${localesDir}`)
		return
	}

	console.log(`Setting up watcher for locale files in ${localesDir}`)

	// Use a debounce mechanism
	let debounceTimer = null
	const debouncedCopy = () => {
		if (debounceTimer) clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => {
			console.log("Locale files changed, copying...")
			copyLocaleFiles()
		}, 300) // Wait 300ms after last change before copying
	}

	// Watch the locales directory
	try {
		fs.watch(localesDir, { recursive: true }, (eventType, filename) => {
			if (filename && filename.endsWith(".json")) {
				console.log(`Locale file ${filename} changed, triggering copy...`)
				debouncedCopy()
			}
		})
		console.log("Watcher for locale files is set up")
	} catch (error) {
		console.error(`Error setting up watcher for ${localesDir}:`, error.message)
	}
}

const copyLocalesFiles = {
	name: "copy-locales-files",
	setup(build) {
		build.onEnd(() => {
			copyLocaleFiles()
		})
	},
}

// Function to copy debug helper files
function copyDebugHelperFiles() {
	const srcDir = path.join(__dirname, "src", "zentara_debug", "src", "debug_helper")
	const destDirDist = path.join(__dirname, "dist", "debug_helper")
	const destDirOut = path.join(__dirname, "out", "debug_helper")

	if (!fs.existsSync(srcDir)) {
		console.warn(`Source debug_helper directory does not exist: ${srcDir}`)
		return
	}

	fs.mkdirSync(destDirDist, { recursive: true })
	fs.mkdirSync(destDirOut, { recursive: true })
	// Ensure out/__init__.py exists to make 'out' a Python package
	const outRootDir = path.join(__dirname, "out")
	try {
		// Ensure the root 'out' directory itself exists if not already created by mkdirSync for destDirOut
		if (!fs.existsSync(outRootDir)) {
			fs.mkdirSync(outRootDir, { recursive: true })
			console.log("Created root 'out' directory as it did not exist.")
		}
		const initPyPathOut = path.join(outRootDir, "__init__.py")
		if (!fs.existsSync(initPyPathOut)) {
			fs.writeFileSync(initPyPathOut, "# Automatically generated by esbuild.js to make 'out' a package\n")
			console.log("Created out/__init__.py")
		}
	} catch (e) {
		console.warn("Could not create out/__init__.py:", e.message)
	}

	function copyDir(src, dest) {
		const entries = fs.readdirSync(src, { withFileTypes: true })
		for (const entry of entries) {
			const srcPath = path.join(src, entry.name)
			const destPath = path.join(dest, entry.name)
			if (entry.isDirectory()) {
				fs.mkdirSync(destPath, { recursive: true })
				copyDir(srcPath, destPath)
			} else {
				fs.copyFileSync(srcPath, destPath)
			}
		}
	}

	copyDir(srcDir, destDirDist)
	console.log("Copied debug_helper files to dist/debug_helper")

	copyDir(srcDir, destDirOut)
	console.log("Copied debug_helper files to out/debug_helper")
}

// Set up file watcher for debug helper files if in watch mode
function setupDebugHelperWatcher() {
	if (!watch) return

	const debugHelperDir = path.join(__dirname, "src", "zentara_debug", "src", "debug_helper")

	if (!fs.existsSync(debugHelperDir)) {
		console.warn(`Cannot set up watcher: Source debug_helper directory does not exist: ${debugHelperDir}`)
		return
	}

	console.log(`Setting up watcher for debug_helper files in ${debugHelperDir}`)

	let debounceTimer = null
	const debouncedCopy = () => {
		if (debounceTimer) clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => {
			console.log("Debug helper files changed, copying...")
			copyDebugHelperFiles()
		}, 300)
	}

	try {
		fs.watch(debugHelperDir, { recursive: true }, (eventType, filename) => {
			if (filename) {
				// Copy on any change in the directory
				console.log(`Debug helper file ${filename} changed, triggering copy...`)
				debouncedCopy()
			}
		})
		console.log("Watcher for debug_helper files is set up")
	} catch (error) {
		console.error(`Error setting up watcher for ${debugHelperDir}:`, error.message)
	}
}

const copyDebugHelperPlugin = {
	name: "copy-debug-helper-plugin",
	setup(build) {
		build.onEnd(() => {
			copyDebugHelperFiles()
		})
	},
}

const extensionConfig = {
	bundle: true,
	minify: production,
	sourcemap: !production,
	logLevel: "silent",
	plugins: [
		copyWasmFiles,
		copyLocalesFiles,
		copyDebugHelperPlugin,
		/* add to the end of plugins array */
		esbuildProblemMatcherPlugin,
		{
			name: "alias-plugin",
			setup(build) {
				build.onResolve({ filter: /^pkce-challenge$/ }, (_args) => {
					return { path: require.resolve("pkce-challenge/dist/index.browser.js") }
				})
			},
		},
	],
	entryPoints: ["src/extension.ts"],
	format: "cjs",
	sourcesContent: false,
	platform: "node",
	outfile: "dist/extension.js",
	external: ["vscode"],
}

const workerConfig = {
	bundle: true,
	minify: production,
	sourcemap: !production,
	logLevel: "silent",
	entryPoints: ["src/workers/countTokens.ts"],
	format: "cjs",
	sourcesContent: false,
	platform: "node",
	outdir: "dist/workers",
}

async function main() {
	const [extensionCtx, workerCtx] = await Promise.all([
		esbuild.context(extensionConfig),
		esbuild.context(workerConfig),
	])

	if (watch) {
		await Promise.all([extensionCtx.watch(), workerCtx.watch()])
		copyLocaleFiles()
		setupLocaleWatcher()
		copyDebugHelperFiles() // Initial copy for watch mode
		setupDebugHelperWatcher()
	} else {
		await Promise.all([extensionCtx.rebuild(), workerCtx.rebuild()])
		await Promise.all([extensionCtx.dispose(), workerCtx.dispose()])
	}
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})

module.exports = {
	copyDebugHelperFiles,
	copyLocaleFiles,
	// Potentially other functions if they are intended to be reusable
	// For now, only exporting what's immediately needed or similar in nature
}
