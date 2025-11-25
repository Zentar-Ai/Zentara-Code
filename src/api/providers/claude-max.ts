import { Stream as AnthropicStream } from "@anthropic-ai/sdk/streaming"
import { CacheControlEphemeral } from "@anthropic-ai/sdk/resources"
import * as crypto from "crypto"
import * as path from "path"
import * as fs from "fs"

import {
	type ModelInfo,
	type ClaudeCodeModelId,
	claudeCodeDefaultModelId,
	claudeCodeModels,
	ANTHROPIC_DEFAULT_MAX_TOKENS,
} from "@zentara-code/types"

import type { ApiHandlerOptions } from "../../shared/api"
import { ApiStream } from "../transform/stream"
import { BaseProvider } from "./base-provider"
import type { SingleCompletionHandler, ApiHandlerCreateMessageMetadata } from "../index"
import { calculateApiCostSubscription } from "../../shared/cost"

const CLIENT_ID = "9d1c250a-e61b-44d9-88ed-5944d1962f5e"
const CLAUDE_MAX_BETA_HEADERS =
	"oauth-2025-04-20,claude-code-20250219,interleaved-thinking-2025-05-14,fine-grained-tool-streaming-2025-05-14"

interface AuthTokens {
	accessToken: string
	refreshToken: string
	expiresAt: number
}

export class ClaudeMaxHandler extends BaseProvider implements SingleCompletionHandler {
	completePrompt(prompt: string): Promise<string> {
		throw new Error("completePrompt not implemented for ClaudeMaxHandler")
	}

	private options: ApiHandlerOptions
	private authTokens: AuthTokens | null = null
	private authFilePath: string

	constructor(options: ApiHandlerOptions) {
		super()
		this.options = options
		// Store auth tokens in user data directory
		const userDataDir =
			this.options.userDataDir || path.join(process.env.HOME || process.env.USERPROFILE || "", ".claude-max")
		if (!fs.existsSync(userDataDir)) {
			fs.mkdirSync(userDataDir, { recursive: true })
		}
		this.authFilePath = path.join(userDataDir, "auth.json")

		// Load existing auth tokens if available
		this.loadAuthTokens()
	}

	private loadAuthTokens(): void {
		try {
			if (fs.existsSync(this.authFilePath)) {
				const data = fs.readFileSync(this.authFilePath, "utf-8")
				this.authTokens = JSON.parse(data)
			}
		} catch (error) {
			console.error("Failed to load auth tokens:", error)
			this.authTokens = null
		}
	}

	private saveAuthTokens(tokens: AuthTokens): void {
		try {
			fs.writeFileSync(this.authFilePath, JSON.stringify(tokens, null, 2))
			this.authTokens = tokens
		} catch (error) {
			console.error("Failed to save auth tokens:", error)
		}
	}

	private async ensureAuthenticated(): Promise<void> {
		// Check if tokens exist and are not expired
		if (this.authTokens && this.authTokens.expiresAt > Date.now()) {
			return
		}

		// If we have a refresh token, try to refresh
		if (this.authTokens?.refreshToken) {
			try {
				await this.refreshAccessToken()
				return
			} catch (error) {
				console.error("Failed to refresh token:", error)
				// Fall through to error
			}
		}

		// Need to authenticate - throw error instead of auto-authenticating
		throw new Error("Authentication required. Please authenticate with Claude Max in the settings.")
	}

	// Generate PKCE challenge and verifier
	private generatePKCE(): { verifier: string; challenge: string } {
		const verifier = crypto.randomBytes(32).toString("base64url")
		const challenge = crypto.createHash("sha256").update(verifier).digest("base64url")

		return { verifier, challenge }
	}

	// Public method to get authorization URL for UI
	public async getAuthorizationUrl(): Promise<{ url: string; verifier: string }> {
		const pkce = this.generatePKCE()

		const url = new URL("https://claude.ai/oauth/authorize")
		url.searchParams.set("code", "true")
		url.searchParams.set("client_id", CLIENT_ID)
		url.searchParams.set("response_type", "code")
		url.searchParams.set("redirect_uri", "https://console.anthropic.com/oauth/code/callback")
		url.searchParams.set("scope", "org:create_api_key user:profile user:inference")
		url.searchParams.set("code_challenge", pkce.challenge)
		url.searchParams.set("code_challenge_method", "S256")
		url.searchParams.set("state", pkce.verifier)

		return {
			url: url.toString(),
			verifier: pkce.verifier,
		}
	}

	// Public method to exchange authorization code for tokens and create API key
	public async exchangeCodeForTokens(code: string, verifier: string): Promise<void> {
		try {
			const splits = code.split("#")
			const response = await fetch("https://console.anthropic.com/v1/oauth/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					code: splits[0],
					state: splits[1],
					grant_type: "authorization_code",
					client_id: CLIENT_ID,
					redirect_uri: "https://console.anthropic.com/oauth/code/callback",
					code_verifier: verifier,
				}),
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(`Failed to exchange code for tokens: ${response.status} ${errorText}`)
			}

