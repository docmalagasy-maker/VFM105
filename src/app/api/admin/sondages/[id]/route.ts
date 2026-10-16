import { NextRequest, NextResponse } from "next/server";
import { exigerSession, reponseAccesRefuse } from "@/lib/auth";
import { changerActivation, modifierSondage, supprimerSondage } from "@/lib/sondages";
import { sondageSchema } from "@/lib/sondages-modele";

/** Gestion d'un sondage (modifier, activer/désactiver, supprimer) : super-administrateur seulement. */
async function preparer(params: Promise<{ id: string }>): Promise<number | Response> {
  try {
    await exigerSession(true);
  } catch (err) {
    return reponseAccesRefuse(err);
  }
  const id = Number((await params).id);
  return Number.isInteger(id) ? id : NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = await preparer(params);
  if (typeof id !== "number") return id;
  const parsed = sondageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ erreur: parsed.error.issues[0]?.message ?? "Sondage invalide." }, { status: 400 });
  }
  const resultat = await modifierSondage(id, parsed.data);
  return resultat.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ erreur: resultat.erreur }, { status: resultat.statut });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = await preparer(params);
  if (typeof id !== "number") return id;
  const actif = (await request.json().catch(() => null))?.actif;
  if (typeof actif !== "boolean") return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  return (await changerActivation(id, actif))
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ erreur: "Sondage introuvable." }, { status: 404 });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = await preparer(params);
  if (typeof id !== "number") return id;
  return (await supprimerSondage(id))
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ erreur: "Sondage introuvable." }, { status: 404 });
}
