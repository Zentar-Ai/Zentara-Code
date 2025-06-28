import { createServer, Server } from "http"
import { URL } from "url"
import { randomBytes } from "crypto"
import { spawn } from "child_process"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { GCliOnboardingManager } from "./onboarding-manager"

export interface OAuthCredentials {
	access_token: string
	refresh_token?: string
	token_type: string
	expires_in: number
	expires_at: number
	scope: string
}

export interface OAuthConfig {
	clientId: string
	clientSecret: string
	credentialsPath?: string
	projectId?: string
}

export interface CallbackResult {
	code: string
	state: string
}

export class GCliOAuthManager {
	private readonly clientId: string
	private readonly clientSecret: string
	private readonly credentialsPath: string
	private readonly scopes: string[]
	private redirectUri: string
	private currentState?: string

	constructor(options: Partial<OAuthConfig> = {}) {
		this.clientId = options.clientId || "681255809395-oo8ft2oprdrnp9e3aqf6av3hmdib135j.apps.googleusercontent.com"
		this.clientSecret = options.clientSecret || "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"
		this.credentialsPath = options.credentialsPath || path.join(os.homedir(), ".gemini", "oauth_creds.json")
		this.scopes = [
			"https://www.googleapis.com/auth/cloud-platform",
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile"
		]
		this.redirectUri = "http://localhost:8080/oauth/callback"
	}

	/**
	 * Main entry point for getting access token
	 */
	async getAccessToken(): Promise<string | null> {
		try {
			// Try to load existing credentials
			const credentials = this.loadCredentials()
			if (credentials) {
				// Check if token is still valid
				if (await this.validateToken(credentials.access_token)) {
					return credentials.access_token
				}

				// Try to refresh if we have a refresh token
				if (credentials.refresh_token) {
					const refreshed = await this.refreshToken(credentials.refresh_token)
					if (refreshed) {
						this.saveCredentials(refreshed)
						return refreshed.access_token
					}
				}
			}

			// Need to do full OAuth flow
			const newCredentials = await this.initiateOAuthFlow()
			if (newCredentials) {
				this.saveCredentials(newCredentials)
				return newCredentials.access_token
			}

			return null
		} catch (error) {
			console.error("Failed to get access token:", error)
			return null
		}
	}

