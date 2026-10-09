import { NextRequest, NextResponse } from "next/server";
import { supprimerPhoto } from "@/lib/galerie";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ nom: string }> }
) {
  const { nom } = await params;
  const supprimee = await supprimerPhoto(decodeURIComponent(nom));
  if (!supprimee) {
    return NextResponse.json({ erreur: "Photo introuvable." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
