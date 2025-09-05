import { runBot } from "./botManager/BotManager.js";

// Execute the runBot and catch potential errors.
runBot().catch((error) => {
	console.error("Fatal error: ", error);
	process.exit(1);
});

