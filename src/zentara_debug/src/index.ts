import { IDebugController } from "./IDebugController"
import { VsCodeDebugController } from "./VsCodeDebugController"
import { DapStopTrackerFactory } from "./debug/DapStopTracker"

// Create a singleton instance of the VsCodeDebugController
const vsCodeDebugController: IDebugController = new VsCodeDebugController()

export { vsCodeDebugController, DapStopTrackerFactory }
export * from "./IDebugController"
