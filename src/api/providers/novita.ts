import { type NovitaModelId, novitaDefaultModelId, novitaModels } from "@zentara-code/types"

import type { ApiHandlerOptions } from "../../shared/api"

import { OpenAiHandler } from "./openai"

export class NovitaHandler extends OpenAiHandler {
	constructor(options: ApiHandlerOptions) {
		super({
			...options,
			openAiApiKey: options.novitaApiKey ?? "not-provided",
			openAiModelId: options.apiModelId ?? novitaDefaultModelId,
			openAiBaseUrl: options.novitaBaseUrl ?? "https://api.novita.ai/openai/v1",
			openAiStreamingEnabled: true,
			includeMaxTokens: true,
		})
	}

	override getModel() {
		const id = this.options.apiModelId ?? novitaDefaultModelId
		const info = novitaModels[id as keyof typeof novitaModels] || novitaModels[novitaDefaultModelId]
		return { id, info }
	}

	protected override processUsageMetrics(usage: any): any {
		return {
			type: "usage",
			inputTokens: usage?.prompt_tokens || 0,
			outputTokens: usage?.completion_tokens || 0,
			cacheWriteTokens: usage?.prompt_tokens_details?.cache_miss_tokens,
			cacheReadTokens: usage?.prompt_tokens_details?.cached_tokens,
		}
	}
}
