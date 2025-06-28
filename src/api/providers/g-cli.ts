import { Anthropic } from "@anthropic-ai/sdk"

import { GCliOAuthManagerV2 } from "./g-cli/oauth-manager-v2"
import { GCliApiClient } from "./g-cli/api-client"
import {
	type ModelInfo,
	type GCliModelId,
	gCliDefaultModelId,
	gCliModels
} from "@zentara-code/types"

import { BaseProvider } from "./base-provider"
import { ApiStream } from "../transform/stream"
import type { ApiHandlerCreateMessageMetadata, SingleCompletionHandler } from "../index"
import { getModelParams } from "../transform/model-params"
import { calculateApiCostAnthropic } from "../../shared/cost"
import { convertAnthropicMessageToGemini } from "../transform/gemini-format"

import type { ApiHandlerOptions } from "../../shared/api"

type GCliHandlerOptions = ApiHandlerOptions

export interface CreateMessageParams {
	model: GCliModelId
	messages: Array<{
		role: "user" | "assistant" | "system"
		content: Array<{
			type: "text" | "image"
			text?: string
			source?: {
				type: "base64"
				media_type: string
				data: string
			}
		}>
	}>
	maxTokens?: number
	temperature?: number
	topP?: number
}

export interface MessageResponse {
	content: Array<{
		type: "text"
		text: string
	}>
	usage?: {
		inputTokens: number
		outputTokens: number
		cacheReadTokens?: number
	}
	stopReason?: string
}

export interface StreamChunk {
	type: "content_block_start" | "content_block_delta" | "content_block_stop" | 
		  "message_start" | "message_delta" | "message_stop"
	index?: number
	delta?: {
		type?: "text_delta"
		text?: string
	}
	content_block?: {
		type: "text"
		text: string
	}
	message?: {
		id: string
		type: "message"
		role: "assistant"
		content: Array<any>
		model: string
		stop_reason?: string
		stop_sequence?: string
		usage?: {
			input_tokens: number
			output_tokens: number
		}
	}
	usage?: {
		input_tokens: number
		output_tokens: number
	}
}

export class GCliProvider extends BaseProvider implements SingleCompletionHandler {
	public readonly options: GCliHandlerOptions
	public readonly oauthManager: GCliOAuthManagerV2
	public readonly apiClient: GCliApiClient

	constructor(options: any) {
		super()
		this.options = options
		this.oauthManager = new GCliOAuthManagerV2({
			clientId: options.gCliClientId,
			clientSecret: options.gCliClientSecret,
			credentialsPath: options.gCliCredentialsPath,
			projectId: options.gCliProjectId
		})
		this.apiClient = new GCliApiClient({
			timeout: options.timeout || 30000
		})
	}

	override getModel() {
		const modelId = this.options.apiModelId
		let id = modelId && modelId in gCliModels ? (modelId as GCliModelId) : gCliDefaultModelId
		const info: ModelInfo = gCliModels[id]
		const params = getModelParams({ format: "gemini", modelId: id, model: info, settings: this.options })

		return { id, info, ...params }
	}

