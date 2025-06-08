import { drizzle } from "drizzle-orm/libsql"

import { schema } from "./schema"

let connection: any;

if (process.env.BENCHMARKS_DB_PATH) {
	connection = { url: process.env.BENCHMARKS_DB_PATH, concurrency: 50 };
} else if (process.env.TURSO_CONNECTION_URL && process.env.TURSO_AUTH_TOKEN) {
	connection = { url: process.env.TURSO_CONNECTION_URL, authToken: process.env.TURSO_AUTH_TOKEN };
} else {
	// Fallback for build environments where these might not be set
	// Drizzle might still fail on query if connection is truly invalid/missing
	console.warn("Database environment variables not set. Using dummy connection for build.");
	connection = { url: "file::memory:", authToken: "dummy" }; // Or some other minimal valid-looking config
}

export const db = drizzle({ schema, connection })
