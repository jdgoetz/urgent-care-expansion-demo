import { NextResponse } from "next/server";

import { getPocket } from "@/lib/server/repository";

export async function GET(_request: Request, context: { params: Promise<{ pocketId: string }> }) {
  const { pocketId } = await context.params;
  const pocket = await getPocket(pocketId);
  if (!pocket) return NextResponse.json({ error: "Demo market not found" }, { status: 404 });
  return NextResponse.json(pocket);
}

