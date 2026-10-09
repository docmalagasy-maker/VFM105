"use client";

import { useRouter } from "next/navigation";

export default function BoutonDeconnexion() {
  const router = useRouter();
  async function deconnecter() {
    await fetch("/api/auth/deconnexion", { method: "POST" }).catch(() => null);
    router.push("/admin/connexion");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={deconnecter}
      className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
    >
      Se déconnecter
    </button>
  );
}
