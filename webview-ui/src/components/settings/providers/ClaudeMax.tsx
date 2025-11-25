import React, { useState, useEffect } from "react"
import { VSCodeButton, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { Checkbox } from "vscrui"
import { type ProviderSettings } from "@zentara-code/types"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { vscode } from "@src/utils/vscode"
import { Slider } from "@src/components/ui"
import { useSelectedModel } from "@src/components/ui/hooks/useSelectedModel"

interface ClaudeMaxProps {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
}

export const ClaudeMax: React.FC<ClaudeMaxProps> = ({ apiConfiguration, setApiConfigurationField }) => {
	const { t } = useAppTranslation()
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [isAuthenticating, setIsAuthenticating] = useState(false)
	const [authCode, setAuthCode] = useState("")
	const [verifier, setVerifier] = useState("")
	const [waitingForCode, setWaitingForCode] = useState(false)

	const maxOutputTokens = apiConfiguration?.claudeCodeMaxOutputTokens || 8000
	const selectedModel = useSelectedModel(apiConfiguration)

	// Check if the current model supports 1M context beta
	const supports1MContextBeta = (
		selectedModel?.id === "claude-sonnet-4-20250514" ||
		selectedModel?.id === "claude-sonnet-4-5"
	)

	// Check authentication status on mount
	useEffect(() => {
		checkAuthStatus()

		// Listen for auth status messages from the extension
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			switch (message.type) {
				case "claudeMaxAuthStatus":
					setIsAuthenticated(message.success)
					break
				case "claudeMaxAuthStarted":
					setVerifier(message.verifier)
					setWaitingForCode(true)
					setIsAuthenticating(false)
					break
				case "claudeMaxAuthResult":
					setIsAuthenticated(message.success)
					setIsAuthenticating(false)
					setWaitingForCode(false)
					setAuthCode("")
					setVerifier("")
					if (!message.success && message.error) {
						// Could show error message to user
						console.error("Authentication failed:", message.error)
					}
					break
				case "claudeMaxAuthError":
					setIsAuthenticating(false)
					setWaitingForCode(false)
					console.error("Authentication error:", message.error)
					break
			}
		}

		window.addEventListener("message", handleMessage)
		return () => window.removeEventListener("message", handleMessage)
	}, [])

	const checkAuthStatus = () => {
		vscode.postMessage({ type: "claudeMaxCheckAuth" })
	}

	const startAuthentication = () => {
		setIsAuthenticating(true)
		vscode.postMessage({ type: "claudeMaxStartAuth" })
	}

	const submitAuthCode = () => {
		if (authCode && verifier) {
			setIsAuthenticating(true)
			vscode.postMessage({
				type: "claudeMaxExchangeCode",
				code: authCode,
				verifier: verifier,
			})
		}
	}

	return (
		<div className="flex flex-col gap-4">
			<div>
				<p className="text-sm text-vscode-descriptionForeground">
					{t("settings:providers.claudeMax.description")}
				</p>
			</div>

			{!isAuthenticated && !waitingForCode && (
				<div className="flex flex-col gap-2">
					<VSCodeButton
						onClick={startAuthentication}
						disabled={isAuthenticating}
						appearance="primary"
						className="w-full">
						{isAuthenticating
							? t("settings:providers.claudeMax.authenticating")
							: t("settings:providers.claudeMax.authenticate")}
					</VSCodeButton>
					<p className="text-xs text-vscode-descriptionForeground">
						{t("settings:providers.claudeMax.authDescription")}
					</p>
				</div>
			)}

			{waitingForCode && (
				<div className="flex flex-col gap-2">
					<p className="text-sm text-vscode-descriptionForeground">
						{t("settings:providers.claudeMax.codeInstructions")}
					</p>
					<VSCodeTextField
						value={authCode}
						onInput={(e: any) => setAuthCode(e.target.value)}
						placeholder={t("settings:providers.claudeMax.codePlaceholder")}
						className="w-full"
					/>
					<div className="flex gap-2">
						<VSCodeButton
							onClick={submitAuthCode}
							disabled={!authCode || isAuthenticating}
							appearance="primary">
							{isAuthenticating
								? t("settings:providers.claudeMax.submitting")
								: t("settings:providers.claudeMax.submitCode")}
						</VSCodeButton>
						<VSCodeButton
							onClick={() => {
								setWaitingForCode(false)
								setAuthCode("")
								setVerifier("")
							}}
							appearance="secondary">
							{t("settings:common.cancel")}
						</VSCodeButton>
					</div>
				</div>
			)}

			{isAuthenticated && (
				<div className="flex items-center gap-2 p-2 bg-vscode-infoBackground rounded">
					<span className="codicon codicon-check text-vscode-testing-iconPassed"></span>
					<span className="text-sm">{t("settings:providers.claudeMax.authenticated")}</span>
					<VSCodeButton onClick={startAuthentication} appearance="secondary" className="ml-auto">
						{t("settings:providers.claudeMax.reauthenticate")}
					</VSCodeButton>
				</div>
			)}

			{isAuthenticated && (
				<div className="flex items-center justify-between p-3 bg-vscode-editor-background border border-vscode-widget-border rounded">
					<div className="flex flex-col">
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium">{t("settings:providers.common.cost")}</span>
							<span className="px-2 py-1 text-xs bg-vscode-badge-background text-vscode-badge-foreground rounded-full">
								{t("settings:providers.claudeMax.subscription")}
							</span>
						</div>
						<span className="text-xs text-vscode-descriptionForeground">
							{t("settings:providers.claudeMax.subscriptionDescription")}
						</span>
					</div>
					<div className="text-lg font-mono text-vscode-testing-iconPassed">
						$0.00
					</div>
				</div>
			)}

			{isAuthenticated && (
				<div className="flex flex-col gap-1">
					<div className="font-medium">{t("settings:providers.claudeMax.maxTokensLabel")}</div>
					<div className="flex items-center gap-1">
						<Slider
							min={8000}
							max={64000}
							step={1024}
							value={[maxOutputTokens]}
							onValueChange={([value]) => setApiConfigurationField("claudeCodeMaxOutputTokens", value)}
						/>
						<div className="w-16 text-sm text-center">{maxOutputTokens}</div>
					</div>
					<p className="text-sm text-vscode-descriptionForeground mt-1">
						{t("settings:providers.claudeMax.maxTokensDescription")}
					</p>
				</div>
			)}

			{isAuthenticated && supports1MContextBeta && (
				<div>
					<Checkbox
						checked={apiConfiguration?.claudeMaxBeta1MContext ?? false}
						onChange={(checked: boolean) => {
							setApiConfigurationField("claudeMaxBeta1MContext", checked)
						}}>
						{t("settings:providers.claudeMax1MContextBetaLabel")}
					</Checkbox>
					<div className="text-sm text-vscode-descriptionForeground mt-1 ml-6">
						{t("settings:providers.claudeMax1MContextBetaDescription")}
					</div>
				</div>
			)}
		</div>
	)
}
