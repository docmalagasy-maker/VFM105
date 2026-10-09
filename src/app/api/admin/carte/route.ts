import { NextRequest, NextResponse } from "next/server";
import { exigerSession, reponseAccesRefuse, type Session } from "@/lib/auth";
import { carteDistrict, carteNationale } from "@/lib/carte";
import { TOUS_LES_DISTRICTS } from "@/lib/districts";

/**
 * Données de la carte. Super-administrateur : vue nationale, ou un district au
 * choix. Administrateur de district : uniquement son district, quel que soit
 * le paramètre demandé.
 */
export async function GET(request: NextRequest) {
  let session: Session;
  try {
    session = await exigerSession();
  } catch (err) {
    return reponseAccesRefuse(err);
  }
  const demande = request.nextUrl.searchParams.get("district");
  const district = session.role === "district" ? session.district : demande;

  if (!district) {
    return NextResponse.json({ niveau: "national", ...(await carteNationale()) });
  }
  if (!TOUS_LES_DISTRICTS.includes(district)) {
    return NextResponse.json({ erreur: "District inconnu." }, { status: 400 });
  }
  return NextResponse.json({ niveau: "district", district, ...(await carteDistrict(district)) });
}
