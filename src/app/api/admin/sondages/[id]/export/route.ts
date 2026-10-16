import { NextRequest, NextResponse } from "next/server";
import { districtAutorise, exigerSession, reponseAccesRefuse } from "@/lib/auth";
import { arrondi, csv } from "@/lib/csv";
import { listerReponses, obtenirSondage } from "@/lib/sondages";
import { analyserQuestions } from "@/lib/sondages-analyse";
import { lireFiltres, type ParametresResultats } from "@/lib/sondages-filtres";
import { libelleSexe, regionDuDistrict, type Question, type ValeurReponse } from "@/lib/sondages-modele";

function texteReponse(q: Question, v: ValeurReponse | undefined): string {
  if (v === undefined || v === "") return "";
  if (q.type === "unique") return q.options[v as number] ?? "";
  if (q.type === "multiple") return (v as number[]).map((i) => q.options[i]).join(" | ");
  if (q.type === "classement") return (v as number[]).map((i, rang) => `${rang + 1}. ${q.options[i]}`).join(" | ");
  return String(v);
}

/**
 * Export CSV d'un sondage, avec les filtres de la page de résultats.
 * type=reponses : une ligne par participation ; type=synthese : résultats par question.
 * Administrateur de district : uniquement les réponses de son district.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let districtImpose: string | undefined;
  try {
    districtImpose = districtAutorise(await exigerSession());
  } catch (err) {
    return reponseAccesRefuse(err);
  }
  const id = Number((await params).id);
  const sondage = Number.isInteger(id) ? await obtenirSondage(id) : null;
  if (!sondage) return NextResponse.json({ erreur: "Sondage introuvable." }, { status: 404 });

  const p = Object.fromEntries(request.nextUrl.searchParams) as ParametresResultats & { type?: string };
  const { filtres, regroupement } = lireFiltres(p, districtImpose);
  const reponses = await listerReponses(id, filtres);
  let contenu: string;

  if (p.type === "synthese") {
    const lignes: (string | number)[][] = [];
    for (const r of analyserQuestions(sondage, reponses, regroupement, "ordre")) {
      const q = r.question.intitule;
      if (r.type === "choix") {
        for (const o of r.options) lignes.push([q, "Ensemble", o.libelle, o.nombre, arrondi(o.part * 100), r.repondants]);
        for (const g of r.groupes)
          for (const o of g.valeur) lignes.push([q, g.nom, o.libelle, o.nombre, arrondi(o.part * 100), g.repondants]);
      } else if (r.type === "note") {
        lignes.push([q, "Ensemble", "Note moyenne", arrondi(r.moyenne), "", r.repondants]);
        for (const o of r.repartition) lignes.push([q, "Ensemble", o.libelle, o.nombre, arrondi(o.part * 100), r.repondants]);
        for (const g of r.groupes) lignes.push([q, g.nom, "Note moyenne", arrondi(g.valeur.moyenne), "", g.repondants]);
      } else if (r.type === "classement") {
        for (const l of r.lignes) lignes.push([q, "Ensemble", `${l.libelle} (rang moyen)`, arrondi(l.rangMoyen), "", r.repondants]);
        for (const g of r.groupes)
          for (const l of g.valeur) lignes.push([q, g.nom, `${l.libelle} (rang moyen)`, arrondi(l.rangMoyen), "", g.repondants]);
      } else {
        lignes.push([q, "Ensemble", "Réponses écrites", r.repondants, "", r.repondants]);
      }
    }
    contenu = csv(["Question", "Groupe", "Réponse", "Nombre / valeur", "Part (%)", "Répondants"], lignes);
  } else {
    contenu = csv(
      ["Date", "Sexe", "District", "Région", ...sondage.questions.map((q) => q.intitule)],
      reponses.map((r) => [
        new Date(r.creeLe).toLocaleString("fr-FR", { timeZone: "Indian/Antananarivo" }),
        libelleSexe(r.sexe),
        r.district,
        regionDuDistrict(r.district),
        ...sondage.questions.map((q) => texteReponse(q, r.reponses[q.id])),
      ])
    );
  }

  const date = new Date().toISOString().slice(0, 10);
  const prefixe = districtImpose ? `${districtImpose.replace(/[^\w-]+/g, "_")}-` : "";
  return new NextResponse(contenu, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vfm-sondage-${id}-${prefixe}${p.type === "synthese" ? "synthese" : "reponses"}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
