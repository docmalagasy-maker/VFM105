import { NextRequest, NextResponse } from "next/server";
import { exigerSession, reponseAccesRefuse } from "@/lib/auth";
import { InscriptionsCompletes } from "@/lib/inscriptions";
import { importerPersonnes } from "@/lib/personnes";
import { importPersonnesSchema } from "@/lib/personnes-modele";

/**
 * Import d'une liste papier d'inscriptions (lot R) : super-administrateur
 * seulement. Aucun e-mail envoyé. Relancer le même import ne crée rien de plus.
 */
export async function POST(request: NextRequest) {
  try {
    await exigerSession(true);
  } catch (err) {
    return reponseAccesRefuse(err);
  }
  const corps = await request.json().catch(() => null);
  const donnees = importPersonnesSchema.safeParse(corps);
  if (!donnees.success) {
    return NextResponse.json({ erreur: "Import invalide.", details: donnees.error.issues }, { status: 400 });
  }
  const cles = donnees.data.lignes.map((l) => l.idempotencyKey);
  if (new Set(cles).size !== cles.length) {
    return NextResponse.json({ erreur: "Clé en double dans l'import." }, { status: 400 });
  }
  try {
    const r = await importerPersonnes(donnees.data);
    return NextResponse.json({
      ok: true,
      inscriptionsCreees: r.crees.length,
      participantsAjoutes: r.participantsAjoutes,
      totalApres: r.totalApres,
      dejaImportees: r.dejaImportees,
      references: r.crees.map((p) => ({ reference: p.reference, nom: `${p.prenom} ${p.nom}`.trim(), nombre: p.nombreParticipants })),
    });
  } catch (err) {
    if (err instanceof InscriptionsCompletes) {
      return NextResponse.json({ erreur: "Pas assez de places restantes pour cet import." }, { status: 409 });
    }
    console.error("Erreur import personnes", err);
    return NextResponse.json({ erreur: "L'import a échoué." }, { status: 500 });
  }
}
