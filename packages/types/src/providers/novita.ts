import type { ModelInfo } from "../model.js"
export type NovitaModelId = "deepseek/deepseek-v3.2" | "zai-org/glm-5" | "minimax/minimax-m2.5"

export const novitaDefaultModelId: NovitaModelId = "deepseek/deepseek-v3.2"

export const novitaModels = {
	"deepseek/deepseek-v3.2": {
		maxTokens: 8192,
		contextWindow: 64000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.14,
		outputPrice: 0.28,
		description: "DeepSeek V3.2 model from Novita",
	},
	"zai-org/glm-5": {
		maxTokens: 8192,
		contextWindow: 128000,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.5,
		outputPrice: 0.5,
		description: "GLM-5 model from Zhipu AI",
	},
	"minimax/minimax-m2.5": {
		maxTokens: 8192,
		contextWindow: 32768,
		supportsImages: false,
		supportsPromptCache: false,
		inputPrice: 0.7,
		outputPrice: 0.7,
		description: "MiniMax M2.5 model",
	},
} as const satisfies Record<string, ModelInfo>
