import { z } from "zod"

import { clineMessageSchema, tokenUsageSchema } from "./message.js"
import { toolNamesSchema, toolUsageSchema } from "./tool.js"
import { zentaraCodeSettingsSchema } from "./global-settings.js"

/**
 * isSubtaskSchema
 */
export const isSubtaskSchema = z.object({
	isSubtask: z.boolean(),
})
export type IsSubtask = z.infer<typeof isSubtaskSchema>

/**
 * ZentaraCodeEvent
 */

export enum ZentaraCodeEventName {
	Message = "message",
	TaskCreated = "taskCreated",
	TaskStarted = "taskStarted",
	TaskModeSwitched = "taskModeSwitched",
	TaskPaused = "taskPaused",
	TaskUnpaused = "taskUnpaused",
	TaskAskResponded = "taskAskResponded",
	TaskAborted = "taskAborted",
	TaskSpawned = "taskSpawned",
	TaskCompleted = "taskCompleted",
	TaskTokenUsageUpdated = "taskTokenUsageUpdated",
	TaskToolFailed = "taskToolFailed",
	EvalPass = "evalPass",
	EvalFail = "evalFail",
}

export const zentaraCodeEventsSchema = z.object({
	[ZentaraCodeEventName.Message]: z.tuple([
		z.object({
			taskId: z.string(),
			action: z.union([z.literal("created"), z.literal("updated")]),
			message: clineMessageSchema,
		}),
	]),
	[ZentaraCodeEventName.TaskCreated]: z.tuple([z.string()]),
	[ZentaraCodeEventName.TaskStarted]: z.tuple([z.string()]),
	[ZentaraCodeEventName.TaskModeSwitched]: z.tuple([z.string(), z.string()]),
	[ZentaraCodeEventName.TaskPaused]: z.tuple([z.string()]),
	[ZentaraCodeEventName.TaskUnpaused]: z.tuple([z.string()]),
	[ZentaraCodeEventName.TaskAskResponded]: z.tuple([z.string()]),
	[ZentaraCodeEventName.TaskAborted]: z.tuple([z.string()]),
	[ZentaraCodeEventName.TaskSpawned]: z.tuple([z.string(), z.string()]),
	[ZentaraCodeEventName.TaskCompleted]: z.tuple([z.string(), tokenUsageSchema, toolUsageSchema, isSubtaskSchema]),
	[ZentaraCodeEventName.TaskTokenUsageUpdated]: z.tuple([z.string(), tokenUsageSchema]),
	[ZentaraCodeEventName.TaskToolFailed]: z.tuple([z.string(), toolNamesSchema, z.string()]),
})

export type ZentaraCodeEvents = z.infer<typeof zentaraCodeEventsSchema>

/**
 * Ack
 */

export const ackSchema = z.object({
	clientId: z.string(),
	pid: z.number(),
	ppid: z.number(),
})

export type Ack = z.infer<typeof ackSchema>

/**
 * TaskCommand
 */

export enum TaskCommandName {
	StartNewTask = "StartNewTask",
	CancelTask = "CancelTask",
	CloseTask = "CloseTask",
}

export const taskCommandSchema = z.discriminatedUnion("commandName", [
	z.object({
		commandName: z.literal(TaskCommandName.StartNewTask),
		data: z.object({
			configuration: zentaraCodeSettingsSchema,
			text: z.string(),
			images: z.array(z.string()).optional(),
			newTab: z.boolean().optional(),
		}),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.CancelTask),
		data: z.string(),
	}),
	z.object({
		commandName: z.literal(TaskCommandName.CloseTask),
		data: z.string(),
	}),
])

export type TaskCommand = z.infer<typeof taskCommandSchema>

/**
 * TaskEvent
 */

