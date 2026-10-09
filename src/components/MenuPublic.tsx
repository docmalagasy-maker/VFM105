"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const EMAIL_CONTACT = "contact.vfm@0550.site";

/** Menus publics « Sary » (galerie photos) | « Fifandraisana » (contact). */
export default function MenuPublic() {
  const accueil = usePathname() === "/";
  const [contactOuvert, setContactOuvert] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <nav className="flex items-center gap-1 rounded-full border border-vfm-beige-bord bg-white/80 p-1 text-sm font-medium shadow-sm backdrop-blur">
        {!accueil && (
          <Link href="/" className="rounded-full px-4 py-2 text-vfm-marine transition-colors hover:bg-vfm-beige">
            Fandraisana
          </Link>
        )}
        <Link href="/galerie" className="rounded-full px-4 py-2 text-vfm-marine transition-colors hover:bg-vfm-beige">
          Sary
        </Link>
        <span className="h-4 w-px bg-vfm-beige-bord" aria-hidden />
        <button
          type="button"
          onClick={() => setContactOuvert((o) => !o)}
          aria-expanded={contactOuvert}
          className={`rounded-full px-4 py-2 transition-colors ${
            contactOuvert ? "bg-vfm-marine text-white" : "text-vfm-marine hover:bg-vfm-beige"
          }`}
        >
          Fifandraisana
        </button>
      </nav>

      {contactOuvert && (
        <p className="rounded-2xl border border-vfm-beige-bord bg-white px-5 py-3 text-center text-sm text-zinc-600 shadow-sm">
          Mailaka :{" "}
          <a href={`mailto:${EMAIL_CONTACT}`} className="font-semibold text-vfm-vert-dark underline">
            {EMAIL_CONTACT}
          </a>
        </p>
      )}
    </div>
  );
}
