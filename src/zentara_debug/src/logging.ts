import { logger } from "../../utils/logging"

// Create a child logger specifically for debug controller
export const debugLogger = logger.child({ ctx: "roo-debug" })

// Helper function to create context-specific loggers
export const createLogger = (context: string) => debugLogger.child({ ctx: context })

// Create specific loggers for different components
export const controllerLogger = createLogger("controller")
export const breakpointLogger = createLogger("breakpoints")
export const executionLogger = createLogger("execution")
export const inspectionLogger = createLogger("inspection")
export const evaluationLogger = createLogger("evaluation")
export const eventLogger = createLogger("events")
