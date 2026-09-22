import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { marquerStatutSms } from "@/lib/repository";

const schema = z.object({
  reference: z.string().min(1),
  succes: z.boolean(),
});

/**
 * Appelée par l'application Android après chaque tentative d'envoi, pour
 * confirmer ou signaler l'échec. Même authentification que /pending.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SMS_GATEWAY_SECRET;
  if (!secret) {
    return NextResponse.json({ erreur: "Passerelle SMS non configurée." }, { status: 503 });
  }
  if (request.headers.get("x-gateway-secret") !== secret) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  await marquerStatutSms(parsed.data.reference, parsed.data.succes ? "envoye" : "echoue");
  return NextResponse.json({ ok: true });
}
