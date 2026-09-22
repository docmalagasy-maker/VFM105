import { NextRequest, NextResponse } from "next/server";
import { uploaderPieceJointe } from "@/lib/blob";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const fichier = formData.get("fichier");

  if (!(fichier instanceof File)) {
    return NextResponse.json({ erreur: "Aucun fichier reçu." }, { status: 400 });
  }

  const resultat = await uploaderPieceJointe(fichier);
  if (!resultat.ok) {
    return NextResponse.json({ erreur: resultat.erreur }, { status: 400 });
  }

  return NextResponse.json({ piece: resultat.piece }, { status: 201 });
}
