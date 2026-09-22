import { NextRequest, NextResponse } from "next/server";
import { listerSmsEnAttente } from "@/lib/repository";
import { messageConfirmation } from "@/lib/sms";

/**
 * Interrogée périodiquement par l'application Android (voir
 * android-sms-gateway/). Authentification par secret partagé dans l'en-tête
 * X-Gateway-Secret — jamais par les identifiants admin (client machine, pas
 * un navigateur).
 */
export async function GET(request: NextRequest) {
  const secret = process.env.SMS_GATEWAY_SECRET;
  if (!secret) {
    return NextResponse.json({ erreur: "Passerelle SMS non configurée." }, { status: 503 });
  }
  if (request.headers.get("x-gateway-secret") !== secret) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const enAttente = await listerSmsEnAttente();
  return NextResponse.json({
    sms: enAttente.map((s) => ({
      reference: s.reference,
      telephone: s.telephone,
      message: messageConfirmation(s.reference),
    })),
  });
}
