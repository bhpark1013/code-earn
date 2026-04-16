import { getSupabase } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

// Self-served ads (used before Carbon Ads approval)
const SELF_SERVED_ADS = [
  {
    sponsor: "CodeCash",
    description: "Earn while your AI agent thinks. Install the plugin today.",
    url: "https://web-olive-three-47.vercel.app",
  },
  {
    sponsor: "CodeCash",
    description: "Every prompt earns you credits. Start earning now.",
    url: "https://web-olive-three-47.vercel.app",
  },
];

const CPM_RATE = 2;
const USER_SHARE = 0.7;
const EARNING_PER_IMPRESSION = (CPM_RATE / 1000) * USER_SHARE;

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid");
  const sid = request.nextUrl.searchParams.get("sid");

  // Pick a random ad
  const ad = SELF_SERVED_ADS[Math.floor(Math.random() * SELF_SERVED_ADS.length)];

  // Track impression if user/session provided
  if (uid && sid) {
    try {
      const supabase = getSupabase();

      await supabase.from("ad_sessions").upsert(
        {
          id: sid,
          user_id: uid,
          duration_seconds: 0,
          earning: EARNING_PER_IMPRESSION,
          created_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      await supabase.rpc("increment_earnings", {
        p_user_id: uid,
        p_amount: EARNING_PER_IMPRESSION,
      });
    } catch {
      // Don't fail the ad response if tracking fails
    }
  }

  return Response.json(ad);
}
