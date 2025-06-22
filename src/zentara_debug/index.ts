import { VsCodeDebugController } from "./src/VsCodeDebugController"
import { IDebugController } from "./src/IDebugController"

// Create a singleton instance of the VsCodeDebugController
const vsCodeDebugController: IDebugController = new VsCodeDebugController()

// Export the instance for use in other parts of the application (e.g., tools)
export { vsCodeDebugController }

// Optionally, re-export other necessary types or interfaces from the zentara_debug module
export * from "./src/IDebugController" // Re-exporting the main interface and its associated types
// export * from "./src/types"; // If there are other specific types to export