	async *createMessage(
		systemInstruction: string,
		messages: Anthropic.Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
	): ApiStream {
		console.log("[GCliProvider] ========== createMessage called ==========")
		console.log("[GCliProvider] System instruction received:", systemInstruction ? systemInstruction.substring(0, 200) + "..." : "NONE")
		console.log("[GCliProvider] System instruction length:", systemInstruction ? systemInstruction.length : 0)
		console.log("[GCliProvider] Messages count:", messages.length)
		console.log("[GCliProvider] Metadata:", metadata)
		
		const { id: model, info, maxTokens } = this.getModel()
		console.log("[GCliProvider] Using model:", { model, maxTokens })

		try {
			// Get access token
			console.log("[GCliProvider] Getting access token...")
			const accessToken = await this.oauthManager.getAccessToken()
			if (!accessToken) {
				console.error("[GCliProvider] Failed to obtain access token")
				const errorMessage = "Failed to obtain access token. Please check your Gemini CLI authentication."
				yield { type: "text", text: `❌ **Error**: ${errorMessage}` }
				return
			}
			console.log("[GCliProvider] Access token obtained:", accessToken.substring(0, 20) + "...")
			
			console.log("[GCliProvider] Getting project ID...")
			const projectId = await this.oauthManager.getProjectId(accessToken)
			if (!projectId) {
				console.error("[GCliProvider] Failed to obtain project ID")
				const errorMessage = "Failed to obtain project ID. Please check your Gemini CLI configuration."
				yield { type: "text", text: `❌ **Error**: ${errorMessage}` }
				return
			}
			console.log("[GCliProvider] Project ID obtained:", projectId)

			// Update API client with credentials
			console.log("[GCliProvider] Updating API client credentials...")
			this.apiClient.updateAccessToken(accessToken)
			this.apiClient.updateProjectId(projectId)

			// Convert messages to Gemini format
			console.log("[GCliProvider] Converting messages to Gemini format...")
			const geminiMessages = messages.map(msg => convertAnthropicMessageToGemini(msg))
			console.log("[GCliProvider] Converted messages:", geminiMessages.length)

			// Make streaming API request with system instruction
			console.log("[GCliProvider] Making streaming API request with system instruction...")
			console.log("[GCliProvider] System instruction being passed:", systemInstruction ? "YES" : "NO")
			const response = await this.apiClient.streamGenerateContent({
				model,
				messages: geminiMessages,
				maxTokens: this.options.modelMaxTokens ?? maxTokens,
				temperature: this.options.modelTemperature ?? 0.7,
				systemInstruction: systemInstruction
			})
			console.log("[GCliProvider] API response received, status:", response.status)

			// Check for HTTP error status
			if (!response.ok) {
				const errorMessage = `API request failed with status ${response.status}: ${response.statusText}`
				console.error("[GCliProvider]", errorMessage)
				yield { type: "text", text: `❌ **Error**: ${errorMessage}` }
				return
			}

			// Process streaming chunks
			console.log("[GCliProvider] Processing streaming chunks...")
			try {
				for await (const chunk of this.apiClient.parseSSEStream(response)) {
					console.log("[GCliProvider] Received chunk:", chunk)
					const text = this.apiClient.extractTextContent(chunk)
					const usage = this.apiClient.extractUsageMetadata(chunk)

					if (text) {
						console.log("[GCliProvider] Yielding text:", text.substring(0, 50) + "...")
						yield { type: "text", text }
					}

					if (usage.inputTokens || usage.outputTokens) {
						console.log("[GCliProvider] Yielding usage:", usage)
						yield {
							type: "usage",
							inputTokens: usage.inputTokens,
							outputTokens: usage.outputTokens,
							cacheReadTokens: usage.cacheReadTokens,
							totalCost: this.calculateCost({ info, inputTokens: usage.inputTokens, outputTokens: usage.outputTokens, cacheReadTokens: usage.cacheReadTokens || 0 }),
						}
					}
				}
				console.log("[GCliProvider] Streaming completed")
			} catch (streamError: any) {
				console.error("[GCliProvider] Error processing stream:", streamError)
				const errorMessage = this.getErrorMessage(streamError)
				yield { type: "text", text: `❌ **Streaming Error**: ${errorMessage}` }
				return
			}
		} catch (error: any) {
			console.error("[GCliProvider] Error in createMessage:", error)
			const errorMessage = this.getErrorMessage(error)
			yield { type: "text", text: `❌ **Error**: ${errorMessage}` }
			return
		}
	}

