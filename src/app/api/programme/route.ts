import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { demandeProgrammeSchema, enregistrerDemandeProgramme } from "@/lib/demandes-programme";

/** Demande de réception du programme de la conférence (pop-up de l'affiche). */
export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ erreur: "Service indisponible. Réessayez plus tard." }, { status: 503 });
  }
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  const parsed = demandeProgrammeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ erreur: parsed.error.issues[0]?.message ?? "Adresse e-mail invalide." }, { status: 400 });
  }

  try {
    await enregistrerDemandeProgramme(parsed.data.email);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Erreur demande de programme", err);
    return NextResponse.json({ erreur: "Demande non enregistrée. Réessayez." }, { status: 500 });
  }
}
