import { Content } from "@google/genai"

export interface ApiClientOptions {
	accessToken?: string
	projectId?: string
	timeout?: number
}

export interface GeminiRequest {
	model: string
	contents: Content[]
	generationConfig?: {
		maxOutputTokens?: number
		temperature?: number
		topP?: number
	}
	systemInstruction?: {
		parts: Array<{ text: string }>
	}
	safetySettings?: Array<{
		category: string
		threshold: string
	}>
}

export interface AnthropicMessage {
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
}

export interface BuildRequestParams {
	model: string
	messages: Content[]
	maxTokens?: number
	temperature?: number
	topP?: number
	systemInstruction?: string
	safetySettings?: Array<{
		category: string
		threshold: string
	}>
}

export interface HeaderOptions {
	streaming?: boolean
	custom?: Record<string, string>
}

export class GCliApiClient {
	private accessToken: string
	private projectId: string
	private timeout: number

	constructor(options: ApiClientOptions = {}) {
		this.accessToken = options.accessToken || ""
		this.projectId = options.projectId || ""
		this.timeout = options.timeout || 30000
	}

	/**
	 * Update project ID
	 */
	updateProjectId(projectId: string): void {
		this.projectId = projectId
	}

	/**
	 * Update access token
	 */
	updateAccessToken(token: string): void {
		this.accessToken = token
	}


	/**
	 * Build API request body
	 */
	buildRequest(params: BuildRequestParams): any {
		// Validate required parameters
		if (!params.model || params.model.trim() === "") {
			throw new Error("Model is required")
		}
		if (!params.messages || params.messages.length === 0) {
			throw new Error("Messages are required")
		}

		// Validate generation config
		if (params.maxTokens !== undefined) {
			if (params.maxTokens <= 0 || params.maxTokens > 65536) {
				throw new Error("maxTokens must be between 1 and 65536")
			}
		}
		if (params.temperature !== undefined) {
			if (params.temperature < 0 || params.temperature > 2) {
				throw new Error("temperature must be between 0 and 2")
			}
		}
		if (params.topP !== undefined) {
			if (params.topP < 0 || params.topP > 1) {
				throw new Error("topP must be between 0 and 1")
			}
		}

		// Build request in the format expected by Code Assist API
		const generationConfig: any = {
			temperature: params.temperature !== undefined ? params.temperature : 0.7,
			maxOutputTokens: params.maxTokens || 8192,
		}

		// Add topP if specified
		if (params.topP !== undefined) {
			generationConfig.topP = params.topP
		}

		const requestBody: any = {
			contents: params.messages,
			generationConfig
		}

		// Add system instruction if provided
		if (params.systemInstruction) {
			requestBody.systemInstruction = {
				parts: [{ text: params.systemInstruction }]
			}
		}

		// Add safety settings if provided
		if (params.safetySettings) {
			requestBody.safetySettings = params.safetySettings
		}

		const request = {
			model: params.model,
			project: this.projectId,
			request: requestBody
		}

		return request
	}

	/**
	 * Build API endpoint URL
	 */
	buildApiUrl(model: string, endpoint: string): string {
		// Validate model
		const validModels = ["gemini-2.5-pro", "gemini-2.5-flash"]
		if (!model || !validModels.includes(model)) {
			throw new Error(`Invalid model: ${model}. Must be one of: ${validModels.join(", ")}`)
		}

		// Validate endpoint
		const validEndpoints = ["generateContent", "streamGenerateContent"]
		if (!endpoint || !validEndpoints.includes(endpoint)) {
			throw new Error(`Invalid endpoint: ${endpoint}. Must be one of: ${validEndpoints.join(", ")}`)
		}

		// Build base URL - using the same format as Python implementation
		const baseUrl = `https://cloudcode-pa.googleapis.com/v1internal:${endpoint}`

		// Add SSE parameter for streaming
		if (endpoint === "streamGenerateContent") {
			return `${baseUrl}?alt=sse`
		}

		return baseUrl
	}

	/**
	 * Build HTTP headers
	 */
	buildHeaders(options: HeaderOptions = {}): Record<string, string> {
		const headers: Record<string, string> = {
			"Authorization": `Bearer ${this.accessToken}`,
			"Content-Type": "application/json",
			"User-Agent": "Zentara-Code/1.0.0 (g-cli-provider)"
		}

		if (options.streaming) {
			headers["Accept"] = "text/event-stream"
			headers["Cache-Control"] = "no-cache"
		} else {
			headers["Accept"] = "application/json"
		}

		// Add custom headers
		if (options.custom) {
			Object.assign(headers, options.custom)
		}

		return headers
	}

