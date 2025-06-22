// import { EventEmitter } from "events"; // Interface now defines event methods directly

import type { ProviderSettings, GlobalSettings, ClineMessage, TokenUsage, ZentaraCodeEvents } from "./types"
export type { ZentaraCodeSettings, ProviderSettings, GlobalSettings, ClineMessage, TokenUsage, ZentaraCodeEvents }

import { ZentaraCodeEventName } from "../schemas"
export type { ZentaraCodeEventName }

type ZentaraCodeSettings = GlobalSettings & ProviderSettings

export interface ZentaraCodeAPI {
	// Typed Event Emitter methods based on Node.js EventEmitter signature, adapted for ZentaraCodeEvents
	addListener<K extends keyof ZentaraCodeEvents>(eventName: K, listener: (...args: ZentaraCodeEvents[K]) => void): this
	on<K extends keyof ZentaraCodeEvents>(eventName: K, listener: (...args: ZentaraCodeEvents[K]) => void): this
	once<K extends keyof ZentaraCodeEvents>(eventName: K, listener: (...args: ZentaraCodeEvents[K]) => void): this
	removeListener<K extends keyof ZentaraCodeEvents>(eventName: K, listener: (...args: ZentaraCodeEvents[K]) => void): this
	off<K extends keyof ZentaraCodeEvents>(eventName: K, listener: (...args: ZentaraCodeEvents[K]) => void): this
	removeAllListeners(eventName?: keyof ZentaraCodeEvents): this
	setMaxListeners(n: number): this
	getMaxListeners(): number
	listeners<K extends keyof ZentaraCodeEvents>(eventName: K): ((...args: ZentaraCodeEvents[K]) => void)[]
	rawListeners<K extends keyof ZentaraCodeEvents>(eventName: K): ((...args: ZentaraCodeEvents[K]) => void)[]
	emit<K extends keyof ZentaraCodeEvents>(eventName: K, ...args: ZentaraCodeEvents[K]): boolean
	listenerCount(eventName: keyof ZentaraCodeEvents, listener?: (...args: any[]) => void): number
	prependListener<K extends keyof ZentaraCodeEvents>(eventName: K, listener: (...args: ZentaraCodeEvents[K]) => void): this
	prependOnceListener<K extends keyof ZentaraCodeEvents>(
		eventName: K,
		listener: (...args: ZentaraCodeEvents[K]) => void,
	): this
	eventNames(): (keyof ZentaraCodeEvents)[]
	/**
	 * Starts a new task with an optional initial message and images.
	 * @param task Optional initial task message.
	 * @param images Optional array of image data URIs (e.g., "data:image/webp;base64,...").
	 * @returns The ID of the new task.
	 */
	startNewTask({
		configuration,
		text,
		images,
		newTab,
	}: {
		configuration?: ZentaraCodeSettings
		text?: string
		images?: string[]
		newTab?: boolean
	}): Promise<string>

	/**
	 * Resumes a task with the given ID.
	 * @param taskId The ID of the task to resume.
	 * @throws Error if the task is not found in the task history.
	 */
	resumeTask(taskId: string): Promise<void>

	/**
	 * Checks if a task with the given ID is in the task history.
	 * @param taskId The ID of the task to check.
	 * @returns True if the task is in the task history, false otherwise.
	 */
	isTaskInHistory(taskId: string): Promise<boolean>

	/**
	 * Returns the current task stack.
	 * @returns An array of task IDs.
	 */
	getCurrentTaskStack(): string[]

	/**
	 * Clears the current task.
	 */
	clearCurrentTask(lastMessage?: string): Promise<void>

	/**
	 * Cancels the current task.
	 */
	cancelCurrentTask(): Promise<void>

	/**
	 * Sends a message to the current task.
	 * @param message Optional message to send.
	 * @param images Optional array of image data URIs (e.g., "data:image/webp;base64,...").
	 */
	sendMessage(message?: string, images?: string[]): Promise<void>

	/**
	 * Simulates pressing the primary button in the chat interface.
	 */
	pressPrimaryButton(): Promise<void>

	/**
	 * Simulates pressing the secondary button in the chat interface.
	 */
	pressSecondaryButton(): Promise<void>

	/**
	 * Returns the current configuration.
	 * @returns The current configuration.
	 */
	getConfiguration(): ZentaraCodeSettings

	/**
	 * Sets the configuration for the current task.
	 * @param values An object containing key-value pairs to set.
	 */
	setConfiguration(values: ZentaraCodeSettings): Promise<void>

	/**
	 * Creates a new API configuration profile
	 * @param name The name of the profile
	 * @returns The ID of the created profile
	 */
	createProfile(name: string): Promise<string>

	/**
	 * Returns a list of all configured profile names
	 * @returns Array of profile names
	 */
	getProfiles(): string[]

	/**
	 * Changes the active API configuration profile
	 * @param name The name of the profile to activate
	 * @throws Error if the profile does not exist
	 */
	setActiveProfile(name: string): Promise<void>

	/**
	 * Returns the name of the currently active profile
	 * @returns The profile name, or undefined if no profile is active
	 */
	getActiveProfile(): string | undefined

	/**
	 * Deletes a profile by name
	 * @param name The name of the profile to delete
	 * @throws Error if the profile does not exist
	 */
	deleteProfile(name: string): Promise<void>

	/**
	 * Returns true if the API is ready to use.
	 */
	isReady(): boolean
}
