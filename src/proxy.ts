import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export function proxy(request: NextRequest) {
  const utilisateur = process.env.ADMIN_USER;
  const motDePasse = process.env.ADMIN_PASSWORD;

  if (!utilisateur || !motDePasse) {
    return new NextResponse("Interface d'administration non configurée.", { status: 503 });
  }

  const entete = request.headers.get("authorization");
  if (entete?.startsWith("Basic ")) {
    const [u, p] = Buffer.from(entete.slice(6), "base64").toString().split(":");
    if (u === utilisateur && p === motDePasse) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentification requise.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="VFM 105 Administration"' },
  });
}
