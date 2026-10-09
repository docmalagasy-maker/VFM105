import { NextRequest, NextResponse } from "next/server";
import { supprimerDossier } from "@/lib/repository";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  try {
    const supprime = await supprimerDossier(reference);
    if (!supprime) {
      return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erreur suppression dossier", err);
    return NextResponse.json({ erreur: "La suppression a échoué." }, { status: 500 });
  }
}
