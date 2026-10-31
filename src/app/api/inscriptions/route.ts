import { NextResponse } from "next/server";
import { etatInscriptions } from "@/lib/inscriptions";

/** État des inscriptions (nombre d'inscrits, places restantes), relu par l'accueil, les formulaires et l'admin. */
export async function GET() {
  try {
    const etat = await etatInscriptions();
    return NextResponse.json({ etat }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Erreur état des inscriptions", err);
    return NextResponse.json({ etat: null }, { status: 500 });
  }
}
