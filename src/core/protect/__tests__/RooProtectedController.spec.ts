import path from "path"
import { ZentaraProtectedController } from "../ZentaraProtectedController"

describe("ZentaraProtectedController", () => {
	const TEST_CWD = "/test/workspace"
	let controller: ZentaraProtectedController

	beforeEach(() => {
		controller = new ZentaraProtectedController(TEST_CWD)
	})

	describe("isWriteProtected", () => {
		it("should protect .zentaraignore file", () => {
			expect(controller.isWriteProtected(".zentaraignore")).toBe(true)
		})

		it("should protect files in .zentara directory", () => {
			expect(controller.isWriteProtected(".zentara/config.json")).toBe(true)
			expect(controller.isWriteProtected(".zentara/settings/user.json")).toBe(true)
			expect(controller.isWriteProtected(".zentara/modes/custom.json")).toBe(true)
		})

		it("should protect .zentaraprotected file", () => {
			expect(controller.isWriteProtected(".zentaraprotected")).toBe(true)
		})

		it("should protect .zentaramodes files", () => {
			expect(controller.isWriteProtected(".zentaramodes")).toBe(true)
		})

		it("should protect .zentararules* files", () => {
			expect(controller.isWriteProtected(".zentararules")).toBe(true)
			expect(controller.isWriteProtected(".zentararules.md")).toBe(true)
		})

		it("should protect .clinerules* files", () => {
			expect(controller.isWriteProtected(".clinerules")).toBe(true)
			expect(controller.isWriteProtected(".clinerules.md")).toBe(true)
		})

		it("should not protect other files starting with .zentara", () => {
			expect(controller.isWriteProtected(".zentarasettings")).toBe(false)
			expect(controller.isWriteProtected(".zentaraconfig")).toBe(false)
		})

		it("should not protect regular files", () => {
			expect(controller.isWriteProtected("src/index.ts")).toBe(false)
			expect(controller.isWriteProtected("package.json")).toBe(false)
			expect(controller.isWriteProtected("README.md")).toBe(false)
		})

		it("should not protect files that contain 'zentara' but don't start with .zentara", () => {
			expect(controller.isWriteProtected("src/zentara-utils.ts")).toBe(false)
			expect(controller.isWriteProtected("config/zentara.config.js")).toBe(false)
		})

		it("should handle nested paths correctly", () => {
			expect(controller.isWriteProtected(".zentara/config.json")).toBe(true) // .zentara/** matches at root
			expect(controller.isWriteProtected("nested/.zentaraignore")).toBe(true) // .zentaraignore matches anywhere by default
			expect(controller.isWriteProtected("nested/.zentaramodes")).toBe(true) // .zentaramodes matches anywhere by default
			expect(controller.isWriteProtected("nested/.zentararules.md")).toBe(true) // .zentararules* matches anywhere by default
		})

		it("should handle absolute paths by converting to relative", () => {
			const absolutePath = path.join(TEST_CWD, ".zentaraignore")
			expect(controller.isWriteProtected(absolutePath)).toBe(true)
		})

		it("should handle paths with different separators", () => {
			expect(controller.isWriteProtected(".zentara\\config.json")).toBe(true)
			expect(controller.isWriteProtected(".zentara/config.json")).toBe(true)
		})
	})

	describe("getProtectedFiles", () => {
		it("should return set of protected files from a list", () => {
			const files = ["src/index.ts", ".zentaraignore", "package.json", ".zentara/config.json", "README.md"]

			const protectedFiles = controller.getProtectedFiles(files)

			expect(protectedFiles).toEqual(new Set([".zentaraignore", ".zentara/config.json"]))
		})

		it("should return empty set when no files are protected", () => {
			const files = ["src/index.ts", "package.json", "README.md"]

			const protectedFiles = controller.getProtectedFiles(files)

			expect(protectedFiles).toEqual(new Set())
		})
	})

	describe("annotatePathsWithProtection", () => {
		it("should annotate paths with protection status", () => {
			const files = ["src/index.ts", ".zentaraignore", ".zentara/config.json", "package.json"]

			const annotated = controller.annotatePathsWithProtection(files)

			expect(annotated).toEqual([
				{ path: "src/index.ts", isProtected: false },
				{ path: ".zentaraignore", isProtected: true },
				{ path: ".zentara/config.json", isProtected: true },
				{ path: "package.json", isProtected: false },
			])
		})
	})

	describe("getProtectionMessage", () => {
		it("should return appropriate protection message", () => {
			const message = controller.getProtectionMessage()
			expect(message).toBe("This is a Zentara configuration file and requires approval for modifications")
		})
	})

	describe("getInstructions", () => {
		it("should return formatted instructions about protected files", () => {
			const instructions = controller.getInstructions()

			expect(instructions).toContain("# Protected Files")
			expect(instructions).toContain("write-protected")
			expect(instructions).toContain(".zentaraignore")
			expect(instructions).toContain(".zentara/**")
			expect(instructions).toContain("\u{1F6E1}") // Shield symbol
		})
	})

	describe("getProtectedPatterns", () => {
		it("should return the list of protected patterns", () => {
			const patterns = ZentaraProtectedController.getProtectedPatterns()

			expect(patterns).toEqual([
				".zentaraignore",
				".zentaramodes",
				".zentararules*",
				".clinerules*",
				".zentara/**",
				".zentaraprotected",
			])
		})
	})
})
