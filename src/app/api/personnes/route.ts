import { NextRequest, NextResponse } from "next/server";
import { envoyerConfirmationPersonne } from "@/lib/confirmation-personne";
import { isDatabaseConfigured } from "@/lib/db";
import { creerPersonne } from "@/lib/personnes";
import { personneInputSchema } from "@/lib/personnes-modele";
import { validateTelephoneMadagascar } from "@/lib/validation";

/** Dépôt définitif d'un dossier de personne physique (référence VFM-P-AAAA-NNNN). */
export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { erreur: "Mbola tsy vonona ny tolotra. Andramo indray any aoriana azafady." },
      { status: 503 }
    );
  }
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ erreur: "Fangatahana tsy manara-penitra." }, { status: 400 });

  const parsed = personneInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { erreur: parsed.error.issues[0]?.message ?? "Tsy feno araka ny tokony ho izy ny taratasy." },
      { status: 400 }
    );
  }

  try {
    const donnees = parsed.data;
    // Numéro enregistré au format international, comme pour les associations
    const telephone = validateTelephoneMadagascar(donnees.telephone).formate ?? donnees.telephone;
    const { dossier, creeMaintenant } = await creerPersonne({ ...donnees, telephone });
    if (creeMaintenant) {
      await envoyerConfirmationPersonne(dossier).catch((err) => console.error("E-mail de confirmation (personne)", err));
    }
    return NextResponse.json(
      { dossier: { reference: dossier.reference, qrJeton: dossier.qrJeton }, creeMaintenant },
      { status: creeMaintenant ? 201 : 200 }
    );
  } catch (err) {
    console.error("Erreur création dossier personne", err);
    return NextResponse.json({ erreur: "Tsy lasa ny dosie-nao. Andramo indray azafady." }, { status: 500 });
  }
}
