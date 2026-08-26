import { NextResponse } from "next/server";
import { dataMode } from "@/lib/repository";
import { getOrCreateAnonymousSession } from "@/lib/session";

export async function GET() {
  await getOrCreateAnonymousSession();
  return NextResponse.json({ ready: true, mode: dataMode() });
}

