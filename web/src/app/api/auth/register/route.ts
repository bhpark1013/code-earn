import { getSupabase } from "@/lib/supabase-server";
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";

// Register a new user (from CLI plugin)
export async function POST(request: NextRequest) {
  const { machineId } = await request.json();

  if (!machineId) {
    return Response.json({ error: "Missing machineId" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Check if already registered
  const { data: existing } = await supabase
    .from("users")
    .select("id, api_key")
    .eq("machine_id", machineId)
    .single();

  if (existing) {
    return Response.json({ userId: existing.id, apiKey: existing.api_key });
  }

  // Create new user
  const apiKey = `ce_${randomUUID().replace(/-/g, "")}`;
  const { data, error } = await supabase
    .from("users")
    .insert({
      machine_id: machineId,
      api_key: apiKey,
      total_earnings: 0,
      pending_payout: 0,
    })
    .select("id, api_key")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ userId: data.id, apiKey: data.api_key });
}
