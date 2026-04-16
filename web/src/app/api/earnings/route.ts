import { getSupabase } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

// Get user earnings
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return Response.json({ error: "Missing API key" }, { status: 401 });
  }

  const supabase = getSupabase();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, total_earnings, pending_payout")
    .eq("api_key", apiKey)
    .single();

  if (error || !user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Get recent sessions
  const { data: sessions } = await supabase
    .from("ad_sessions")
    .select("duration_seconds, earning, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Get today's earnings
  const today = new Date().toISOString().split("T")[0];
  const { data: todayData } = await supabase
    .from("ad_sessions")
    .select("earning")
    .eq("user_id", user.id)
    .gte("created_at", today);

  const todayEarnings =
    todayData?.reduce((sum, s) => sum + (s.earning || 0), 0) ?? 0;

  return Response.json({
    totalEarnings: user.total_earnings,
    pendingPayout: user.pending_payout,
    todayEarnings,
    recentSessions: sessions || [],
  });
}
