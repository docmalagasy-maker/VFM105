import { NextRequest, NextResponse } from "next/server";
import { remettreSmsEnAttente } from "@/lib/repository";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  try {
    await remettreSmsEnAttente(reference);
    return NextResponse.json({ statutSms: "a_envoyer" });
  } catch (err) {
    console.error("Erreur renvoi SMS", err);
    return NextResponse.json({ erreur: "Le renvoi du SMS a échoué." }, { status: 500 });
  }
}
