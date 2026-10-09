import { NextRequest, NextResponse } from "next/server";
import { traiterAdministrateur, type ActionAdmin } from "@/lib/administrateurs";
import { exigerSession, reponseAccesRefuse } from "@/lib/auth";

const ACTIONS: ActionAdmin[] = ["valider", "refuser", "desactiver", "supprimer"];

/** Gestion des comptes administrateurs : réservée au super-administrateur. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await exigerSession(true);
  } catch (err) {
    return reponseAccesRefuse(err);
  }
  const id = Number((await params).id);
  const action = (await request.json().catch(() => null))?.action as ActionAdmin;
  if (!Number.isInteger(id) || !ACTIONS.includes(action)) {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }
  const resultat = await traiterAdministrateur(id, action);
  return resultat.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ erreur: resultat.erreur }, { status: 409 });
}
