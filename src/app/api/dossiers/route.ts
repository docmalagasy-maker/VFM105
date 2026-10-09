import { NextRequest, NextResponse } from "next/server";
import { dossierInputSchema } from "@/lib/validation";
import { rattacherAuReferentiel } from "@/lib/referentiel";
import { creerDossier } from "@/lib/repository";
import { isDatabaseConfigured } from "@/lib/db";

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { erreur: "Mbola tsy vonona ny tolotra. Andramo indray any aoriana azafady." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Fangatahana tsy manara-penitra." }, { status: 400 });
  }

  const parsed = dossierInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { erreur: parsed.error.issues[0]?.message ?? "Tsy feno araka ny tokony ho izy ny taratasy." },
      { status: 400 }
    );
  }

  try {
    // Commune et fokontany rattachés au référentiel officiel quand c'est possible
    const { association } = parsed.data;
    const localisation = rattacherAuReferentiel(association.district, association);
    const { dossier, creeMaintenant } = await creerDossier({
      ...parsed.data,
      association: { ...association, communePcode: undefined, fokontanyPcode: undefined, ...localisation },
    });
    return NextResponse.json({ dossier, creeMaintenant }, { status: creeMaintenant ? 201 : 200 });
  } catch (err) {
    console.error("Erreur création dossier", err);
    return NextResponse.json(
      { erreur: "Tsy lasa ny antontan-taratasinao. Andramo indray azafady." },
      { status: 500 }
    );
  }
}
