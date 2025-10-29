import { pgTable } from "drizzle-orm/pg-core";

/**
 * Use standard table names without prefix to match Supabase schema.
 * Tables are created directly in Supabase and shared with Drizzle ORM.
 */
export const createTable = pgTable;
