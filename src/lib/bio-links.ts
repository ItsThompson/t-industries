import { base } from "$app/paths";
import { ACCENTS } from "./accents";
import { CITY_COUNT } from "./cities";
import { highlightHref } from "./deep-links";
import { terminalPath } from "./routes";

export interface NoteScreenshot {
  staticAssetPathWithDeployBase: string;
  alt: string;
  intrinsicPixelWidth: number;
  intrinsicPixelHeight: number;
}

export interface BioActionSpec {
  target: string;
  label: string;
  note?: string;
  accent: string;
  screenshot?: NoteScreenshot;
}

export interface BioLinkSpec extends BioActionSpec {
  href: string;
}

export interface OldSiteSpec extends BioActionSpec {
  screenshot: NoteScreenshot;
  url: string;
  heading: string;
}

export const BIO_LINKS = {
  amazon: {
    target: "amazon",
    label: "Amazon (Veeqo) / Front-End",
    note: "Sep 2025 to Sep 2026. Cut frontend build times by 82% by designing the monolith-to-microservices migration on a website with 50,000+ sellers.",
    href: highlightHref(terminalPath("experience"), "amazon"),
    accent: ACCENTS.amazon,
  },
  msd: {
    target: "msd",
    label: "MSD / MLOps",
    note: "Jun to Jul 2024. Deployed a RAG pipeline that cut document processing time by 48%.",
    href: highlightHref(terminalPath("experience"), "msd"),
    accent: ACCENTS.msd,
  },
  criisp: {
    target: "criisp",
    label: "University of Bath / CRIISP",
    note: "Aug 2024 to Sep 2025. Cut SEM creation time by 30% for scientists modeling pain perception.",
    href: highlightHref(terminalPath("experience"), "criisp"),
    accent: ACCENTS.criisp,
  },
  continuousLearning: {
    target: "continuous-learning",
    label: "Ethos / Continuous Learning",
    note: "Standing on the shoulders of giants: read the principle and the evidence behind it.",
    href: highlightHref(terminalPath("ethos"), "continuous-learning"),
    accent: ACCENTS.primary,
  },
} satisfies Record<string, BioLinkSpec>;

export const BIO_OLD_SITE_ACTION = {
  target: "old-site",
  label: "Old Site / First Build",
  accent: ACCENTS.secondary100,
  url: "https://itsthompson.github.io/personal-website/",
  heading: "THE FIRST WEBSITE",
  screenshot: {
    staticAssetPathWithDeployBase: `${base}/old-site.png`,
    alt: "Home page of the first site: a sunset gradient fills the screen, a four item nav bar sits above the name Thompson T. in large serif capitals.",
    intrinsicPixelWidth: 2048,
    intrinsicPixelHeight: 1610,
  },
} satisfies OldSiteSpec;

export const BIO_PLACES_ACTION: BioActionSpec = {
  target: "places",
  label: `Places / ${CITY_COUNT} Cities`,
  note: `${CITY_COUNT} cities across Asia, Europe and North America. Open the map to see them all.`,
  accent: ACCENTS.primary,
};
