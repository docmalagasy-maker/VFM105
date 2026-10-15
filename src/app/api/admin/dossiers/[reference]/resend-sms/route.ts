import { NextRequest, NextResponse } from "next/server";
import { exigerSession, reponseAccesRefuse } from "@/lib/auth";
import { remettreSmsEnAttente, SMS_ACTIF } from "@/lib/sms";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    await exigerSession(true);
  } catch (err) {
    return reponseAccesRefuse(err);
  }
  if (!SMS_ACTIF) {
    return NextResponse.json({ erreur: "Envoi de SMS désactivé." }, { status: 409 });
  }
  const { reference } = await params;
  try {
    await remettreSmsEnAttente(reference);
    return NextResponse.json({ statutSms: "a_envoyer" });
  } catch (err) {
    console.error("Erreur renvoi SMS", err);
    return NextResponse.json({ erreur: "Le renvoi du SMS a échoué." }, { status: 500 });
  }
}
