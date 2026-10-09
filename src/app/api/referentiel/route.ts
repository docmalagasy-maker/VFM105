import { NextRequest, NextResponse } from "next/server";
import { TOUS_LES_DISTRICTS } from "@/lib/districts";
import { communesDuDistrict } from "@/lib/referentiel";

/** Communes et fokontany d'un district, pour les listes liées du formulaire public. */
export async function GET(request: NextRequest) {
  const district = request.nextUrl.searchParams.get("district") ?? "";
  if (!TOUS_LES_DISTRICTS.includes(district)) {
    return NextResponse.json({ erreur: "Distrika tsy fantatra." }, { status: 400 });
  }
  return NextResponse.json(
    { communes: communesDuDistrict(district) },
    { headers: { "Cache-Control": "public, max-age=86400" } }
  );
}
