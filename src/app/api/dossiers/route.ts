import { NextRequest, NextResponse } from "next/server";
import { dossierInputSchema } from "@/lib/validation";
import { creerDossier } from "@/lib/repository";
import { isDatabaseConfigured } from "@/lib/db";

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { erreur: "Le service n'est pas encore configuré (base de données absente). Veuillez réessayer plus tard." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  const parsed = dossierInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { erreur: parsed.error.issues[0]?.message ?? "Formulaire invalide." },
      { status: 400 }
    );
  }

  try {
    const { dossier, creeMaintenant } = await creerDossier(parsed.data);
    return NextResponse.json({ dossier, creeMaintenant }, { status: creeMaintenant ? 201 : 200 });
  } catch (err) {
    console.error("Erreur création dossier", err);
    return NextResponse.json(
      { erreur: "Votre dossier n'a pas pu être envoyé. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
