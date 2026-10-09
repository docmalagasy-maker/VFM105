import { NextRequest, NextResponse } from "next/server";
import { exigerSession, reponseAccesRefuse, type Session } from "@/lib/auth";
import { ajouterPhoto } from "@/lib/galerie";

export async function POST(request: NextRequest) {
  let session: Session;
  try {
    session = await exigerSession();
  } catch (err) {
    return reponseAccesRefuse(err);
  }
  const formData = await request.formData().catch(() => null);
  const fichiers = formData?.getAll("photos").filter((f): f is File => f instanceof File) ?? [];
  if (fichiers.length === 0) {
    return NextResponse.json({ erreur: "Aucune photo reçue." }, { status: 400 });
  }

  const ajoutees: string[] = [];
  const erreurs: string[] = [];
  for (const fichier of fichiers) {
    const resultat = await ajouterPhoto(fichier, session);
    if (resultat.ok) ajoutees.push(resultat.nom);
    else erreurs.push(resultat.erreur);
  }
  return NextResponse.json({ ajoutees, erreurs }, { status: ajoutees.length > 0 ? 201 : 400 });
}