	/**
	 * Get project ID from Code Assist API
	 */
	async getProjectId(token: string): Promise<string | null> {
		try {
			console.log("🔍 Getting project ID with token:", token.substring(0, 20) + "...")
			
			const requestBody = {
				cloudaicompanionProject: null,
				metadata: {
					ideType: "IDE_UNSPECIFIED",
					platform: "PLATFORM_UNSPECIFIED",
					pluginType: "GEMINI",
					duetProject: null
				}
			}
			
			console.log("📤 Project ID request body:", JSON.stringify(requestBody, null, 2))
			
			const response = await fetch("https://cloudcode-pa.googleapis.com/v1internal:loadCodeAssist", {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json",
					"User-Agent": "gCLI/0.1.5 (linux; x64)"
				},
				body: JSON.stringify(requestBody)
			})

			console.log("� Project ID response status:", response.status, response.statusText)

			if (!response.ok) {
				console.error("❌ Failed to get project ID:", response.status, response.statusText)
				const errorText = await response.text().catch(() => "Unknown error")
				console.error("❌ Project ID error response:", errorText)
				return null
			}

			const data = await response.json()
			console.log("� Full project ID response:", JSON.stringify(data, null, 2))
			
			// The Python code expects cloudaicompanionProject to be returned directly
			// But we're getting allowedTiers structure instead
			// This suggests the API behavior has changed or we need a different approach
			
			if (data.allowedTiers && Array.isArray(data.allowedTiers)) {
				console.log("🎯 Found allowedTiers instead of cloudaicompanionProject")
				console.log("🔍 This suggests the API response structure has changed")
				console.log("🔍 Python code expects: response.json().get('cloudaicompanionProject')")
				console.log("🔍 But we're getting: { allowedTiers: [...] }")
				
				// For now, return null to match Python behavior when no project ID is found
				console.log("⚠️ Returning null to match Python behavior")
				return null
			}
			
			// Original logic that Python code expects
			const projectId = data.cloudaicompanionProject || null
			console.log("🎯 Extracted project ID (Python-compatible):", projectId)
			
			if (!projectId) {
				console.error("❌ No cloudaicompanionProject found in response")
				console.error("❌ Available keys:", Object.keys(data))
				console.error("❌ Full response:", JSON.stringify(data, null, 2))
			}
			
			return projectId
		} catch (error) {
			console.error("❌ Error getting project ID:", error)
			return null
		}
	}

	/**
	 * Generate authorization URL
	 */
	generateAuthUrl(state?: string): string {
		const authState = state || this.generateState()
		this.currentState = authState

		const params = new URLSearchParams({
			client_id: this.clientId,
			response_type: "code",
			scope: this.scopes.join(" "),
			redirect_uri: this.redirectUri,
			state: authState,
			access_type: "offline",
			prompt: "consent"
		})

		return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
	}

	/**
	 * Generate secure random state parameter
	 */
	generateState(): string {
		return randomBytes(32).toString("hex")
	}

	/**
	 * Validate state parameter
	 */
	validateState(expected: string, received: string | null): boolean {
		return expected === received && received !== null && received !== ""
	}

	/**
	 * Start local HTTP server for OAuth callback
	 */
	async startCallbackServer(): Promise<{ server: Server; port: number }> {
		return new Promise((resolve, reject) => {
			const server = createServer((req: any, res: any) => {
				if (req.url?.startsWith("/oauth/callback")) {
					try {
						const { code, state } = this.parseCallbackUrl(req.url, this.currentState)
						
						// Send success response
						res.writeHead(200, { "Content-Type": "text/html" })
						res.end(`
							<html>
								<body>
									<h1>Authorization Successful!</h1>
									<p>You can close this window and return to Zentara Code.</p>
									<script>window.close();</script>
								</body>
							</html>
						`)

						// Emit callback event
						server.emit("oauth-callback", { code, state })
					} catch (error) {
						res.writeHead(400, { "Content-Type": "text/html" })
						res.end(`
							<html>
								<body>
									<h1>Authorization Failed</h1>
									<p>Error: ${error instanceof Error ? error.message : "Unknown error"}</p>
								</body>
							</html>
						`)
						server.emit("oauth-error", error)
					}
				} else {
					res.writeHead(404)
					res.end("Not found")
				}
			})

			server.listen(8080, () => {
				const address = server.address()
				const port = typeof address === "object" && address ? address.port : 8080
				resolve({ server, port })
			})

			server.on("error", reject)
		})
	}

	/**
	 * Parse OAuth callback URL
	 */
	parseCallbackUrl(url: string, expectedState?: string): CallbackResult {
		const parsedUrl = new URL(url, "http://localhost")
		const params = parsedUrl.searchParams

		// Check for error
		const error = params.get("error")
		if (error) {
			const errorDescription = params.get("error_description") || error
			throw new Error(`OAuth error: ${error} - ${errorDescription}`)
		}

		// Extract code and state
		const code = params.get("code")
		const state = params.get("state")

		if (!code) {
			throw new Error("No authorization code received")
		}

		// Validate state if provided
		if (expectedState && !this.validateState(expectedState, state)) {
			throw new Error("OAuth state mismatch - possible CSRF attack")
		}

		return { code, state: state || "" }
	}

	/**
	 * Wait for OAuth callback
	 */
	async waitForCallback(server: Server, timeoutMs: number = 300000): Promise<CallbackResult> {
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error("OAuth callback timeout"))
			}, timeoutMs)

			server.once("oauth-callback", (result: CallbackResult) => {
				clearTimeout(timeout)
				resolve(result)
			})

			server.once("oauth-error", (error: Error) => {
				clearTimeout(timeout)
				reject(error)
			})
		})
	}

	/**
	 * Exchange authorization code for tokens
	 */
	async exchangeCodeForTokens(code: string): Promise<OAuthCredentials> {
		const params = new URLSearchParams({
			grant_type: "authorization_code",
			code,
			client_id: this.clientId,
			client_secret: this.clientSecret,
			redirect_uri: this.redirectUri
		})

		const response = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: params.toString()
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(`Token exchange failed: ${errorData.error || response.statusText}`)
		}

		const data = await response.json()
		
		return {
			access_token: data.access_token,
			refresh_token: data.refresh_token,
			token_type: data.token_type || "Bearer",
			expires_in: data.expires_in || 3600,
			expires_at: Date.now() + ((data.expires_in || 3600) * 1000),
			scope: data.scope || this.scopes.join(" ")
		}
	}

	/**
	 * Complete OAuth flow
	 */
	async initiateOAuthFlow(): Promise<OAuthCredentials | null> {
		try {
			// Generate state and auth URL
			const state = this.generateState()
			const authUrl = this.generateAuthUrl(state)

			// Start callback server
			const { server, port } = await this.startCallbackServer()
			
			// Update redirect URI with actual port
			this.redirectUri = `http://localhost:${port}/oauth/callback`

			try {
				// Launch browser
				await this.launchBrowser(authUrl)

				// Wait for callback
				const { code } = await this.waitForCallback(server)

				// Exchange code for tokens
				const tokens = await this.exchangeCodeForTokens(code)

				return tokens
			} finally {
				// Always close server
				server.close()
			}
		} catch (error) {
			console.error("OAuth flow failed:", error)
			throw error
		}
	}

	/**
	 * Launch browser for OAuth
	 */
	async launchBrowser(url: string): Promise<void> {
		const platform = process.platform
		let command: string
		let args: string[]

		switch (platform) {
			case "win32":
				command = "cmd"
				args = ["/c", "start", url]
				break
			case "darwin":
				command = "open"
				args = [url]
				break
			default: // linux and others
				command = "xdg-open"
				args = [url]
				break
		}

		try {
			spawn(command, args, { detached: true, stdio: "ignore" })
		} catch (error) {
			console.error("Failed to launch browser automatically. Please open this URL manually:")
			console.error(url)
			throw new Error("Browser launch failed")
		}
	}

	/**
	 * Refresh access token
	 */
	async refreshToken(refreshToken: string): Promise<OAuthCredentials | null> {
		try {
			const params = new URLSearchParams({
				grant_type: "refresh_token",
				refresh_token: refreshToken,
				client_id: this.clientId,
				client_secret: this.clientSecret
			})

			const response = await fetch("https://oauth2.googleapis.com/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				body: params.toString()
			})

			if (!response.ok) {
				console.error("Token refresh failed:", response.status, response.statusText)
				return null
			}

			const data = await response.json()
			
			return {
				access_token: data.access_token,
				refresh_token: data.refresh_token || refreshToken, // Keep old refresh token if new one not provided
				token_type: data.token_type || "Bearer",
				expires_in: data.expires_in || 3600,
				expires_at: Date.now() + ((data.expires_in || 3600) * 1000),
				scope: data.scope || this.scopes.join(" ")
			}
		} catch (error) {
			console.error("Error refreshing token:", error)
			return null
		}
	}

	/**
	 * Validate access token
	 */
	async validateToken(token: string): Promise<boolean> {
		try {
			const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`)
			return response.ok
		} catch (error) {
			return false
		}
	}

	/**
	 * Load credentials from file
	 */
	loadCredentials(): OAuthCredentials | null {
		try {
			if (!fs.existsSync(this.credentialsPath)) {
				return null
			}

			const data = fs.readFileSync(this.credentialsPath, "utf8")
			const credentials = JSON.parse(data) as OAuthCredentials

			// Check if token is expired
			if (credentials.expires_at && Date.now() >= credentials.expires_at) {
				return credentials // Return expired credentials so we can try to refresh
			}

			return credentials
		} catch (error) {
			console.error("Error loading credentials:", error)
			return null
		}
	}

	/**
	 * Save credentials to file
	 */
	saveCredentials(credentials: OAuthCredentials): void {
		try {
			this.ensureCredentialsDirectory()
			
			fs.writeFileSync(this.credentialsPath, JSON.stringify(credentials, null, 2), {
				mode: 0o600 // Read/write for owner only
			})
		} catch (error) {
			console.error("Error saving credentials:", error)
			throw error
		}
	}

	/**
	 * Ensure credentials directory exists
	 */
	private ensureCredentialsDirectory(): void {
		const dir = path.dirname(this.credentialsPath)
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
		}
	}
}