"use client";

import { createClient } from "@supabase/supabase-js";

let supabaseBrowserInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local",
    );
  }

  if (!supabaseBrowserInstance) {
    supabaseBrowserInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseBrowserInstance;
}
