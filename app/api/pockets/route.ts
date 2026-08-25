import { NextRequest, NextResponse } from "next/server";

import { listPockets } from "@/lib/server/repository";

export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state") || undefined;
  const metro = request.nextUrl.searchParams.get("metro") || undefined;
  const pockets = await listPockets(state, metro);
  return NextResponse.json({ pockets, count: pockets.length, dataMode: process.env.DEMO_DATA_MODE || "curated-public" });
}
