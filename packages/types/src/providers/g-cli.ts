import type { ModelInfo } from "../model.js"

// G CLI Provider - OAuth-based access to Google's Code Assist API
export type GCliModelId = keyof typeof gCliModels

export const gCliDefaultModelId: GCliModelId = "gemini-2.5-pro"

export const gCliModels = {
	"gemini-2.5-pro": {
		maxTokens: 8192,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
	},
	"gemini-2.5-flash": {
		maxTokens: 8192,
		contextWindow: 1_048_576,
		supportsImages: true,
		supportsPromptCache: false,
		inputPrice: 0,
		outputPrice: 0,
	},
} as const satisfies Record<string, ModelInfo>