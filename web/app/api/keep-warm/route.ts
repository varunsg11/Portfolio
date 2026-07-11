import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

/**
 * Keep-warm endpoint. Ping this on a schedule (e.g. an external monitor such as
 * UptimeRobot, every ~5 min) so the Render free-tier backend doesn't cold-start
 * before a real visitor's contact/chat request. It proxies to the backend's
 * /health so a single monitor keeps both the frontend and backend warm.
 */
export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
