import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

/**
 * Keep-warm cron target. Vercel Cron hits this every ~10 min (see vercel.json),
 * and it pings the Render backend's /health so the free tier doesn't cold-start
 * before a real visitor's contact/chat request.
 */
export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