	/**
	 * Create a streaming message
	 */
	async *createMessageStream(params: CreateMessageParams, systemInstruction?: string): AsyncGenerator<StreamChunk> {
		// Validate parameters
		this.validateCreateMessageParams(params)

		try {
			// Get access token
			const accessToken = await this.oauthManager.getAccessToken()
			if (!accessToken) {
				throw new Error("Failed to obtain access token")
			}
			
			const projectId = await this.oauthManager.getProjectId(accessToken)
			if (!projectId) {
				throw new Error("Failed to obtain project ID")
			}

			// Update API client with credentials
			this.apiClient.updateAccessToken(accessToken)
			this.apiClient.updateProjectId(projectId)

			// Convert messages to Gemini format
			const geminiMessages = params.messages.map(msg => {
				// Convert from the custom format to Anthropic format first
				const content: Anthropic.Messages.ContentBlockParam[] = msg.content.map(c => {
					if (c.type === "text") {
						return { type: "text" as const, text: c.text || "" }
					} else if (c.type === "image" && c.source) {
						return {
							type: "image" as const,
							source: {
								type: "base64" as const,
								media_type: c.source.media_type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
								data: c.source.data
							}
						}
					}
					return { type: "text" as const, text: "" }
				}).filter(c => (c.type === "text" && c.text) || c.type === "image")

				const anthropicMsg: Anthropic.Messages.MessageParam = {
					role: msg.role as "user" | "assistant",
					content
				}
				return convertAnthropicMessageToGemini(anthropicMsg)
			})

			// Make streaming API request
			const response = await this.apiClient.streamGenerateContent({
				model: params.model,
				messages: geminiMessages,
				maxTokens: params.maxTokens,
				temperature: params.temperature,
				topP: params.topP,
				systemInstruction: systemInstruction
			})

			// Yield message start
			yield {
				type: "message_start",
				message: {
					id: `msg_${Date.now()}`,
					type: "message",
					role: "assistant",
					content: [],
					model: params.model
				}
			}

			// Yield content block start
			yield {
				type: "content_block_start",
				index: 0,
				content_block: {
					type: "text",
					text: ""
				}
			}

			let totalText = ""
			let inputTokens = 0
			let outputTokens = 0

			// Process streaming chunks
			for await (const chunk of this.apiClient.parseSSEStream(response)) {
				const text = this.apiClient.extractTextContent(chunk)
				const usage = this.apiClient.extractUsageMetadata(chunk)

				if (text) {
					totalText += text
					yield {
						type: "content_block_delta",
						index: 0,
						delta: {
							type: "text_delta",
							text
						}
					}
				}

				if (usage.inputTokens) inputTokens = usage.inputTokens
				if (usage.outputTokens) outputTokens = usage.outputTokens
			}

			// Yield content block stop
			yield {
				type: "content_block_stop",
				index: 0
			}

			// Yield message stop
			yield {
				type: "message_stop",
				usage: {
					input_tokens: inputTokens,
					output_tokens: outputTokens
				}
			}

		} catch (error: any) {
			console.error("[GCliProvider] Error in createMessageStream:", error)
			
			if (error instanceof Error) {
				throw new Error(`Gemini CLI completion error: ${error.message}`)
			}
			
			throw error
		}
	}

	/**
	 * Validate create message parameters
	 */
	private validateCreateMessageParams(params: CreateMessageParams): void {
		if (!params.model) {
			throw new Error("Model is required")
		}

		if (!Object.keys(gCliModels).includes(params.model)) {
			throw new Error(`Invalid model: ${params.model}. Available models: ${Object.keys(gCliModels).join(", ")}`)
		}

		if (!params.messages || !Array.isArray(params.messages) || params.messages.length === 0) {
			throw new Error("Messages array is required and must not be empty")
		}

		if (params.maxTokens !== undefined && (params.maxTokens <= 0 || params.maxTokens > 65536)) {
			throw new Error("maxTokens must be between 1 and 65536")
		}

		if (params.temperature !== undefined && (params.temperature < 0 || params.temperature > 2)) {
			throw new Error("temperature must be between 0 and 2")
		}

		if (params.topP !== undefined && (params.topP < 0 || params.topP > 1)) {
			throw new Error("topP must be between 0 and 1")
		}
	}

	/**
	 * Map Gemini finish reason to Claude format
	 */
	private mapFinishReason(finishReason?: string): string {
		switch (finishReason) {
			case "STOP":
				return "end_turn"
			case "MAX_TOKENS":
				return "max_tokens"
			case "SAFETY":
				return "stop_sequence"
			case "RECITATION":
				return "stop_sequence"
			default:
				return "end_turn"
		}
	}

