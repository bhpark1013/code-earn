import { getSupabase } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

// CPM rate: $2 per 1000 impressions, 70% to user
const CPM_RATE = 2;
const USER_SHARE = 0.7;
const EARNING_PER_IMPRESSION = (CPM_RATE / 1000) * USER_SHARE;

// Start or end an ad session
export async function POST(request: NextRequest) {
  const { userId, sessionId, duration } = await request.json();

  if (!userId || !sessionId) {
    return Response.json({ error: "Missing userId or sessionId" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Record the session
  const { error: sessionError } = await supabase.from("ad_sessions").upsert(
    {
      id: sessionId,
      user_id: userId,
      duration_seconds: duration || 0,
      earning: duration >= 3 ? EARNING_PER_IMPRESSION : 0, // Min 3s to count
      created_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (sessionError) {
    return Response.json({ error: sessionError.message }, { status: 500 });
  }

  // Update user's total earnings
  if (duration >= 3) {
    const { error: earningError } = await supabase.rpc("increment_earnings", {
      p_user_id: userId,
      p_amount: EARNING_PER_IMPRESSION,
    });

    if (earningError) {
      return Response.json({ error: earningError.message }, { status: 500 });
    }
  }

  return Response.json({ success: true, earning: EARNING_PER_IMPRESSION });
}
