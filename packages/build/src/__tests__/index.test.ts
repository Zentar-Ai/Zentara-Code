// npx vitest run src/__tests__/index.test.ts

import { generatePackageJson } from "../index.js"

describe("generatePackageJson", () => {
	it("should be a test", () => {
		const generatedPackageJson = generatePackageJson({
			packageJson: {
				name: "zentara-code",
				displayName: "%extension.displayName%",
				description: "%extension.description%",
				publisher: "RooVeterinaryInc",
				version: "3.17.2",
				icon: "assets/icons/icon.png",
				contributes: {
					viewsContainers: {
						activitybar: [
							{
								id: "zentara-code-ActivityBar",
								title: "%views.activitybar.title%",
								icon: "assets/icons/icon.svg",
							},
						],
					},
					views: {
						"zentara-code-ActivityBar": [
							{
								type: "webview",
								id: "zentara-code.SidebarProvider",
								name: "",
							},
						],
					},
					commands: [
						{
							command: "zentara-code.plusButtonClicked",
							title: "%command.newTask.title%",
							icon: "$(add)",
						},
						{
							command: "zentara-code.openInNewTab",
							title: "%command.openInNewTab.title%",
							category: "%configuration.title%",
						},
					],
					menus: {
						"editor/context": [
							{
								submenu: "zentara-code.contextMenu",
								group: "navigation",
							},
						],
						"zentara-code.contextMenu": [
							{
								command: "zentara-code.addToContext",
								group: "1_actions@1",
							},
						],
						"editor/title": [
							{
								command: "zentara-code.plusButtonClicked",
								group: "navigation@1",
								when: "activeWebviewPanelId == zentara-code.TabPanelProvider",
							},
							{
								command: "zentara-code.settingsButtonClicked",
								group: "navigation@6",
								when: "activeWebviewPanelId == zentara-code.TabPanelProvider",
							},
							{
								command: "zentara-code.accountButtonClicked",
								group: "navigation@6",
								when: "activeWebviewPanelId == zentara-code.TabPanelProvider && config.zentara-code.rooCodeCloudEnabled",
							},
						],
					},
					submenus: [
						{
							id: "zentara-code.contextMenu",
							label: "%views.contextMenu.label%",
						},
						{
							id: "zentara-code.terminalMenu",
							label: "%views.terminalMenu.label%",
						},
					],
					configuration: {
						title: "%configuration.title%",
						properties: {
							"zentara-code.allowedCommands": {
								type: "array",
								items: {
									type: "string",
								},
								default: ["npm test", "npm install", "tsc", "git log", "git diff", "git show"],
								description: "%commands.allowedCommands.description%",
							},
							"zentara-code.customStoragePath": {
								type: "string",
								default: "",
								description: "%settings.customStoragePath.description%",
							},
						},
					},
				},
				scripts: {
					lint: "eslint **/*.ts",
				},
			},
			overrideJson: {
				name: "zentara-code-nightly",
				displayName: "Zentara Code Nightly",
				publisher: "RooVeterinaryInc",
				version: "0.0.1",
				icon: "assets/icons/icon-nightly.png",
				scripts: {},
			},
			substitution: ["zentara-code", "zentara-code-nightly"],
		})

		expect(generatedPackageJson).toStrictEqual({
			name: "zentara-code-nightly",
			displayName: "Zentara Code Nightly",
			description: "%extension.description%",
			publisher: "RooVeterinaryInc",
			version: "0.0.1",
			icon: "assets/icons/icon-nightly.png",
			contributes: {
				viewsContainers: {
					activitybar: [
						{
							id: "zentara-code-nightly-ActivityBar",
							title: "%views.activitybar.title%",
							icon: "assets/icons/icon.svg",
						},
					],
				},
				views: {
					"zentara-code-nightly-ActivityBar": [
						{
							type: "webview",
							id: "zentara-code-nightly.SidebarProvider",
							name: "",
						},
					],
				},
				commands: [
					{
						command: "zentara-code-nightly.plusButtonClicked",
						title: "%command.newTask.title%",
						icon: "$(add)",
					},
					{
						command: "zentara-code-nightly.openInNewTab",
						title: "%command.openInNewTab.title%",
						category: "%configuration.title%",
					},
				],
				menus: {
					"editor/context": [
						{
							submenu: "zentara-code-nightly.contextMenu",
							group: "navigation",
						},
					],
					"zentara-code-nightly.contextMenu": [
						{
							command: "zentara-code-nightly.addToContext",
							group: "1_actions@1",
						},
					],
					"editor/title": [
						{
							command: "zentara-code-nightly.plusButtonClicked",
							group: "navigation@1",
							when: "activeWebviewPanelId == zentara-code-nightly.TabPanelProvider",
						},
						{
							command: "zentara-code-nightly.settingsButtonClicked",
							group: "navigation@6",
							when: "activeWebviewPanelId == zentara-code-nightly.TabPanelProvider",
						},
						{
							command: "zentara-code-nightly.accountButtonClicked",
							group: "navigation@6",
							when: "activeWebviewPanelId == zentara-code-nightly.TabPanelProvider && config.zentara-code-nightly.rooCodeCloudEnabled",
						},
					],
				},
				submenus: [
					{
						id: "zentara-code-nightly.contextMenu",
						label: "%views.contextMenu.label%",
					},
					{
						id: "zentara-code-nightly.terminalMenu",
						label: "%views.terminalMenu.label%",
					},
				],
				configuration: {
					title: "%configuration.title%",
					properties: {
						"zentara-code-nightly.allowedCommands": {
							type: "array",
							items: {
								type: "string",
							},
							default: ["npm test", "npm install", "tsc", "git log", "git diff", "git show"],
							description: "%commands.allowedCommands.description%",
						},
						"zentara-code-nightly.customStoragePath": {
							type: "string",
							default: "",
							description: "%settings.customStoragePath.description%",
						},
					},
				},
			},
			scripts: {},
		})
	})
})