	/**
	 * Map errors to user-friendly messages
	 */
	private getErrorMessage(error: any): string {
		if (error instanceof Error) {
			// Check for specific error types and provide user-friendly messages
			const message = error.message.toLowerCase()
			
			if (message.includes("unauthorized") || message.includes("401")) {
				return "Authentication failed. Please check your Gemini CLI credentials and ensure you're logged in."
			}
			
			if (message.includes("forbidden") || message.includes("403")) {
				return "Access denied. Please check your project permissions and API access."
			}
			
			if (message.includes("quota") || message.includes("rate limit") || message.includes("rate_limit") || (message.includes("rate") && message.includes("limit"))) {
				return "API quota exceeded or rate limit reached. Please  switch to gemini-2.5-flash model or try again later"
			}
			
			if (message.includes("timeout") || message.includes("network")) {
				return "Network timeout or connection error. Please check your internet connection and try again."
			}
			
			if (message.includes("model not found") || message.includes("404")) {
				return "The specified model is not available. Please check your model configuration."
			}
			
			if (message.includes("invalid request") || message.includes("400")) {
				return "Invalid request format. Please check your input parameters."
			}
			
			if (message.includes("safety") || message.includes("content filter")) {
				return "Content was blocked by safety filters. Please modify your request and try again."
			}

			// Return the original error message if no specific pattern matches
			return error.message
		}
		
		// Handle non-Error objects
		if (typeof error === "string") {
			return error
		}
		
		if (error && typeof error === "object") {
			if (error.message && typeof error.message === "string") {
				return error.message
			}
			// Handle cases where error is just a number or other primitive wrapped in an object
			return String(error)
		}
		
		// Handle primitive types (numbers, etc.)
		if (error !== null && error !== undefined) {
			return String(error)
		}
		
		return "An unknown error occurred while processing your request."
	}

	/**
	 * Map finish reason to Claude format
	 */

	/**
	 * Single completion implementation
	 */
	async completePrompt(prompt: string): Promise<string> {
		try {
			// Get access token
			const accessToken = await this.oauthManager.getAccessToken()
			if (!accessToken) {
				throw new Error("Failed to obtain access token")
			}
			
			const projectId = await this.oauthManager.getProjectId(accessToken)
			if (!projectId) {
				throw new Error("Failed to obtain project ID")
			}

			// Update API client with credentials
			this.apiClient.updateAccessToken(accessToken)
			this.apiClient.updateProjectId(projectId)

			// Create simple message for prompt
			const anthropicMessages: Anthropic.Messages.MessageParam[] = [{
				role: "user" as const,
				content: [{ type: "text" as const, text: prompt }]
			}]

			// Convert to Gemini format
			const geminiMessages = anthropicMessages.map(msg => convertAnthropicMessageToGemini(msg))

			// Get model configuration
			const { id: model } = this.getModel()

			// Make non-streaming request
			const response = await this.apiClient.generateContent({
				model,
				messages: geminiMessages,
				maxTokens: this.options.modelMaxTokens,
				temperature: this.options.modelTemperature ?? 0.7,
				systemInstruction: undefined // No system instruction for simple prompt completion
			})

			// Extract text from response
			if (response.candidates && response.candidates.length > 0) {
				const candidate = response.candidates[0]
				if (candidate.content && candidate.content.parts) {
					return candidate.content.parts
						.filter((part: any) => part.text)
						.map((part: any) => part.text)
						.join("")
				}
			}

			return ""
		} catch (error: any) {
			console.error("[GCliProvider] Error in completePrompt:", error)
			
			if (error instanceof Error) {
				throw new Error(`Gemini CLI completion error: ${error.message}`)
			}
			
			throw error
		}
	}

	/**
		* Calculate API cost for usage
		*/
	private calculateCost(params: {
		info: ModelInfo
		inputTokens: number
		outputTokens: number
		cacheReadTokens?: number
	}): number {
		return calculateApiCostAnthropic(
			params.info,
			params.inputTokens,
			params.outputTokens,
			0, // cacheCreationInputTokens - Gemini doesn't have cache creation
			params.cacheReadTokens || 0
		)
	}
}

// Export with Handler suffix to match existing provider patterns
export { GCliProvider as GCliHandler }