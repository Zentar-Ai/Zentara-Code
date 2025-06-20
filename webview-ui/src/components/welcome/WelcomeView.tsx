import { useCallback, useState, useRef } from "react"
import knuthShuffle from "knuth-shuffle-seeded"
import { Trans } from "react-i18next"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"

import type { ProviderSettings } from "@zentara-code/types"

import { useExtensionState } from "@src/context/ExtensionStateContext"
import { validateApiConfiguration } from "@src/utils/validate"
import { vscode } from "@src/utils/vscode"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { getRequestyAuthUrl, getOpenRouterAuthUrl } from "@src/oauth/urls"

import ApiOptions from "../settings/ApiOptions"
import { Tab, TabContent } from "../common/Tab"

import ZentaraHero from "./ZentaraHero"

const WelcomeView = () => {
	const { apiConfiguration, currentApiConfigName, setApiConfiguration, uriScheme, machineId } = useExtensionState()
	const { t } = useAppTranslation()
	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
	const wasTextSelectedInMouseEvent = useRef(false)
	const mouseDownPositionRef = useRef<{ x: number; y: number } | null>(null)

	// Memoize the setApiConfigurationField function to pass to ApiOptions
	const setApiConfigurationFieldForApiOptions = useCallback(
		<K extends keyof ProviderSettings>(field: K, value: ProviderSettings[K]) => {
			setApiConfiguration({ [field]: value })
		},
		[setApiConfiguration], // setApiConfiguration from context is stable
	)

	const handleSubmit = useCallback(() => {
		const error = apiConfiguration ? validateApiConfiguration(apiConfiguration) : undefined

		if (error) {
			setErrorMessage(error)
			return
		}

		setErrorMessage(undefined)
		vscode.postMessage({ type: "upsertApiConfiguration", text: currentApiConfigName, apiConfiguration })
	}, [apiConfiguration, currentApiConfigName])

	// Using a lazy initializer so it reads once at mount
	const [imagesBaseUri] = useState(() => {
		const w = window as any
		return w.IMAGES_BASE_URI || ""
	})

	return (
		<Tab>
			<TabContent className="flex flex-col gap-5">
				<ZentaraHero />
				<h2 className="mx-auto">{t("chat:greeting")}</h2>

				<div className="outline rounded p-4">
					<Trans i18nKey="welcome:introduction" />
				</div>

				<div className="mb-4">
					<h4 className="mt-3 mb-2 text-center">{t("welcome:startRouter")}</h4>

					<div className="flex gap-4">
						{/* Define the providers */}
						{(() => {
							// Provider card configuration
							const providers = [
								{
									slug: "requesty",
									name: "Requesty",
									description: t("welcome:routers.requesty.description"),
									incentive: t("welcome:routers.requesty.incentive"),
									authUrl: getRequestyAuthUrl(uriScheme),
								},
								{
									slug: "openrouter",
									name: "OpenRouter",
									description: t("welcome:routers.openrouter.description"),
									authUrl: getOpenRouterAuthUrl(uriScheme),
								},
							]

							// Shuffle providers based on machine ID (will be consistent for the same machine)
							const orderedProviders = [...providers]
							knuthShuffle(orderedProviders, (machineId as any) || Date.now())

							// Render the provider cards
							return orderedProviders.map((provider, index) => (
								<a
									key={index}
									href={provider.authUrl}
									className="flex-1 border border-vscode-panel-border rounded p-4 flex flex-col items-center cursor-pointer transition-all  no-underline text-inherit"
									target="_blank"
									rel="noopener noreferrer"
									onMouseDown={(event: React.MouseEvent) => {
										// Store mouse down position
										mouseDownPositionRef.current = { x: event.clientX, y: event.clientY }
										// Reset selection flag on mouse down
										wasTextSelectedInMouseEvent.current = false
									}}
									onMouseUp={(event: React.MouseEvent) => {
										const DRAG_THRESHOLD = 5 // pixels
										let dragged = false
										if (mouseDownPositionRef.current) {
											const deltaX = Math.abs(event.clientX - mouseDownPositionRef.current.x)
											const deltaY = Math.abs(event.clientY - mouseDownPositionRef.current.y)
											if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
												dragged = true
											}
										}

										// Check if text was selected or if mouse was dragged
										if (window.getSelection()?.toString().trim() || dragged) {
											wasTextSelectedInMouseEvent.current = true
										}
										mouseDownPositionRef.current = null // Reset for next interaction
									}}
									onClick={(event: React.MouseEvent) => {
										if (wasTextSelectedInMouseEvent.current) {
											// If text was selected or mouse dragged, prevent navigation.
											event.preventDefault()
											// The flag will be reset by the next onMouseDown.
											return
										}
										// Otherwise, allow default link behavior (navigation)
									}}>
									<div className="font-bold">{provider.name}</div>
									<div className="w-16 h-16 flex items-center justify-center rounded m-2 overflow-hidden relative">
										<img
											src={`${imagesBaseUri}/${provider.slug}.png`}
											alt={provider.name}
											className="w-full h-full object-contain p-2"
										/>
									</div>
									<div className="text-center">
										<div className="text-xs text-vscode-descriptionForeground">
											{provider.description}
										</div>
										{provider.incentive && (
											<div className="text-xs font-bold">{provider.incentive}</div>
										)}
									</div>
								</a>
							))
						})()}
					</div>

					<div className="text-center my-4 text-xl uppercase font-bold">{t("welcome:or")}</div>
					<h4 className="mt-3 mb-2 text-center">{t("welcome:startCustom")}</h4>
					<ApiOptions
						fromWelcomeView
						apiConfiguration={apiConfiguration || {}}
						uriScheme={uriScheme}
						setApiConfigurationField={setApiConfigurationFieldForApiOptions}
						errorMessage={errorMessage}
						setErrorMessage={setErrorMessage}
					/>
				</div>
			</TabContent>
			<div className="sticky bottom-0 bg-vscode-sideBar-background p-5">
				<div className="flex flex-col gap-1">
					<div className="flex justify-end">
						<VSCodeLink
							href="#"
							onClick={(e) => {
								e.preventDefault()
								vscode.postMessage({ type: "importSettings" })
							}}
							className="text-sm">
							{t("welcome:importSettings")}
						</VSCodeLink>
					</div>
					<VSCodeButton onClick={handleSubmit} appearance="primary">
						{t("welcome:start")}
					</VSCodeButton>
					{errorMessage && <div className="text-vscode-errorForeground">{errorMessage}</div>}
				</div>
			</div>
		</Tab>
	)
}

export default WelcomeView
