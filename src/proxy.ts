import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESSION, lireJeton } from "@/lib/jeton";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

// Pages d'administration accessibles sans être connecté
const PAGES_PUBLIQUES = ["/admin/connexion", "/admin/inscription"];

/**
 * Premier contrôle (session présente et signature valide). Les droits fins
 * (super-administrateur ou district) sont vérifiés dans chaque page et route.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (PAGES_PUBLIQUES.includes(pathname)) return NextResponse.next();

  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD) {
    return new NextResponse("Interface d'administration non configurée.", { status: 503 });
  }

  if (lireJeton(request.cookies.get(COOKIE_SESSION)?.value)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ erreur: "Connexion requise." }, { status: 401 });
  }
  const connexion = new URL("/admin/connexion", request.url);
  connexion.searchParams.set("suite", pathname + search);
  return NextResponse.redirect(connexion);
}
