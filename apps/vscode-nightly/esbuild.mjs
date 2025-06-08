import * as esbuild from "esbuild"
import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"

import { getGitSha, copyPaths, copyLocales, copyWasms, generatePackageJson } from "@zentara-code/build"
// import pkg from '../../esbuild.js'; // Removed problematic import
// const { copyDebugHelperFiles } = pkg; // Removed problematic import

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function copyDebugHelperFiles(baseBuildDir, monorepoSrcDir) {
	const helperSourceDir = path.resolve(monorepoSrcDir, "zentara_debug", "src", "debug_helper");
	// Destination relative to the nightly build's output structure
	const helperDistDestDir = path.resolve(baseBuildDir, "dist", "debug_helper");
	const helperOutDestDir = path.resolve(baseBuildDir, "out", "debug_helper"); // As seen in logs

	if (!fs.existsSync(helperSourceDir)) {
		console.warn(`[copyDebugHelperFiles] Source directory does not exist: ${helperSourceDir}`);
		return;
	}

	const filesToCopy = fs.readdirSync(helperSourceDir).filter(file => file.endsWith(".py"));
	let copiedToDist = 0;
	let copiedToOut = 0;

	// Copy to dist/debug_helper
	if (!fs.existsSync(helperDistDestDir)) {
		fs.mkdirSync(helperDistDestDir, { recursive: true });
	}
	filesToCopy.forEach(file => {
		fs.copyFileSync(path.join(helperSourceDir, file), path.join(helperDistDestDir, file));
		copiedToDist++;
	});
	if (copiedToDist > 0) {
		console.log(`[copyDebugHelperFiles] Copied ${copiedToDist} debug helper files to ${helperDistDestDir}`);
	}

	// Copy to out/debug_helper
	if (!fs.existsSync(helperOutDestDir)) {
		fs.mkdirSync(helperOutDestDir, { recursive: true });
	}
	filesToCopy.forEach(file => {
		fs.copyFileSync(path.join(helperSourceDir, file), path.join(helperOutDestDir, file));
		copiedToOut++;
	});
	if (copiedToOut > 0) {
		console.log(`[copyDebugHelperFiles] Copied ${copiedToOut} debug helper files to ${helperOutDestDir}`);
	}

    // Create __init__.py in out/debug_helper if it doesn't exist (based on logs)
    const initPyPath = path.join(helperOutDestDir, "__init__.py");
    if (!fs.existsSync(initPyPath) && copiedToOut > 0) { // Only if python files were copied
        fs.writeFileSync(initPyPath, "# This file makes Python treat the directory as a package.\n");
        console.log(`[copyDebugHelperFiles] Created ${initPyPath}`);
    }
     // Create __init__.py in dist/debug_helper
    const initPyDistPath = path.join(helperDistDestDir, "__init__.py");
    if (!fs.existsSync(initPyDistPath) && copiedToDist > 0) {
        fs.writeFileSync(initPyDistPath, "# This file makes Python treat the directory as a package.\n");
        console.log(`[copyDebugHelperFiles] Created ${initPyDistPath}`);
    }
}

