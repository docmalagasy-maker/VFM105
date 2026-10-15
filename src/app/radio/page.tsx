import type { Metadata } from "next";
import PublicShell from "@/components/PublicShell";
import LecteurRadio from "./LecteurRadio";

export const metadata: Metadata = {
  title: "Radio — VFM",
  description: "Henoy mivantana ny Radio VFM.",
};

export default function RadioPage() {
  return (
    <PublicShell cardClassName="max-w-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-vfm-marine sm:text-3xl">Radio VFM</h1>
        <p className="mt-2 text-sm text-zinc-600 sm:text-base">Henoy mivantana ny Radio VFM.</p>
      </div>

      <LecteurRadio />
    </PublicShell>
  );
}