export const taskEventSchema = z.discriminatedUnion("eventName", [
	z.object({
		eventName: z.literal(ZentaraCodeEventName.Message),
		payload: zentaraCodeEventsSchema.shape[ZentaraCodeEventName.Message],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ZentaraCodeEventName.TaskCreated),
		payload: zentaraCodeEventsSchema.shape[ZentaraCodeEventName.TaskCreated],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ZentaraCodeEventName.TaskStarted),
		payload: zentaraCodeEventsSchema.shape[ZentaraCodeEventName.TaskStarted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ZentaraCodeEventName.TaskModeSwitched),
		payload: zentaraCodeEventsSchema.shape[ZentaraCodeEventName.TaskModeSwitched],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ZentaraCodeEventName.TaskPaused),
		payload: zentaraCodeEventsSchema.shape[ZentaraCodeEventName.TaskPaused],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ZentaraCodeEventName.TaskUnpaused),
		payload: zentaraCodeEventsSchema.shape[ZentaraCodeEventName.TaskUnpaused],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ZentaraCodeEventName.TaskAskResponded),
		payload: zentaraCodeEventsSchema.shape[ZentaraCodeEventName.TaskAskResponded],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ZentaraCodeEventName.TaskAborted),
		payload: zentaraCodeEventsSchema.shape[ZentaraCodeEventName.TaskAborted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ZentaraCodeEventName.TaskSpawned),
		payload: zentaraCodeEventsSchema.shape[ZentaraCodeEventName.TaskSpawned],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ZentaraCodeEventName.TaskCompleted),
		payload: zentaraCodeEventsSchema.shape[ZentaraCodeEventName.TaskCompleted],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ZentaraCodeEventName.TaskTokenUsageUpdated),
		payload: zentaraCodeEventsSchema.shape[ZentaraCodeEventName.TaskTokenUsageUpdated],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ZentaraCodeEventName.TaskToolFailed),
		payload: zentaraCodeEventsSchema.shape[ZentaraCodeEventName.TaskToolFailed],
		taskId: z.number().optional(),
	}),
	z.object({
		eventName: z.literal(ZentaraCodeEventName.EvalPass),
		payload: z.undefined(),
		taskId: z.number(),
	}),
	z.object({
		eventName: z.literal(ZentaraCodeEventName.EvalFail),
		payload: z.undefined(),
		taskId: z.number(),
	}),
])

export type TaskEvent = z.infer<typeof taskEventSchema>

/**
 * IpcMessage
 */

export enum IpcMessageType {
	Connect = "Connect",
	Disconnect = "Disconnect",
	Ack = "Ack",
	TaskCommand = "TaskCommand",
	TaskEvent = "TaskEvent",
}

export enum IpcOrigin {
	Client = "client",
	Server = "server",
}

export const ipcMessageSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal(IpcMessageType.Ack),
		origin: z.literal(IpcOrigin.Server),
		data: ackSchema,
	}),
	z.object({
		type: z.literal(IpcMessageType.TaskCommand),
		origin: z.literal(IpcOrigin.Client),
		clientId: z.string(),
		data: taskCommandSchema,
	}),
	z.object({
		type: z.literal(IpcMessageType.TaskEvent),
		origin: z.literal(IpcOrigin.Server),
		relayClientId: z.string().optional(),
		data: taskEventSchema,
	}),
])

export type IpcMessage = z.infer<typeof ipcMessageSchema>

/**
 * Client
 */

export type IpcClientEvents = {
	[IpcMessageType.Connect]: []
	[IpcMessageType.Disconnect]: []
	[IpcMessageType.Ack]: [data: Ack]
	[IpcMessageType.TaskCommand]: [data: TaskCommand]
	[IpcMessageType.TaskEvent]: [data: TaskEvent]
}

/**
 * Server
 */

export type IpcServerEvents = {
	[IpcMessageType.Connect]: [clientId: string]
	[IpcMessageType.Disconnect]: [clientId: string]
	[IpcMessageType.TaskCommand]: [clientId: string, data: TaskCommand]
	[IpcMessageType.TaskEvent]: [relayClientId: string | undefined, data: TaskEvent]
}
