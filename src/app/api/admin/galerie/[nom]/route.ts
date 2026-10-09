import { NextRequest, NextResponse } from "next/server";
import { exigerSession, reponseAccesRefuse, type Session } from "@/lib/auth";
import { supprimerPhoto } from "@/lib/galerie";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ nom: string }> }
) {
  let session: Session;
  try {
    session = await exigerSession();
  } catch (err) {
    return reponseAccesRefuse(err);
  }
  const { nom } = await params;
  const supprimee = await supprimerPhoto(decodeURIComponent(nom), session);
  if (!supprimee) {
    return NextResponse.json({ erreur: "Photo introuvable." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
