import { NextRequest, NextResponse } from "next/server";
import { exigerSession, reponseAccesRefuse } from "@/lib/auth";
import { supprimerPersonne } from "@/lib/personnes";

/** Suppression définitive d'un dossier de personne : super-administrateur seulement. */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  try {
    await exigerSession(true);
  } catch (err) {
    return reponseAccesRefuse(err);
  }
  const { reference } = await params;
  try {
    return (await supprimerPersonne(reference))
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
  } catch (err) {
    console.error("Erreur suppression dossier personne", err);
    return NextResponse.json({ erreur: "La suppression a échoué." }, { status: 500 });
  }
}
