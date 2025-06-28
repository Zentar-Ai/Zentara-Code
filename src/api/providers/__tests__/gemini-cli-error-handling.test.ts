import { describe, it, expect, beforeEach, vi } from "vitest"
import { GCliProvider } from "../g-cli"
import { GCliOAuthManagerV2 } from "../g-cli/oauth-manager-v2"
import { GCliApiClient } from "../g-cli/api-client"

// Mock the dependencies
vi.mock("../g-cli/oauth-manager-v2")
vi.mock("../g-cli/api-client")

describe("GCliProvider Error Handling", () => {
	let provider: GCliProvider
	let mockOAuthManager: any
	let mockApiClient: any

	beforeEach(() => {
		// Create mocked instances
		mockOAuthManager = {
			getAccessToken: vi.fn(),
			getProjectId: vi.fn(),
		} as any

		mockApiClient = {
			updateAccessToken: vi.fn(),
			updateProjectId: vi.fn(),
			streamGenerateContent: vi.fn(),
			parseSSEStream: vi.fn(),
			extractTextContent: vi.fn(),
			extractUsageMetadata: vi.fn(),
		} as any

		// Mock the constructors
		vi.mocked(GCliOAuthManagerV2).mockImplementation(() => mockOAuthManager)
		vi.mocked(GCliApiClient).mockImplementation(() => mockApiClient)

		provider = new GCliProvider({
			gCliClientId: "test-client-id",
			gCliClientSecret: "test-client-secret",
			gCliCredentialsPath: "test-path",
			gCliProjectId: "test-project",
			apiModelId: "gemini-2.5-pro",
		})
	})

	describe("createMessage error handling", () => {
		it("should yield error message for OAuth token errors", async () => {
			const originalError = new Error("OAuth token expired")
			mockOAuthManager.getAccessToken.mockRejectedValue(originalError)

			const messageGenerator = provider.createMessage("test prompt", [])

			const result = await messageGenerator.next()
			expect(result.done).toBe(false)
			expect(result.value).toEqual({
				type: "text",
				text: "❌ **Error**: OAuth token expired"
			})
		})

		it("should yield error message for string errors", async () => {
			const originalError = "String error"
			mockOAuthManager.getAccessToken.mockRejectedValue(originalError)

			const messageGenerator = provider.createMessage("test prompt", [])

			const result = await messageGenerator.next()
			expect(result.done).toBe(false)
			expect(result.value).toEqual({
				type: "text",
				text: "❌ **Error**: String error"
			})
		})

		it("should yield user-friendly error message for authentication errors", async () => {
			mockOAuthManager.getAccessToken.mockResolvedValue("test-token")
			mockOAuthManager.getProjectId.mockResolvedValue("test-project")
			
			const apiError = new Error("API request failed: 401 Unauthorized")
			mockApiClient.streamGenerateContent.mockRejectedValue(apiError)

			const messageGenerator = provider.createMessage("test prompt", [])

			const result = await messageGenerator.next()
			expect(result.done).toBe(false)
			expect(result.value).toEqual({
				type: "text",
				text: "❌ **Error**: Authentication failed. Please check your Gemini CLI credentials and ensure you're logged in."
			})
		})
	})

	describe("createMessageStream error handling", () => {
		it("should wrap Error instances with descriptive message", async () => {
			const originalError = new Error("Network timeout")
			mockOAuthManager.getAccessToken.mockRejectedValue(originalError)

			const messageGenerator = provider.createMessageStream({
				model: "gemini-2.5-pro",
				messages: [{ role: "user", content: [{ type: "text", text: "test" }] }],
			})

			await expect(messageGenerator.next()).rejects.toThrow("Gemini CLI completion error: Network timeout")
		})

		it("should preserve non-Error objects", async () => {
			const originalError = { code: 500, message: "Internal server error" }
			mockOAuthManager.getAccessToken.mockRejectedValue(originalError)

			const messageGenerator = provider.createMessageStream({
				model: "gemini-2.5-pro",
				messages: [{ role: "user", content: [{ type: "text", text: "test" }] }],
			})

			await expect(messageGenerator.next()).rejects.toBe(originalError)
		})
	})

	describe("completePrompt error handling", () => {
		it("should throw error with descriptive message for rate limit", async () => {
			const originalError = new Error("API rate limit exceeded")
			mockOAuthManager.getAccessToken.mockRejectedValue(originalError)

			await expect(provider.completePrompt("test prompt")).rejects.toThrow("Gemini CLI completion error: API rate limit exceeded")
		})

		it("should throw error with descriptive message for numeric errors", async () => {
			const originalError = 404
			mockOAuthManager.getAccessToken.mockRejectedValue(originalError)

			await expect(provider.completePrompt("test prompt")).rejects.toThrow("Gemini CLI completion error: 404")
		})

		it("should handle errors with gemini-2.5-flash model", async () => {
			const flashProvider = new GCliProvider({
				gCliClientId: "test-client-id",
				gCliClientSecret: "test-client-secret",
				gCliCredentialsPath: "test-path",
				gCliProjectId: "test-project",
				apiModelId: "gemini-2.5-flash",
			})

			const originalError = new Error("Model-specific error")
			mockOAuthManager.getAccessToken.mockRejectedValue(originalError)

			await expect(flashProvider.completePrompt("test prompt")).rejects.toThrow("Gemini CLI completion error: Model-specific error")
		})
	})
})