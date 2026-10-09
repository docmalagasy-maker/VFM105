import { NextRequest, NextResponse } from "next/server";
import { lirePhoto, type SourcePhoto } from "@/lib/galerie";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ source: string; nom: string }> }
) {
  const { source, nom } = await params;
  if (source !== "dossier" && source !== "envoi") {
    return new NextResponse("Introuvable.", { status: 404 });
  }
  const photo = await lirePhoto(source as SourcePhoto, decodeURIComponent(nom));
  if (!photo) return new NextResponse("Introuvable.", { status: 404 });

  return new NextResponse(new Uint8Array(photo.contenu), {
    headers: {
      "Content-Type": photo.type,
      "X-Content-Type-Options": "nosniff",
      // Les photos envoyées ont un nom unique ; celles du dossier peuvent être
      // remplacées sous le même nom à un déploiement suivant.
      "Cache-Control":
        source === "envoi" ? "public, max-age=31536000, immutable" : "public, max-age=3600",
    },
  });
}