	/**
	 * Make streaming request to Code Assist API
	 */
	async streamGenerateContent(params: BuildRequestParams): Promise<Response> {
		const request = this.buildRequest(params)
		const url = this.buildApiUrl(params.model, "streamGenerateContent")
		const headers = this.buildHeaders({ streaming: true })

		console.log("🚀 Making streaming API request to:", url)
		console.log("📤 Request body:", JSON.stringify(request, null, 2))
		console.log("📤 Headers:", headers)

		const response = await fetch(url, {
			method: "POST",
			headers,
			body: JSON.stringify(request),
			signal: AbortSignal.timeout(this.timeout)
		})

		console.log("📥 Response status:", response.status, response.statusText)
		const responseHeaders: Record<string, string> = {}
		response.headers.forEach((value, key) => {
			responseHeaders[key] = value
		})
		console.log("📥 Response headers:", responseHeaders)

		if (!response.ok) {
			const errorText = await response.text().catch(() => "Unknown error")
			console.error("❌ API request failed:", response.status, response.statusText)
			console.error("❌ Error response:", errorText)
			throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
		}

		console.log("✅ Streaming response received successfully")
		return response
	}

	/**
	 * Make non-streaming request to Code Assist API
	 */
	async generateContent(params: BuildRequestParams): Promise<any> {
		const request = this.buildRequest(params)
		const url = this.buildApiUrl(params.model, "generateContent")
		const headers = this.buildHeaders()

		const response = await fetch(url, {
			method: "POST",
			headers,
			body: JSON.stringify(request),
			signal: AbortSignal.timeout(this.timeout)
		})

		if (!response.ok) {
			const errorText = await response.text().catch(() => "Unknown error")
			throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
		}

		return response.json()
	}

	/**
	 * Parse Server-Sent Events stream
	 */
	async *parseSSEStream(response: Response): AsyncGenerator<any> {
		if (!response.body) {
			throw new Error("Response body is null")
		}

		console.log("🔄 Starting to parse SSE stream...")
		const reader = response.body.getReader()
		const decoder = new TextDecoder()
		let buffer = ""
		let chunkCount = 0

		try {
			while (true) {
				const { done, value } = await reader.read()
				if (done) {
					console.log("✅ SSE stream completed, total chunks:", chunkCount)
					break
				}

				buffer += decoder.decode(value, { stream: true })
				const lines = buffer.split("\n")
				
				// Keep the last incomplete line in buffer
				buffer = lines.pop() || ""

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6).trim()
						console.log("📨 SSE data received:", data.substring(0, 200) + (data.length > 200 ? "..." : ""))
						
						if (data === "[DONE]") {
							console.log("🏁 SSE stream marked as done")
							return
						}
						
						try {
							const parsed = JSON.parse(data)
							console.log("✅ Parsed SSE chunk:", JSON.stringify(parsed, null, 2))
							chunkCount++
							yield parsed
						} catch (error) {
							// Skip malformed JSON
							console.warn("⚠️ Failed to parse SSE data:", data)
						}
					}
				}
			}
		} finally {
			reader.releaseLock()
		}
	}

	/**
	 * Extract text content from Gemini response
	 */
	extractTextContent(response: any): string {
		// Handle the nested response structure from Code Assist API
		const actualResponse = response.response || response
		
		if (!actualResponse.candidates || actualResponse.candidates.length === 0) {
			return ""
		}

		const candidate = actualResponse.candidates[0]
		if (!candidate.content || !candidate.content.parts) {
			return ""
		}

		return candidate.content.parts
			.filter((part: any) => part.text)
			.map((part: any) => part.text)
			.join("")
	}

	/**
	 * Extract usage metadata from response
	 */
	extractUsageMetadata(response: any): { inputTokens: number; outputTokens: number; cacheReadTokens?: number } {
		// Handle the nested response structure from Code Assist API
		const actualResponse = response.response || response
		const usage = actualResponse.usageMetadata || {}
		
		return {
			inputTokens: usage.promptTokenCount || 0,
			outputTokens: usage.candidatesTokenCount || 0,
			cacheReadTokens: usage.cachedContentTokenCount || undefined
		}
	}
}