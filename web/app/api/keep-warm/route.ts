import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

/**
 * Keep-warm endpoint. It proxies to the backend's /health so a single ping keeps
 * both the frontend and the Render free-tier backend warm, rather than letting a
 * real visitor's contact/chat request pay for the cold start.
 *
 * Scheduling: `web/vercel.json` runs this on a Vercel cron. The Hobby tier only
 * permits *daily* crons, so that schedule alone will not hold the backend awake
 * (Render free instances sleep after ~15 min idle). For sub-daily warming, point
 * an external monitor — e.g. UptimeRobot at ~5 min — at
 * https://varunsg.dev/api/keep-warm; that is the real warm-keeper, and the cron
 * is the floor beneath it.
 */
export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
