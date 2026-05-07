import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/index";
import { username } from "better-auth/plugins";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 3,
        maxPasswordLength: 72,
    },
    plugins: [
        username()   
    ]
});