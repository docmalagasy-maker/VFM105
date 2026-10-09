import type { Metadata } from "next";
import { connection } from "next/server";
import MenuPublic from "@/components/MenuPublic";
import PublicShell from "@/components/PublicShell";
import { listerPhotos } from "@/lib/galerie";
import GrilleGalerie from "./GrilleGalerie";

export const metadata: Metadata = {
  title: "Sary — VFM",
  description: "Sarin'ny hetsika sy ny asan'ny VFM.",
};

export default async function GaleriePage() {
  // Lecture du disque à chaque visite : les nouvelles photos apparaissent sans reconstruction.
  await connection();
  const photos = await listerPhotos();

  return (
    <PublicShell cardClassName="max-w-6xl" menu={<MenuPublic />}>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-vfm-marine sm:text-3xl">Sary</h1>
        <p className="mt-2 text-sm text-zinc-600 sm:text-base">
          Sarin&apos;ny hetsika sy ny asan&apos;ny VFM.
        </p>
      </div>

      {photos.length === 0 ? (
        <p className="mt-10 text-center text-sm text-zinc-500">Mbola tsy misy sary amin&apos;izao fotoana izao.</p>
      ) : (
        <GrilleGalerie photos={photos.map(({ url, legende }) => ({ url, legende }))} />
      )}
    </PublicShell>
  );
}
