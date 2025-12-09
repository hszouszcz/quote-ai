import { createClient, type SupabaseClient as SupabaseClientType } from "@supabase/supabase-js";

import type { Database } from "../types/database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// 👉 Eksportuj typ dla użycia w serwisach
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SupabaseClient = SupabaseClientType<Database, "public", any>;

export const DEFAULT_USER_ID = "f0b55955-91b5-4734-a0c1-804e5f4275a6";
