import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { exigerSession, reponseAccesRefuse } from "@/lib/auth";
import { pieceDuDistrict } from "@/lib/repository";
import { lirePieceJointe } from "@/lib/stockage";

/**
 * Sert une pièce jointe depuis le stockage disque du serveur. Réservé aux
 * administrateurs connectés ; un administrateur de district ne peut ouvrir
 * que les pièces des dossiers de son district.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pathname: string[] }> }
) {
  const { pathname } = await params;
  const chemin = pathname.join("/");
  try {
    const session = await exigerSession();
    if (session.role === "district" && !(await pieceDuDistrict(chemin, session.district))) {
      return NextResponse.json({ erreur: "Pièce jointe introuvable." }, { status: 404 });
    }
  } catch (err) {
    return reponseAccesRefuse(err);
  }

  const resultat = await lirePieceJointe(chemin);
  if (!resultat) {
    return NextResponse.json({ erreur: "Pièce jointe introuvable." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(resultat.contenu), {
    headers: {
      "Content-Type": resultat.type,
      "Content-Disposition": `inline; filename="${path.basename(chemin)}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
