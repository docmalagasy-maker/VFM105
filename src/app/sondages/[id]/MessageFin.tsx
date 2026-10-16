import Link from "next/link";

/** Encadré de fin : merci, ou déjà répondu. */
export default function MessageFin({ titre, texte }: { titre: string; texte: string }) {
  return (
    <div className="mt-8 rounded-2xl border border-vfm-vert/30 bg-vfm-vert/5 p-6 text-center">
      <p className="text-lg font-semibold text-vfm-vert-dark">{titre}</p>
      <p className="mt-1 text-sm text-zinc-600">{texte}</p>
      <Link
        href="/sondages"
        className="mt-4 inline-flex rounded-full bg-vfm-marine px-5 py-2.5 text-sm font-semibold text-white hover:bg-vfm-marine-dark"
      >
        Lohahevitra hafa
      </Link>
    </div>
  );
}
