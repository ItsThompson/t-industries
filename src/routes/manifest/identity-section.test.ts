import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/svelte";
import ManifestPage from "./+page.svelte";

vi.mock("$lib/metadata", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    getUnitSerial: () => "TI-0510",
    getUptime: () => "20.12 YRS",
    getExperienceCycles: () => "EXP.CYCLES: 7",
    getSystemTime: () => "SYS.TIME: 14:30:00 UTC",
    UNIT_SERIAL: "TI-0510",
    DIVISION: "DIVISION: CORE.ENG",
    CLEARANCE: "CLEARANCE: L3",
    LOCATION_CODES: "LON / BTH / AMS",
    ARCHIVE_REF: "ARC-2019-FWD",
    getManufacturingDate: () => "MFG: LOT-05-10",
    getFirmwareVersion: () => "FW: v21.05",
  };
});

// Mock fetch for R&D API
const mockFetch = vi.fn();
(globalThis as unknown as { fetch: typeof fetch }).fetch = mockFetch;

describe("Manifest Page - Identity Section", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      json: () =>
        Promise.resolve(["Distributed Systems", "WebGL Shaders", "Rust"]),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders section with id="identity"', () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    const section = container.querySelector("#identity");
    expect(section).not.toBeNull();
    expect(section?.tagName).toBe("SECTION");
  });

  it("renders bio compartment with name and title", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    expect(container.textContent).toContain("Thompson Tong");
    expect(container.textContent).toContain("Software Engineer + Student");
  });

  it("renders Age component in bio paragraph", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    const bioText = container.querySelector("#identity")?.textContent;
    expect(bioText).toContain("year old software engineer");
  });

  it("renders status compartment with ACTIVE indicator and coral dot", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    expect(container.textContent).toContain("● ACTIVE");
    const dot = container.querySelector("#identity .text-primary");
    expect(dot?.textContent).toBe("●");
  });

  it("renders status with uptime in YRS format", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    expect(container.textContent).toContain("UPTIME: 20.12 YRS");
  });

  it("renders experience cycles in status", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    expect(container.textContent).toContain("EXP.CYCLES: 7");
  });

  it("renders LOC: LON in status", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    expect(container.textContent).toContain("LOC: LON");
  });

  it("renders connections with GitHub link", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    const links = container.querySelectorAll('#identity a[target="_blank"]');
    const githubLink = Array.from(links).find(
      (link) => link.getAttribute("href") === "https://github.com/ItsThompson",
    );
    expect(githubLink).not.toBeUndefined();
    expect(githubLink?.textContent).toContain("GitHub");
  });

  it("renders connections with LinkedIn link", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    const links = container.querySelectorAll('#identity a[target="_blank"]');
    const linkedinLink = Array.from(links).find(
      (link) =>
        link.getAttribute("href") === "https://linkedin.com/in/thompsontong",
    );
    expect(linkedinLink).not.toBeUndefined();
    expect(linkedinLink?.textContent).toContain("LinkedIn");
  });

  it("renders MetadataBar with unit serial", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    expect(container.textContent).toContain("TI-0510");
  });

  it("renders MetadataBar with STATUS: ACTIVE", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    expect(container.textContent).toContain("STATUS: ACTIVE");
  });

  it("renders MetadataBar with system time", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    expect(container.textContent).toContain("SYS.TIME: 14:30:00 UTC");
  });

  it("renders SectionHeading as h2 with IDENTITY text", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    const h2 = container.querySelector("#identity h2");
    expect(h2).not.toBeNull();
    expect(h2?.textContent).toContain("IDENTITY");
  });

  it("renders SectionHeading with font-display class", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    const h2 = container.querySelector("#identity h2");
    expect(h2?.classList.contains("font-display")).toBe(true);
  });

  it("renders 12-column grid for desktop layout", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    const grid = container.querySelector("#identity .grid.grid-cols-12");
    expect(grid).not.toBeNull();
  });

  it("bio compartment spans 6 columns on desktop", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    const section = container.querySelector("#identity");
    const bioCol = section?.querySelector(".md\\:col-span-6");
    expect(bioCol).not.toBeNull();
  });

  it("status and connections span 3 columns on desktop", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    const section = container.querySelector("#identity");
    const span3Cols = section?.querySelectorAll(".md\\:col-span-3");
    expect(span3Cols?.length).toBeGreaterThanOrEqual(2);
  });

  it("all compartments default to full width (col-span-12) on mobile", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    const section = container.querySelector("#identity");
    const fullCols = section?.querySelectorAll(".col-span-12");
    // Bio, Status, Connections, R&D = 4
    expect(fullCols?.length).toBeGreaterThanOrEqual(4);
  });

  it("shows Loading component while R&D data is fetching", () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // Never resolves
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    expect(container.textContent).toContain("Loading");
  });

  it("handles R&D fetch error gracefully without crashing", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    // Should not crash: page still renders
    expect(container.querySelector("#identity")).not.toBeNull();
    // Wait for error state to propagate
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(container.textContent).toContain("R&D data unavailable");
  });

  it("uses metadata values from lib/metadata.ts for all decorative elements", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: false } },
    });
    const text = container.textContent || "";
    expect(text).toContain("TI-0510");
    expect(text).toContain("UPTIME:");
    expect(text).toContain("EXP.CYCLES:");
    expect(text).toContain("SYS.TIME:");
  });
});
