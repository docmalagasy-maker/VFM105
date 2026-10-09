/**
 * Les 120 districts de Madagascar regroupés par région (24 régions), repris
 * du projet ONN Board (src/data/districts.ts et regions.ts, sources :
 * Wikipédia FR « Liste des districts de Madagascar », décrets 2015, 2021, 2024).
 */
export const DISTRICTS_PAR_REGION: { region: string; districts: string[] }[] = [
  {
    region: "Alaotra-Mangoro",
    districts: ["Ambatondrazaka", "Amparafaravola", "Andilamena", "Anosibe An'ala", "Moramanga"],
  },
  {
    region: "Ambatosoa",
    districts: ["Mananara Avaratra", "Maroantsetra"],
  },
  {
    region: "Amoron'i Mania",
    districts: ["Ambatofinandrahana", "Ambositra", "Fandriana", "Manandriana"],
  },
  {
    region: "Analamanga",
    districts: ["Ambohidratrimo", "Andramasina", "Anjozorobe", "Ankazobe", "Antananarivo Atsimondrano", "Antananarivo Avaradrano", "Antananarivo I", "Antananarivo II", "Antananarivo III", "Antananarivo IV", "Antananarivo V", "Antananarivo VI", "Manjakandriana"],
  },
  {
    region: "Analanjirofo",
    districts: ["Fenoarivo Atsinanana", "Sainte-Marie", "Soanierana Ivongo", "Vavatenina"],
  },
  {
    region: "Androy",
    districts: ["Ambovombe", "Antanimora Sud", "Bekily", "Beloha", "Tsihombe"],
  },
  {
    region: "Anosy",
    districts: ["Amboasary Sud", "Betroka", "Taolanaro"],
  },
  {
    region: "Atsimo-Andrefana",
    districts: ["Ampanihy", "Ankazoabo", "Benenitra", "Beroroha", "Betioky Sud", "Morombe", "Sakaraha", "Toliara I", "Toliara II"],
  },
  {
    region: "Atsimo-Atsinanana",
    districts: ["Befotaka", "Farafangana", "Midongy", "Vangaindrano", "Vondrozo"],
  },
  {
    region: "Atsinanana",
    districts: ["Antanambao Manampotsy", "Brickaville", "Mahanoro", "Marolambo", "Toamasina I", "Toamasina II", "Vatomandry"],
  },
  {
    region: "Betsiboka",
    districts: ["Kandreho", "Maevatanana", "Tsaratanana"],
  },
  {
    region: "Boeny",
    districts: ["Ambato-Boeny", "Mahajanga I", "Mahajanga II", "Marovoay", "Mitsinjo", "Soalala"],
  },
  {
    region: "Bongolava",
    districts: ["Fenoarivobe", "Tsiroanomandidy"],
  },
  {
    region: "Diana",
    districts: ["Ambanja", "Ambilobe", "Antsiranana I", "Antsiranana II", "Nosy-Be"],
  },
  {
    region: "Fitovinany",
    districts: ["Ikongo", "Manakara", "Vohipeno"],
  },
  {
    region: "Haute Matsiatra",
    districts: ["Ambalavao", "Ambohimahasoa", "Fianarantsoa I", "Ikalamavony", "Isandra", "Lalangina", "Vohibato"],
  },
  {
    region: "Ihorombe",
    districts: ["Iakora", "Ihosy", "Ivohibe"],
  },
  {
    region: "Itasy",
    districts: ["Arivonimamo", "Miarinarivo", "Soavinandriana"],
  },
  {
    region: "Melaky",
    districts: ["Ambatomainty", "Antsalova", "Besalampy", "Maintirano", "Morafenobe"],
  },
  {
    region: "Menabe",
    districts: ["Belo-sur-Tsiribihina", "Mahabo", "Manja", "Miandrivazo", "Morondava"],
  },
  {
    region: "Sava",
    districts: ["Andapa", "Antalaha", "Sambava", "Vohemar"],
  },
  {
    region: "Sofia",
    districts: ["Analalava", "Antsohihy", "Bealanana", "Befandriana Nord", "Mampikony", "Mandritsara", "Port-Bergé"],
  },
  {
    region: "Vakinankaratra",
    districts: ["Ambatolampy", "Antanifotsy", "Antsirabe I", "Antsirabe II", "Betafo", "Faratsiho", "Mandoto"],
  },
  {
    region: "Vatovavy",
    districts: ["Ifanadiana", "Mananjary", "Nosy Varika"],
  },
];

export const TOUS_LES_DISTRICTS: string[] = DISTRICTS_PAR_REGION.flatMap((r) => r.districts);
