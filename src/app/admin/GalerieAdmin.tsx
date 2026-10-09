"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Photo } from "@/lib/galerie";

export default function GalerieAdmin({ photos }: { photos: Photo[] }) {
  const router = useRouter();
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [message, setMessage] = useState<{ texte: string; erreur: boolean } | null>(null);

  const url = (chemin: string) => new URL(chemin, window.location.origin);

  async function envoyer(fichiers: FileList | null) {
    if (!fichiers || fichiers.length === 0) return;
    setEnvoiEnCours(true);
    setMessage(null);
    let ajoutees = 0;
    const erreurs: string[] = [];
    // Une requête par photo : chaque envoi reste sous la limite de taille du serveur.
    for (const fichier of Array.from(fichiers)) {
      const donnees = new FormData();
      donnees.append("photos", fichier);
      try {
        const reponse = await fetch(url("/api/admin/galerie"), { method: "POST", body: donnees });
        const json = await reponse.json().catch(() => null);
        ajoutees += json?.ajoutees?.length ?? 0;
        erreurs.push(...(json?.erreurs ?? (reponse.ok ? [] : [json?.erreur ?? `${fichier.name} : échec de l'envoi.`])));
      } catch {
        erreurs.push(`${fichier.name} : échec de l'envoi (problème de connexion).`);
      }
    }
    setMessage({
      texte: [ajoutees ? `${ajoutees} photo(s) ajoutée(s).` : "", ...erreurs].filter(Boolean).join(" "),
      erreur: erreurs.length > 0,
    });
    setEnvoiEnCours(false);
    router.refresh();
  }

  async function supprimer(photo: Photo) {
    if (!window.confirm("Supprimer définitivement cette photo de la galerie ?")) return;
    try {
      const reponse = await fetch(url(`/api/admin/galerie/${encodeURIComponent(photo.nom)}`), { method: "DELETE" });
      if (!reponse.ok) throw new Error();
      router.refresh();
    } catch {
      window.alert("La suppression a échoué.");
    }
  }

  const envois = photos.filter((p) => p.source === "envoi").length;

  return (
    <div className="mt-6 flex flex-col gap-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="text-base font-semibold text-zinc-900">Ajouter des photos</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Elles apparaissent immédiatement sur la page publique{" "}
          <a href="/galerie" target="_blank" rel="noreferrer" className="underline">
            /galerie
          </a>
          . JPEG, PNG, WebP ou GIF, 15 Mo maximum par photo.
        </p>
        <label
          className={`mt-3 inline-flex cursor-pointer rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 ${
            envoiEnCours ? "pointer-events-none opacity-50" : ""
          }`}
        >
          {envoiEnCours ? "Envoi en cours..." : "Choisir des photos"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              envoyer(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {message && (
          <p className={`mt-3 text-sm ${message.erreur ? "text-red-700" : "text-green-700"}`}>{message.texte}</p>
        )}
        <p className="mt-4 text-xs text-zinc-500">
          Les photos du dossier <code>GALERIE</code> du projet sont publiées à chaque « Push » depuis GitHub
          Desktop ; pour les modifier ou les supprimer, passer par ce dossier.
        </p>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="text-base font-semibold text-zinc-900">
          Photos publiées ({photos.length} : {envois} envoyée(s) ici, {photos.length - envois} du dossier GALERIE)
        </h2>
        {photos.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">Aucune photo pour le moment.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {photos.map((p) => (
              <li key={p.url} className="overflow-hidden rounded-lg border border-zinc-200">
                <div className="relative aspect-square bg-zinc-100">
                  <Image src={p.url} alt={p.legende || p.nom} fill sizes="12rem" className="object-cover" />
                </div>
                <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                  <span className="truncate text-xs text-zinc-500" title={p.nom}>
                    {p.source === "envoi" ? "Envoyée ici" : p.nom}
                  </span>
                  {p.source === "envoi" && (
                    <button
                      type="button"
                      onClick={() => supprimer(p)}
                      className="shrink-0 text-xs font-medium text-red-700 hover:underline"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
