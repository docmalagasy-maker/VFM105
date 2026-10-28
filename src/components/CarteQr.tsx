"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

export interface InfosCarteQr {
  /** Code secret du dossier : seul contenu du QR code. */
  jeton: string;
  reference: string;
  nom: string;
  prenom: string;
  telephone: string;
  /** Inscription au nom d'une association. */
  association?: string;
}

const LARGEUR = 1080;
const HAUTEUR = 1620;
const VERT = "#0a9a4a";
const VERT_FONCE = "#087a3b";
const MARINE = "#0c1c30";

/**
 * Carte d'inscription aux Tafa & Dinika : en-tête de la conférence, QR code et
 * informations du participant. Dessinée dans un canvas, si bien que l'image
 * affichée est exactement celle que l'on télécharge (PNG).
 *
 * Le QR code ne contient qu'une adresse de vérification avec le code secret
 * du dossier : aucune donnée personnelle n'y est lisible. L'adresse mène à une
 * page réservée aux administrateurs connectés.
 */
export default function CarteQr({ infos }: { infos: InfosCarteQr }) {
  const [image, setImage] = useState<string | null>(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    let annule = false;
    dessinerCarte(infos)
      .then((url) => !annule && setImage(url))
      .catch(() => !annule && setErreur(true));
    return () => {
      annule = true;
    };
  }, [infos]);

  if (erreur) {
    return <p className="text-sm text-vfm-rouge">Tsy vita ny QR code. Avereno alaina ity pejy ity azafady.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- image générée dans le navigateur (data URL)
        <img
          src={image}
          alt={`QR code fisoratana anarana ${infos.reference}`}
          className="w-full max-w-sm rounded-2xl border border-vfm-beige-bord shadow-[0_20px_50px_-20px_rgba(20,43,71,0.35)]"
        />
      ) : (
        <div className="flex aspect-[1080/1620] w-full max-w-sm items-center justify-center rounded-2xl border border-vfm-beige-bord bg-vfm-beige-clair text-sm text-zinc-500">
          Eo am-panomanana ny QR code...
        </div>
      )}
      <a
        href={image ?? undefined}
        download={`QR-${infos.reference}.png`}
        aria-disabled={!image}
        className={`inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-vfm-vert px-6 py-4 text-base font-semibold text-white shadow-lg shadow-vfm-vert/25 transition-all hover:bg-vfm-vert-dark ${image ? "" : "pointer-events-none opacity-50"}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />
        </svg>
        Télécharger mon QR code
      </a>
    </div>
  );
}

function chargerImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Coupe un texte en lignes qui tiennent dans `largeur` (au plus `max` lignes). */
function couper(ctx: CanvasRenderingContext2D, texte: string, largeur: number, max = 2): string[] {
  const mots = texte.split(/\s+/).filter(Boolean);
  const lignes: string[] = [];
  let ligne = "";
  for (const mot of mots) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (ctx.measureText(essai).width <= largeur || !ligne) ligne = essai;
    else {
      lignes.push(ligne);
      ligne = mot;
    }
  }
  if (ligne) lignes.push(ligne);
  if (lignes.length > max) {
    const gardees = lignes.slice(0, max);
    gardees[max - 1] = `${gardees[max - 1].replace(/\s+\S*$/, "")}…`;
    return gardees;
  }
  return lignes;
}

async function dessinerCarte(infos: InfosCarteQr): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = LARGEUR;
  canvas.height = HAUTEUR;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const centre = LARGEUR / 2;

  // Fond et liseré aux couleurs du logo
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, LARGEUR, HAUTEUR);
  const liseres = [["#d81f26", 0], [VERT, 1], ["#0b4ea2", 2]] as const;
  for (const [couleur, i] of liseres) {
    ctx.fillStyle = couleur;
    ctx.fillRect((LARGEUR / 3) * i, 0, LARGEUR / 3 + 1, 14);
  }

  // En-tête de la conférence
  const degrade = ctx.createLinearGradient(0, 14, 0, 470);
  degrade.addColorStop(0, VERT);
  degrade.addColorStop(1, VERT_FONCE);
  ctx.fillStyle = degrade;
  ctx.fillRect(0, 14, LARGEUR, 456);

  const logo = await chargerImage("/images/logo-vfm-detoure.png").catch(() => null);
  if (logo) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(centre, 128, 86, 0, Math.PI * 2);
    ctx.fill();
    const h = 150;
    const w = (logo.width / logo.height) * h;
    ctx.drawImage(logo, centre - w / 2, 128 - h / 2 + 4, w, h);
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 104px Arial, Helvetica, sans-serif";
  ctx.fillText("TAFA & DINIKA", centre, 320);
  ctx.font = "700 40px Arial, Helvetica, sans-serif";
  ctx.fillText("FANABEAZANA ARA-POLITIKA", centre, 378);
  ctx.font = "400 32px Arial, Helvetica, sans-serif";
  ctx.fillText("14 Novambra 2026 · Tranom-pokonolona Ambohidratrimo", centre, 432);

  // QR code (adresse de vérification + code secret)
  const qr = document.createElement("canvas");
  await QRCode.toCanvas(qr, `${window.location.origin}/admin/verifier/${infos.jeton}`, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 560,
    color: { dark: MARINE, light: "#ffffff" },
  });
  const haut = 520;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#e6dac3";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(centre - 310, haut - 30, 620, 620, 36);
  ctx.fill();
  ctx.stroke();
  ctx.drawImage(qr, centre - 280, haut, 560, 560);

  // Informations du participant
  let y = 1215;
  ctx.fillStyle = MARINE;
  ctx.font = "800 60px Arial, Helvetica, sans-serif";
  for (const ligne of couper(ctx, `${infos.prenom} ${infos.nom.toUpperCase()}`.trim(), LARGEUR - 120)) {
    ctx.fillText(ligne, centre, y);
    y += 68;
  }
  if (infos.association) {
    ctx.fillStyle = VERT_FONCE;
    ctx.font = "700 40px Arial, Helvetica, sans-serif";
    for (const ligne of couper(ctx, infos.association, LARGEUR - 120)) {
      ctx.fillText(ligne, centre, y);
      y += 50;
    }
  }
  ctx.fillStyle = "#3f3f46";
  ctx.font = "400 38px Arial, Helvetica, sans-serif";
  ctx.fillText(infos.telephone, centre, y + 6);

  // Référence et consigne
  ctx.fillStyle = MARINE;
  ctx.fillRect(0, HAUTEUR - 130, LARGEUR, 130);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 46px Arial, Helvetica, sans-serif";
  ctx.fillText(infos.reference, centre, HAUTEUR - 70);
  ctx.font = "400 26px Arial, Helvetica, sans-serif";
  ctx.fillText("VFM 105 · Asehoy amin'ny fidirana ity QR code ity", centre, HAUTEUR - 28);

  return canvas.toDataURL("image/png");
}
