import { NextResponse } from "next/server";
import { COOKIE_SESSION } from "@/lib/auth";

export async function POST() {
  const reponse = NextResponse.json({ ok: true });
  reponse.cookies.set(COOKIE_SESSION, "", { path: "/", maxAge: 0 });
  return reponse;
}
