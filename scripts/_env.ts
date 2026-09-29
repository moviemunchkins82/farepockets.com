// Standalone scripts run outside Next.js, so load .env* files the same way
// Next does (.env.local, .env.development, .env). Import this first in every script.
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
