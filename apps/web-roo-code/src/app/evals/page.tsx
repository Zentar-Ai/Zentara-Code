import type { Metadata } from "next"

import { rooCodeSettingsSchema, getModelId } from "@zentara-code/types"

import { getRuns } from "@/db"
import { getLanguageScores } from "@/lib/server"
import { formatScore } from "@/lib"

import { Evals } from "./evals"

export const revalidate = 300

export const metadata: Metadata = {
	title: "Zentara Code Evals",
	openGraph: {
		title: "Zentara Code Evals",
		description: "Quantitative evals of LLM coding skills.",
		url: "https://zentar.ai/evals",
		siteName: "Zentara Code",
		images: {
			url: "https://i.imgur.com/ijP7aZm.png",
			width: 1954,
			height: 1088,
		},
	},
}

export default async function Page() {
	let languageScores: any = {}; // Initialize with a default value
	let rawRuns: any[] = []; // Initialize with a default value

	try {
		languageScores = await getLanguageScores();
	} catch (error) {
		console.error("Failed to get language scores during build:", error);
		// languageScores remains the default empty object
	}

	try {
		rawRuns = await getRuns();
	} catch (error) {
		console.error("Failed to get runs during build:", error);
		// rawRuns remains the default empty array
	}

	const runs = rawRuns
		.filter((run) => !!run.taskMetrics)
		.filter(({ settings }) => rooCodeSettingsSchema.safeParse(settings).success)
		.sort((a, b) => b.passed - a.passed)
		.map((run) => {
			const settings = rooCodeSettingsSchema.parse(run.settings)

			return {
				...run,
				label: run.description || run.model,
				score: formatScore(run.passed / (run.passed + run.failed)),
				languageScores: languageScores[run.id],
				taskMetrics: run.taskMetrics!,
				modelId: getModelId(settings),
			}
		})

	return <Evals runs={runs} />
}
