import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { lirePieceJointe } from "@/lib/stockage";

/**
 * Sert une pièce jointe depuis le stockage disque du serveur. Protégé par le
 * proxy d'authentification admin (voir src/proxy.ts, matcher
 * "/api/admin/:path*") : aucun visiteur du site ne peut atteindre cette route
 * sans identifiants.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pathname: string[] }> }
) {
  const { pathname } = await params;
  const chemin = pathname.join("/");

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
