import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Explicitly check for an E2E flag, making intent very clear.
// TEST_NODE_ENV_OVERRIDE exists because Nextjs hardcodes NODE_ENV to
// production or development depending on command making it impossible to override "test" through NODE_ENV
const isE2ETest = process.env.NODE_ENV === "test" || process.env.TEST_NODE_ENV_OVERRIDE === "test";

// Determine SSL purely based on environment or connection string requirements
const useSSL = process.env.NODE_ENV === "production" && !isE2ETest;

const client = postgres(connectionString, {
  ssl: useSSL ? "require" : false,
  max: 1,
});

export const db = drizzle(client, { schema });