async function main() {
	const name = "extension-nightly"
	const production = process.argv.includes("--production")
	const minify = production
	const sourcemap = !production

	const overrideJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.nightly.json"), "utf8"))
	console.log(`[${name}] name: ${overrideJson.name}`)
	console.log(`[${name}] version: ${overrideJson.version}`)

	const gitSha = getGitSha()
	console.log(`[${name}] gitSha: ${gitSha}`)

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
		absWorkingDir: path.resolve(__dirname, "..", ".."), // Set monorepo root as working directory
		define: {
			"process.env.PKG_NAME": '"zentara-code-nightly"',
			"process.env.PKG_VERSION": `"${overrideJson.version}"`,
			"process.env.PKG_OUTPUT_CHANNEL": '"zentara-code-Nightly"',
			...(gitSha ? { "process.env.PKG_SHA": `"${gitSha}"` } : {}),
		},
	}

	const srcDir = path.join(__dirname, "..", "..", "src")
	const buildDir = path.join(__dirname, "build")
	const distDir = path.join(buildDir, "dist")

	console.log(`[${name}] srcDir: ${srcDir}`)
	console.log(`[${name}] buildDir: ${buildDir}`)
	console.log(`[${name}] distDir: ${distDir}`)

	if (fs.existsSync(distDir)) {
		console.log(`[${name}] Cleaning dist directory: ${distDir}`)
		fs.rmSync(distDir, { recursive: true, force: true })
	}

	/**
	 * @type {import('esbuild').Plugin[]}
	 */
	const plugins = [
		{
			name: "copyPaths",
			setup(build) {
				build.onEnd(() => {
					copyPaths(
						[
							["../README.md", "README.md"],
							["../CHANGELOG.md", "CHANGELOG.md"],
							["../LICENSE", "LICENSE"],
							["../.env", ".env", { optional: true }],
							[".vscodeignore", ".vscodeignore"],
							["assets", "assets"],
							["integrations", "integrations"],
							["node_modules/vscode-material-icons/generated", "assets/vscode-material-icons"],
							["../webview-ui/audio", "webview-ui/audio"],
						],
						srcDir,
						buildDir,
					)
				})
			},
		},
		{
			name: "generatePackageJson",
			setup(build) {
				build.onEnd(() => {
					const packageJson = JSON.parse(fs.readFileSync(path.join(srcDir, "package.json"), "utf8"))

					const generatedPackageJson = generatePackageJson({
						packageJson,
						overrideJson,
						substitution: ["zentara-code", "zentara-code-nightly"],
					})

					fs.writeFileSync(path.join(buildDir, "package.json"), JSON.stringify(generatedPackageJson, null, 2))
					console.log(`[generatePackageJson] Generated package.json`)

					let count = 0

					fs.readdirSync(path.join(srcDir)).forEach((file) => {
						if (file.startsWith("package.nls")) {
							fs.copyFileSync(path.join(srcDir, file), path.join(buildDir, file))
							count++
						}
					})

					console.log(`[generatePackageJson] Copied ${count} package.nls*.json files to ${buildDir}`)

					const nlsPkg = JSON.parse(fs.readFileSync(path.join(srcDir, "package.nls.json"), "utf8"))

					const nlsNightlyPkg = JSON.parse(
						fs.readFileSync(path.join(__dirname, "package.nls.nightly.json"), "utf8"),
					)

					fs.writeFileSync(
						path.join(buildDir, "package.nls.json"),
						JSON.stringify({ ...nlsPkg, ...nlsNightlyPkg }, null, 2),
					)

					console.log(`[generatePackageJson] Generated package.nls.json`)
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
	]

	/**
	 * @type {import('esbuild').BuildOptions}
	 */
	const extensionBuildOptions = {
		...buildOptions,
		plugins,
		entryPoints: [path.resolve(buildOptions.absWorkingDir, "src/extension.ts")],
		outfile: path.join(distDir, "extension.js"),
		external: ["vscode"],
	}

	/**
		* @type {import('esbuild').BuildOptions}
		*/
	const workerBuildOptions = {
		...buildOptions,
		entryPoints: [path.resolve(buildOptions.absWorkingDir, "src/workers/countTokens.ts")],
		outdir: path.join(distDir, "workers"),
	}

	const [extensionBuildContext, workerBuildContext] = await Promise.all([
		esbuild.context(extensionBuildOptions),
		esbuild.context(workerBuildOptions),
	])

	await Promise.all([
		extensionBuildContext.rebuild(),
		extensionBuildContext.dispose(),

		workerBuildContext.rebuild(),
		workerBuildContext.dispose(),
	])
	copyDebugHelperFiles(buildDir, srcDir) // Pass correct base directories
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})
