import { NextRequest, NextResponse } from "next/server";
import { districtAutorise, exigerSession, reponseAccesRefuse } from "@/lib/auth";
import { listerDossiers } from "@/lib/repository";
import { calculerStatistiques } from "@/lib/statistiques";
import { LIBELLES_STATUT } from "@/app/admin/libelles";

/** Cellule CSV (séparateur « ; », guillemets doublés). */
function cellule(valeur: string | number | null | undefined): string {
  if (valeur === null || valeur === undefined) return "";
  let texte = typeof valeur === "number" ? String(valeur).replace(".", ",") : valeur;
  // Données saisies par le public : neutralise les formules (=, +, -, @) à l'ouverture dans Excel.
  if (typeof valeur === "string" && /^[=+\-@\t\r]/.test(texte)) texte = `'${texte}`;
  return /[";\n\r]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte;
}

function csv(entetes: string[], lignes: (string | number | null | undefined)[][]): string {
  // BOM UTF-8 : Excel ouvre directement le fichier avec les bons accents.
  return "﻿" + [entetes, ...lignes].map((l) => l.map(cellule).join(";")).join("\r\n") + "\r\n";
}

const arrondi = (n: number) => Math.round(n * 10) / 10;

export async function GET(request: NextRequest) {
  let district: string | undefined;
  try {
    // Administrateur de district : exports limités à son district
    district = districtAutorise(await exigerSession());
  } catch (err) {
    return reponseAccesRefuse(err);
  }
  const type = request.nextUrl.searchParams.get("type");
  const date = new Date().toISOString().slice(0, 10);
  let contenu: string;

  if (type === "dossiers") {
    // Export complet (jusqu'à 100 000 dossiers), sans la limite d'affichage de la liste.
    const dossiers = await listerDossiers(undefined, 100000, district);
    contenu = csv(
      [
        "Référence", "Date de dépôt", "Statut", "Association", "Adresse", "District",
        "Commune", "Code commune", "Fokontany",
        "Activité", "Nombre de membres", "Responsables", "Téléphone", "E-mail",
        "Autres coordonnées", "Description", "Pièces jointes",
      ],
      dossiers.map((d) => [
        d.reference,
        new Date(d.dateDepot).toLocaleString("fr-FR", { timeZone: "Indian/Antananarivo" }),
        LIBELLES_STATUT[d.statut] ?? d.statut,
        d.association.nom,
        d.association.adresse,
        d.association.district,
        d.association.commune,
        d.association.communePcode,
        d.association.fokontany,
        d.association.activite,
        d.association.nombreMembres,
        d.responsables.map((r) => `${r.prenom} ${r.nom}`.trim()).join(", "),
        d.coordonnees.telephone,
        d.coordonnees.email,
        (d.coordonnees.autres ?? []).map((a) => `${a.type} : ${a.valeur}`).join(", "),
        d.description,
        d.pieces.length,
      ])
    );
  } else {
    const stats = await calculerStatistiques(district);
    if (type === "districts") {
      contenu = csv(
        ["District", "Région", "Associations", "Membres déclarés", "Moyenne de membres"],
        stats.parDistrict.map((z) => [z.nom, z.region, z.associations, z.membres, arrondi(z.moyenneMembres)])
      );
    } else if (type === "communes") {
      contenu = csv(
        ["Commune", "District", "Associations", "Membres déclarés", "Moyenne de membres"],
        stats.parCommune.map((z) => [z.nom, z.region, z.associations, z.membres, arrondi(z.moyenneMembres)])
      );
    } else if (type === "regions") {
      contenu = csv(
        ["Région", "Associations", "Membres déclarés", "Moyenne de membres"],
        stats.parRegion.map((z) => [z.nom, z.associations, z.membres, arrondi(z.moyenneMembres)])
      );
    } else if (type === "tranches") {
      contenu = csv(
        ["Nombre de membres", "Associations", "Part des associations (%)", "Membres déclarés"],
        stats.parTranche.map((t) => [t.libelle, t.associations, arrondi(t.part * 100), t.membres])
      );
    } else {
      return NextResponse.json({ erreur: "Type d'export inconnu." }, { status: 400 });
    }
  }

  return new NextResponse(contenu, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vfm-${district ? district.replace(/[^\w-]+/g, "_") + "-" : ""}${type}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
