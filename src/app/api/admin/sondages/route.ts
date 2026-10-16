import { NextRequest, NextResponse } from "next/server";
import { exigerSession, reponseAccesRefuse } from "@/lib/auth";
import { creerSondage } from "@/lib/sondages";
import { sondageSchema } from "@/lib/sondages-modele";

/** Création d'un sondage : réservée au super-administrateur. */
export async function POST(request: NextRequest) {
  try {
    await exigerSession(true);
  } catch (err) {
    return reponseAccesRefuse(err);
  }
  const parsed = sondageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ erreur: parsed.error.issues[0]?.message ?? "Sondage invalide." }, { status: 400 });
  }
  const resultat = await creerSondage(parsed.data);
  return resultat.ok
    ? NextResponse.json({ id: resultat.valeur.id }, { status: 201 })
    : NextResponse.json({ erreur: resultat.erreur }, { status: resultat.statut });
}
