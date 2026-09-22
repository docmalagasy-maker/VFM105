import { NextRequest, NextResponse } from "next/server";
import { renvoyerSms } from "@/lib/repository";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  try {
    const statutSms = await renvoyerSms(reference);
    return NextResponse.json({ statutSms });
  } catch (err) {
    console.error("Erreur renvoi SMS", err);
    return NextResponse.json({ erreur: "Le renvoi du SMS a échoué." }, { status: 500 });
  }
}
