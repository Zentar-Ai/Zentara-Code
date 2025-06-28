import { useCallback, useState, useEffect } from "react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

import type { ProviderSettings } from "@zentara-code/types"

import { useAppTranslation } from "@src/i18n/TranslationContext"
import { vscode } from "@src/utils/vscode"

type GCliProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
}

type AuthStatus = "checking" | "not_authenticated" | "authenticated" | "authenticating" | "error"

export const GCli = ({ apiConfiguration, setApiConfigurationField }: GCliProps) => {
	const { t } = useAppTranslation()
	const [authStatus, setAuthStatus] = useState<AuthStatus>("checking")
	const [userEmail, setUserEmail] = useState<string>("")
	const [projectId, setProjectId] = useState<string>("")
	const [errorMessage, setErrorMessage] = useState<string>("")

	// Check authentication status on component mount and listen for responses
	useEffect(() => {
		checkAuthStatus()

		// Listen for messages from the extension
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			
			switch (message.type) {
				case "gCliAuthStatus":
					if (message.success) {
						setAuthStatus("authenticated")
						setUserEmail(message.userEmail || "")
						setProjectId(message.projectId || "")
						// Set default model to gemini-2.5-pro if not already set
						if (!apiConfiguration.apiModelId) {
							setApiConfigurationField("apiModelId", "gemini-2.5-pro")
						}
					} else {
						setAuthStatus("not_authenticated")
						setUserEmail("")
						setProjectId("")
					}
					break
					
				case "gCliAuthResult":
					if (message.success) {
						setAuthStatus("authenticated")
						setUserEmail(message.userEmail || "")
						setProjectId(message.projectId || "")
						// Set default model to gemini-2.5-pro if not already set
						if (!apiConfiguration.apiModelId) {
							setApiConfigurationField("apiModelId", "gemini-2.5-pro")
						}
					} else {
						setAuthStatus("error")
						setErrorMessage(message.error || "Authentication failed")
					}
					break
					
				case "gCliAuthError":
					setAuthStatus("error")
					setErrorMessage(message.error || "Authentication failed")
					break
			}
		}

		window.addEventListener("message", handleMessage)
		return () => window.removeEventListener("message", handleMessage)
	}, [])

	const checkAuthStatus = useCallback(async () => {
		setAuthStatus("checking")
		setErrorMessage("")
		
		try {
			// Call backend to check if we have valid credentials
			vscode.postMessage({ type: "gCliCheckAuth" })
		} catch (error) {
			setAuthStatus("error")
			setErrorMessage(error instanceof Error ? error.message : "Failed to check authentication status")
		}
	}, [])

	const handleAuthenticate = useCallback(async () => {
		setAuthStatus("authenticating")
		setErrorMessage("")
		
		try {
			// Call backend OAuth flow
			vscode.postMessage({ type: "gCliAuthenticate" })
		} catch (error) {
			setAuthStatus("error")
			setErrorMessage(error instanceof Error ? error.message : "Authentication failed")
		}
	}, [])

	const handleReauthenticate = useCallback(async () => {
		setAuthStatus("authenticating")
		setErrorMessage("")
		
		try {
			// Call backend to clear credentials and start fresh OAuth flow
			vscode.postMessage({ type: "gCliReauthenticate" })
		} catch (error) {
			setAuthStatus("error")
			setErrorMessage(error instanceof Error ? error.message : "Re-authentication failed")
		}
	}, [])

	const renderAuthStatus = () => {
		switch (authStatus) {
			case "checking":
				return (
					<div className="flex items-center gap-2 p-3 bg-vscode-input-background rounded">
						<div className="text-sm text-vscode-descriptionForeground">
							🔍 Checking authentication status...
						</div>
					</div>
				)

			case "not_authenticated":
				return (
					<div className="flex flex-col gap-3 p-3 bg-vscode-input-background rounded">
						<div className="flex items-center gap-2">
							<span className="text-sm">🔐</span>
							<span className="text-sm font-medium text-vscode-foreground">
								Ready to authenticate
							</span>
						</div>
						<div className="text-sm text-vscode-descriptionForeground">
							Click below to authenticate with Google. This will open your browser once to complete setup.
						</div>
						<VSCodeButton
							onClick={handleAuthenticate}
							appearance="primary"
							className="w-fit"
						>
							Authenticate with Google
						</VSCodeButton>
					</div>
				)

			case "authenticated":
				return (
					<div className="flex flex-col gap-3 p-3 bg-green-900/20 rounded border border-green-500/30">
						<div className="flex items-center gap-2">
							<span className="text-sm text-green-400">✅</span>
							<span className="text-sm font-medium text-vscode-foreground">
								Authenticated and ready
							</span>
						</div>
						<div className="text-sm text-vscode-descriptionForeground space-y-1">
							<div><strong>Account:</strong> {userEmail}</div>
							<div><strong>Project:</strong> {projectId}</div>
						</div>
						<div className="text-xs text-vscode-descriptionForeground">
							CLI is ready to use. Your credentials are automatically managed.
						</div>
						<VSCodeButton
							onClick={handleReauthenticate}
							appearance="secondary"
							className="w-fit"
						>
							Switch Account / Re-authenticate
						</VSCodeButton>
					</div>
				)

			case "authenticating":
				return (
					<div className="flex flex-col gap-3 p-3 bg-blue-900/20 rounded border border-blue-500/30">
						<div className="flex items-center gap-2">
							<span className="text-sm">🔄</span>
							<span className="text-sm font-medium text-vscode-foreground">
								Authenticating...
							</span>
						</div>
						<div className="text-sm text-vscode-descriptionForeground">
							Please complete the authentication process in your browser. This window will update automatically when done.
						</div>
					</div>
				)

			case "error":
				return (
					<div className="flex flex-col gap-3 p-3 bg-red-900/20 rounded border border-red-500/30">
						<div className="flex items-center gap-2">
							<span className="text-sm text-red-400">❌</span>
							<span className="text-sm font-medium text-red-400">Authentication Error</span>
						</div>
						{errorMessage && (
							<div className="text-sm text-vscode-descriptionForeground bg-red-900/30 p-2 rounded">
								{errorMessage}
							</div>
						)}
						<div className="flex gap-2">
							<VSCodeButton
								onClick={handleAuthenticate}
								appearance="primary"
								className="w-fit"
							>
								Try Again
							</VSCodeButton>
							<VSCodeButton
								onClick={checkAuthStatus}
								appearance="secondary"
								className="w-fit"
							>
								Refresh Status
							</VSCodeButton>
						</div>
					</div>
				)

			default:
				return null
		}
	}

	return (
		<>
			<div className="text-sm text-vscode-descriptionForeground mb-4">
				<strong>GCLI</strong> - OAuth authentication with GCLI provider.
			</div>

			<div className="mb-4 p-4 bg-yellow-900/20 rounded border border-yellow-500/30">
				<div className="flex items-start gap-2 mb-3">
					<span className="text-yellow-400 text-sm mt-0.5">⚠️</span>
					<span className="text-sm font-medium text-yellow-400">Privacy Notice</span>
				</div>
				<div className="text-xs text-vscode-descriptionForeground space-y-3 leading-relaxed">


					<p className="font-medium text-red-300 mt-3 pt-3 border-t border-yellow-500/30">
						GCLI provider may collect your data for training. Use at your own risk. Zentara Code and Zentar.AI do not bear any legal responsibility for data handling, privacy, or any issues arising from the use of GCLI  or other third party service.
					</p>
				</div>
			</div>

			{renderAuthStatus()}

			<div className="text-xs text-vscode-descriptionForeground mt-4 p-3 bg-vscode-textBlockQuote-background rounded">
				<strong>How it works:</strong>
				<ul className="list-disc list-inside mt-1 space-y-1">
					<li>Uses automatic OAuth authentication (no API keys needed)</li>
					<li>Works with any Google account</li>
					<li>Switch accounts anytime using the re-authenticate button</li>
				</ul>
			</div>
		</>
	)
}