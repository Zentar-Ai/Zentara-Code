/**
 * G CLI Onboarding Manager
 * Handles the proper onboarding flow for Google Code Assist API
 */

export interface OnboardingResult {
	projectId: string
	tier: any
	status: any
}

export class GCliOnboardingManager {
	/**
	 * Setup user following G CLI flow and get project ID
	 */
	async setupUserAndGetProjectId(token: string): Promise<string | null> {
		try {
			console.log("🔍 Starting user setup and onboarding flow...")
			
			let projectId: string | null = null // No GOOGLE_CLOUD_PROJECT env var
			
			// Step 1: Load Code Assist
			console.log("🔍 Step 1: Loading Code Assist...")
			const clientMetadata = {
				ideType: "IDE_UNSPECIFIED",
				platform: "PLATFORM_UNSPECIFIED",
				pluginType: "GEMINI",
				duetProject: projectId
			}
			
			const loadResponse = await fetch("https://cloudcode-pa.googleapis.com/v1internal:loadCodeAssist", {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json",
					"User-Agent": "gCLI/0.1.5 (linux; x64)"
				},
				body: JSON.stringify({
					cloudaicompanionProject: projectId,
					metadata: clientMetadata
				})
			})
			
			console.log("🔍 Load response status:", loadResponse.status)
			const loadData = await loadResponse.json()
			console.log("🔍 Load response:", JSON.stringify(loadData, null, 2))
			
			// If no project ID and response contains one, use it
			if (!projectId && loadData.cloudaicompanionProject) {
				projectId = loadData.cloudaicompanionProject
				console.log("🔍 Using project ID from load response:", projectId)
			}
			
			// Step 2: Get onboard tier
			let tier: any = null
			if (loadData.currentTier) {
				tier = loadData.currentTier
				console.log("🔍 Using current tier:", tier.id)
			} else {
				// Find default tier
				for (const allowedTier of loadData.allowedTiers || []) {
					if (allowedTier.isDefault) {
						tier = allowedTier
						console.log("🔍 Using default tier:", tier.id)
						break
					}
				}
			}
			
			if (!tier) {
				console.error("❌ No tier found")
				return null
			}
			
			// Check if tier requires user-defined project
			if (tier.userDefinedCloudaicompanionProject && !projectId) {
				console.error("❌ This tier requires GOOGLE_CLOUD_PROJECT env var")
				return null
			}
			
			// Step 3: Onboard user
			console.log("🔍 Step 2: Onboarding user...")
			const onboardRequest = {
				tierId: tier.id,
				cloudaicompanionProject: projectId,
				metadata: clientMetadata
			}
			
			console.log("🔍 Onboard request:", JSON.stringify(onboardRequest, null, 2))
			
			// Poll onboardUser until complete
			const maxAttempts = 10
			for (let attempt = 0; attempt < maxAttempts; attempt++) {
				const onboardResponse = await fetch("https://cloudcode-pa.googleapis.com/v1internal:onboardUser", {
					method: "POST",
					headers: {
						"Authorization": `Bearer ${token}`,
						"Content-Type": "application/json",
						"User-Agent": "gCLI/0.1.5 (linux; x64)"
					},
					body: JSON.stringify(onboardRequest)
				})
				
				console.log(`🔍 Onboard attempt ${attempt + 1} status:`, onboardResponse.status)
				const onboardData = await onboardResponse.json()
				console.log("🔍 Onboard response:", JSON.stringify(onboardData, null, 2))
				
				if (onboardData.done) {
					const finalProjectId = onboardData.response?.cloudaicompanionProject?.id || ""
					console.log("🔍 Final project ID:", finalProjectId)
					return finalProjectId
				}
				
				console.log("🔍 Onboarding not complete, waiting 5 seconds...")
				await new Promise(resolve => setTimeout(resolve, 5000))
			}
			
			console.error("❌ Onboarding timed out")
			return null
			
		} catch (error) {
			console.error("❌ Error in user setup:", error)
			return null
		}
	}

	/**
	 * Get full onboarding result with additional details
	 */
	async getOnboardingResult(token: string): Promise<OnboardingResult | null> {
		// This could be extended to return more details about the onboarding process
		const projectId = await this.setupUserAndGetProjectId(token)
		if (!projectId) {
			return null
		}
		
		return {
			projectId,
			tier: { id: "free-tier" }, // This would be populated from the actual onboarding
			status: { success: true }
		}
	}
}