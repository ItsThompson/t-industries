import { describe, it, expect } from "vitest";
import { BIO_LINKS, BIO_OLD_SITE_ACTION, BIO_PLACES_ACTION } from "./bio-links";
import { ACCENTS } from "./accents";
import { CITY_COUNT } from "./cities";

const LINKS = Object.values(BIO_LINKS);
const ACTIONS = [...LINKS, BIO_PLACES_ACTION, BIO_OLD_SITE_ACTION];

describe("bio links", () => {
  it("gives every link a unique target, so no two notes share an id", () => {
    const targets = ACTIONS.map((action) => action.target);
    expect(new Set(targets).size).toBe(ACTIONS.length);
  });

  it("points every link at the target it names", () => {
    LINKS.forEach((link) => {
      expect(link.href).toContain(`highlight=${link.target}`);
    });
  });

  it("sends the experience links to the terminal experience route", () => {
    expect(BIO_LINKS.amazon.href).toBe("/terminal/experience?highlight=amazon");
    expect(BIO_LINKS.msd.href).toBe("/terminal/experience?highlight=msd");
    expect(BIO_LINKS.criisp.href).toBe("/terminal/experience?highlight=criisp");
  });

  it("sends the first-principles link to the continuous learning row", () => {
    expect(BIO_LINKS.continuousLearning.href).toBe(
      "/terminal/ethos?highlight=continuous-learning",
    );
  });

  it("uses each organization brand color as the accent", () => {
    expect(BIO_LINKS.amazon.accent).toBe(ACCENTS.amazon);
    expect(BIO_LINKS.msd.accent).toBe(ACCENTS.msd);
    expect(BIO_LINKS.criisp.accent).toBe(ACCENTS.criisp);
  });

  it("gives every link a label and a note worth hovering for", () => {
    [...LINKS, BIO_PLACES_ACTION].forEach((action) => {
      expect(action.label.length).toBeGreaterThan(0);
      expect(action.note?.length).toBeGreaterThan(40);
    });
  });

  describe("first website easter egg", () => {
    const SCREENSHOT = BIO_OLD_SITE_ACTION.screenshot;

    it("has no destination, so the old site is never linked", () => {
      expect("href" in BIO_OLD_SITE_ACTION).toBe(false);
    });

    it("carries the picture that the note previews", () => {
      expect(SCREENSHOT.staticAssetPathWithDeployBase).toBe("/old-site.png");
      expect(SCREENSHOT.alt.length).toBeGreaterThan(40);
    });

    it("frames the live copy in the modal", () => {
      expect(BIO_OLD_SITE_ACTION.url).toBe(
        "https://itsthompson.github.io/personal-website/",
      );
      expect(BIO_OLD_SITE_ACTION.heading).toBe("THE FIRST WEBSITE");
    });

    it("lets the picture carry the note, with no written description", () => {
      expect("note" in BIO_OLD_SITE_ACTION).toBe(false);
    });

    it("declares the aspect ratio, so the note reserves the image box before it loads", () => {
      expect(SCREENSHOT.intrinsicPixelWidth).toBeGreaterThan(0);
      expect(SCREENSHOT.intrinsicPixelHeight).toBeGreaterThan(0);
    });

    it("uses the prose accent, so the easter egg does not ask for attention", () => {
      expect(BIO_OLD_SITE_ACTION.accent).toBe(ACCENTS.secondary100);
    });
  });

  describe("places map action", () => {
    it("has no destination, because it opens the map in place", () => {
      expect("href" in BIO_PLACES_ACTION).toBe(false);
    });

    it("uses the ethos accent, matching the other in-page action", () => {
      expect(BIO_PLACES_ACTION.accent).toBe(ACCENTS.primary);
    });

    it("names the counts the map will show", () => {
      expect(BIO_PLACES_ACTION.note).toContain(`${CITY_COUNT} cities`);
      expect(BIO_PLACES_ACTION.label).toContain(`${CITY_COUNT}`);
      expect(BIO_PLACES_ACTION.note).toContain("Asia");
      expect(BIO_PLACES_ACTION.note).toContain("Europe");
      expect(BIO_PLACES_ACTION.note).toContain("North America");
    });
  });
});
