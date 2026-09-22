import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";

/**
 * Sert une pièce jointe depuis le store Blob privé. Protégé par le proxy
 * d'authentification admin (voir src/proxy.ts, matcher "/api/admin/:path*") :
 * aucun visiteur du site ne peut atteindre cette route sans identifiants.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pathname: string[] }> }
) {
  const { pathname } = await params;
  const chemin = pathname.join("/");

  const resultat = await get(chemin, { access: "private" });
  if (!resultat || resultat.statusCode !== 200) {
    return NextResponse.json({ erreur: "Pièce jointe introuvable." }, { status: 404 });
  }

  return new NextResponse(resultat.stream, {
    headers: {
      "Content-Type": resultat.blob.contentType,
      "Content-Disposition": resultat.blob.contentDisposition,
    },
  });
}