			const json = await response.json()

			// Save tokens
			const tokens: AuthTokens = {
				accessToken: json.access_token,
				refreshToken: json.refresh_token,
				expiresAt: Date.now() + json.expires_in * 1000,
			}
			this.saveAuthTokens(tokens)

			// Now use the access token to create a standard API key
			await this.createApiKeyWithOAuth(tokens.accessToken)
		} catch (error) {
			throw new Error(`Token exchange failed: ${error}`)
		}
	}

	// Create a standard API key using OAuth token (like opencode does)
	private async createApiKeyWithOAuth(accessToken: string): Promise<void> {
		try {
			const response = await fetch("https://api.anthropic.com/api/oauth/claude_cli/create_api_key", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(`Failed to create API key: ${response.status} ${errorText}`)
			}

			const result = await response.json()
			const apiKey = result.raw_key

			if (!apiKey) {
				throw new Error("No API key returned from create_api_key endpoint")
			}

			// Save the API key for future use
			this.saveApiKey(apiKey)
		} catch (error) {
			console.error("Failed to create API key with OAuth token:", error)
			throw new Error(`API key creation failed: ${error}`)
		}
	}

	// Save API key to file
	private saveApiKey(apiKey: string): void {
		try {
			const apiKeyPath = path.join(path.dirname(this.authFilePath), "api-key.json")
			fs.writeFileSync(apiKeyPath, JSON.stringify({ apiKey }, null, 2))
		} catch (error) {
			console.error("Failed to save API key:", error)
		}
	}

	// Load API key from file
	private loadApiKey(): string | null {
		try {
			const apiKeyPath = path.join(path.dirname(this.authFilePath), "api-key.json")
			if (fs.existsSync(apiKeyPath)) {
				const data = fs.readFileSync(apiKeyPath, "utf-8")
				const { apiKey } = JSON.parse(data)
				return apiKey
			}
		} catch (error) {
			console.error("Failed to load API key:", error)
		}
		return null
	}

	// Check if authenticated
	public isAuthenticated(): boolean {
		return !!(this.authTokens && this.authTokens.expiresAt > Date.now())
	}

	private async refreshAccessToken(): Promise<void> {
		if (!this.authTokens?.refreshToken) {
			throw new Error("No refresh token available")
		}

		try {
			// Refresh the tokens using Anthropic's token endpoint
			const response = await fetch("https://console.anthropic.com/v1/oauth/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					grant_type: "refresh_token",
					refresh_token: this.authTokens.refreshToken,
					client_id: CLIENT_ID,
				}),
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(`Token refresh failed: ${response.status} ${errorText}`)
			}

			const json = await response.json()

			// Update tokens
			const tokens: AuthTokens = {
				accessToken: json.access_token,
				refreshToken: json.refresh_token || this.authTokens.refreshToken,
				expiresAt: Date.now() + json.expires_in * 1000,
			}
			this.saveAuthTokens(tokens)
		} catch (error) {
			throw new Error(`Token refresh failed: ${error}`)
		}
	}

	private async makeApiRequest(
		systemPrompt: string,
		messages: any[],
		modelId: string,
		maxTokens: number,
		temperature: number,
	): Promise<Response> {
		// Ensure we're authenticated and tokens are fresh
		await this.ensureAuthenticated()

		if (!this.authTokens?.accessToken) {
			throw new Error("No access token available")
		}

		// Build the request body
		const requestBody = {
			model: modelId,
			max_tokens: maxTokens,
			temperature,
			system: "You are Claude Code, Anthropic's official CLI for Claude.",
			messages: [{ role: "user", content: systemPrompt }, ...messages],
			stream: true,
		}

		// Build beta headers dynamically
		const betas = [CLAUDE_MAX_BETA_HEADERS]

		// Add 1M context beta if enabled for Claude Sonnet 4/4.5
		if ((modelId === "claude-sonnet-4-20250514" || modelId === "claude-sonnet-4-5") &&
			this.options.claudeMaxBeta1MContext) {
			betas.push("context-1m-2025-08-07")
		}

		// Build headers exactly like opencode does
		const headers: any = {
			"Content-Type": "application/json",
			authorization: `Bearer ${this.authTokens.accessToken}`,
			"anthropic-beta": betas.join(","),
			"anthropic-version": "2023-06-01",
			"User-Agent": `opencode-tui/0.5.18 (${process.platform}; ${process.arch})`,
		}

		// Critical: Don't include x-api-key at all
		// This is what opencode does - they never add it in the first place

		console.log(`[Claude Max] Making direct API request to: https://api.anthropic.com/v1/messages`)
		console.log(`[Claude Max] Headers:`, headers)

		const response = await fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			headers,
			body: JSON.stringify(requestBody),
		})

		if (!response.ok) {
			const errorText = await response.text()
			console.error(`[Claude Max] API request failed:`, {
				status: response.status,
				statusText: response.statusText,
				error: errorText,
			})
			throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
		}

		return response
	}

	getModel(): { id: string; info: ModelInfo } {
		const modelId = this.options.apiModelId
		if (modelId && modelId in claudeCodeModels) {
			let id = modelId as ClaudeCodeModelId
			let modelInfo: ModelInfo = { ...claudeCodeModels[id] }
			if (id.endsWith("[1m]")) {
				id = "claude-sonnet-4-5" as ClaudeCodeModelId
			}

			// Override maxTokens with the configured value if provided
			if (this.options.claudeCodeMaxOutputTokens !== undefined) {
				modelInfo.maxTokens = this.options.claudeCodeMaxOutputTokens
			}
			// If 1M context beta is enabled for Claude Sonnet 4 or 4.5, update the model info
			if ((id === "claude-sonnet-4-20250514" || id === "claude-sonnet-4-5" ) && this.options.claudeMaxBeta1MContext) {
				// Use the tier pricing for 1M context
				const tier = modelInfo.tiers?.[0]
				if (tier) {
					modelInfo = {
						...modelInfo,
						contextWindow: tier.contextWindow,
						inputPrice: tier.inputPrice,
						outputPrice: tier.outputPrice,
						cacheWritesPrice: tier.cacheWritesPrice,
						cacheReadsPrice: tier.cacheReadsPrice,
					}
				}
			}
			return { id, info: modelInfo }
		}

		const defaultModelInfo: ModelInfo = { ...claudeCodeModels[claudeCodeDefaultModelId] }

		// Override maxTokens with the configured value if provided
		if (this.options.claudeCodeMaxOutputTokens !== undefined) {
			defaultModelInfo.maxTokens = this.options.claudeCodeMaxOutputTokens
		}

		return {
			id: claudeCodeDefaultModelId,
			info: defaultModelInfo,
		}
	}

	async *createMessage(systemPrompt: string, messages: any[], metadata?: ApiHandlerCreateMessageMetadata): ApiStream {
		const model = this.getModel()
		const modelId = model.id as ClaudeCodeModelId
		const modelInfo = model.info
		const temperature = 0.0 // Default temperature, can be made configurable

		const maxTokens = this.options.claudeCodeMaxOutputTokens || modelInfo.maxTokens || ANTHROPIC_DEFAULT_MAX_TOKENS

		try {
			console.log(`[Claude Max] Starting createMessage with ${messages.length} messages`)

			// Make direct API call instead of using SDK
			const response = await this.makeApiRequest(systemPrompt, messages, modelId, maxTokens, temperature)

			// Process SSE stream
			const reader = response.body!.getReader()
			const decoder = new TextDecoder()

			let inputTokens = 0
			let outputTokens = 0
			let cacheWriteTokens = 0
			let cacheReadTokens = 0
			let buffer = ""

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split("\n")
				buffer = lines.pop() || ""

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6)
						if (data === "[DONE]") continue

						try {
							const chunk = JSON.parse(data)

							switch (chunk.type) {
								case "message_start": {
									const usage = chunk.message?.usage
									if (usage) {
										inputTokens = usage.input_tokens || 0
										outputTokens = usage.output_tokens || 0
										cacheWriteTokens = usage.cache_creation_input_tokens || 0
										cacheReadTokens = usage.cache_read_input_tokens || 0
									}
									break
								}

								case "content_block_start": {
									if (chunk.content_block?.type === "text") {
										yield {
											type: "text",
											text: chunk.content_block.text || "",
										}
									}
									break
								}

								case "content_block_delta": {
									if (chunk.delta?.type === "text_delta") {
										yield {
											type: "text",
											text: chunk.delta.text || "",
										}
									}
									break
								}

								case "message_delta": {
									if (chunk.delta?.stop_reason) {
										yield {
											type: "usage",
											inputTokens,
											outputTokens,
											cacheReadTokens,
											cacheWriteTokens,
											totalCost: calculateApiCostSubscription(
												this.getModel().info,
												inputTokens,
												outputTokens,
												cacheWriteTokens,
												cacheReadTokens,
											),
										}
									}
				
									const usage = chunk.usage
									if (usage) {
										outputTokens = usage.output_tokens || outputTokens
									}
									break
								}

								default:
									// Handle other chunk types if needed
									break
							}
						} catch (e) {
							console.error(`[Claude Max] Error parsing SSE chunk:`, e)
						}
					}
				}
			}
		} catch (error) {
			console.error(`[Claude Max] Failed to create message:`, error)
			throw error
		}
	}

	override async countTokens(content: any[]): Promise<number> {
		// Use parent class implementation for now
		// Could potentially use Claude's token counting endpoint if available
		return super.countTokens(content)
	}
}
