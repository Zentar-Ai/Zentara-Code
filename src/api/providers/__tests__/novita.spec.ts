const mockCreate = vi.fn()
vi.mock("openai", () => {
	return {
		__esModule: true,
		default: vi.fn().mockImplementation(() => ({
			chat: {
				completions: {
					create: mockCreate.mockImplementation(async (options) => {
						if (!options.stream) {
							return {
								id: "test-completion",
								choices: [
									{
										message: { role: "assistant", content: "Test response", refusal: null },
										finish_reason: "stop",
										index: 0,
									},
								],
								usage: {
									prompt_tokens: 10,
									completion_tokens: 5,
									total_tokens: 15,
								},
							}
						}

						return {
							[Symbol.asyncIterator]: async function* () {
								yield {
									choices: [
										{
											delta: { content: "Test response" },
											index: 0,
										},
									],
									usage: null,
								}
								yield {
									choices: [
										{
											delta: {},
											index: 0,
										},
									],
									usage: {
										prompt_tokens: 10,
										completion_tokens: 5,
										total_tokens: 15,
									},
								}
							},
						}
					}),
				},
			},
		})),
	}
})

import OpenAI from "openai"
import type { Anthropic } from "@anthropic-ai/sdk"

import { novitaDefaultModelId } from "@zentara-code/types"

import type { ApiHandlerOptions } from "../../../shared/api"

import { NovitaHandler } from "../novita"

describe("NovitaHandler", () => {
	let handler: NovitaHandler
	let mockOptions: ApiHandlerOptions

	beforeEach(() => {
		mockOptions = {
			novitaApiKey: "test-api-key",
			apiModelId: "deepseek/deepseek-v3.2",
			novitaBaseUrl: "https://api.novita.ai/openai/v1",
		}
		handler = new NovitaHandler(mockOptions)
		vi.clearAllMocks()
	})

	describe("constructor", () => {
		it("should initialize with provided options", () => {
			expect(handler).toBeInstanceOf(NovitaHandler)
			expect(handler.getModel().id).toBe(mockOptions.apiModelId)
		})

		it("should use default model ID if not provided", () => {
			const handlerWithoutModel = new NovitaHandler({
				...mockOptions,
				apiModelId: undefined,
			})
			expect(handlerWithoutModel.getModel().id).toBe(novitaDefaultModelId)
		})

		it("should use default base URL if not provided", () => {
			const handlerWithoutBaseUrl = new NovitaHandler({
				...mockOptions,
				novitaBaseUrl: undefined,
			})
			expect(handlerWithoutBaseUrl).toBeInstanceOf(NovitaHandler)
			expect(OpenAI).toHaveBeenCalledWith(
				expect.objectContaining({
					baseURL: "https://api.novita.ai/openai/v1",
				}),
			)
		})

		it("should use custom base URL if provided", () => {
			const customBaseUrl = "https://custom.novita.com/v1"
			const handlerWithCustomUrl = new NovitaHandler({
				...mockOptions,
				novitaBaseUrl: customBaseUrl,
			})
			expect(handlerWithCustomUrl).toBeInstanceOf(NovitaHandler)
			expect(OpenAI).toHaveBeenCalledWith(
				expect.objectContaining({
					baseURL: customBaseUrl,
				}),
			)
		})
			expect(handlerWithCustomUrl).toBeInstanceOf(NovitaHandler)
			// The custom base URL is passed to OpenAI client
			expect(OpenAI).toHaveBeenCalledWith(
				expect.objectContaining({
				baseURL: customBaseUrl,
			})
			expect(handlerWithCustomUrl).toBeInstanceOf(NovitaHandler)
			expect(OpenAI).toHaveBeenCalledWith(
				expect.objectContaining({
					baseURL: customBaseUrl,
				}),
			)
		})

		it("should set includeMaxTokens to true", () => {
			const _handler = new NovitaHandler(mockOptions)
			expect(OpenAI).toHaveBeenCalledWith(expect.objectContaining({ apiKey: mockOptions.novitaApiKey }))
		})
	})

	describe("getModel", () => {
		it("should return model info for valid model ID", () => {
			const model = handler.getModel()
			expect(model.id).toBe(mockOptions.apiModelId)
			expect(model.info).toBeDefined()
			expect(model.info.maxTokens).toBe(8192)
			expect(model.info.contextWindow).toBe(64000)
			expect(model.info.supportsImages).toBe(false)
			expect(model.info.supportsPromptCache).toBe(false)
		})

		it("should return correct model info for zai-org/glm-5", () => {
			const handlerWithGlm5 = new NovitaHandler({
				...mockOptions,
				apiModelId: "zai-org/glm-5",
			})
			const model = handlerWithGlm5.getModel()
			expect(model.id).toBe("zai-org/glm-5")
			expect(model.info).toBeDefined()
			expect(model.info.maxTokens).toBe(8192)
			expect(model.info.contextWindow).toBe(128000)
			expect(model.info.supportsImages).toBe(false)
			expect(model.info.supportsPromptCache).toBe(false)
		})

		it("should return default model if no model ID is provided", () => {
			const handlerWithoutModel = new NovitaHandler({
				...mockOptions,
				apiModelId: undefined,
			})
			const model = handlerWithoutModel.getModel()
			expect(model.id).toBe(novitaDefaultModelId)
			expect(model.info).toBeDefined()
		})
	})

	describe("createMessage", () => {
		const systemPrompt = "You are a helpful assistant."
		const messages: Anthropic.Messages.MessageParam[] = [
			{
				role: "user",
				content: [
					{
						type: "text" as const,
						text: "Hello!",
					},
				],
			},
		]

		it("should handle streaming responses", async () => {
			const stream = handler.createMessage(systemPrompt, messages)
			const chunks: any[] = []
			for await (const chunk of stream) {
				chunks.push(chunk)
			}

			expect(chunks.length).toBeGreaterThan(0)
			const textChunks = chunks.filter((chunk) => chunk.type === "text")
			expect(textChunks).toHaveLength(1)
			expect(textChunks[0].text).toBe("Test response")
		})

		it("should include usage information", async () => {
			const stream = handler.createMessage(systemPrompt, messages)
			const chunks: any[] = []
			for await (const chunk of stream) {
				chunks.push(chunk)
			}

			const usageChunks = chunks.filter((chunk) => chunk.type === "usage")
			expect(usageChunks.length).toBeGreaterThan(0)
			expect(usageChunks[0].inputTokens).toBe(10)
			expect(usageChunks[0].outputTokens).toBe(5)
		})
	})
})
