import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/svelte";

vi.mock("$lib/metadata", () => ({
  getUnitSerial: () => "TI-0510",
  getUptime: () => "20.00 YRS",
  getExperienceCycles: () => "EXP.CYCLES: 6",
  getSystemTime: () => "SYS.TIME: 12:00:00 UTC",
  getManufacturingDate: () => "MFG: LOT-05-10",
  DIVISION: "DIVISION: CORE.ENG",
  UNIT_SERIAL: "TI-0510",
  ARCHIVE_REF: "ARC-2019-FWD",
}));

import ManifestPage from "./+page.svelte";

const mockProjects = [
  {
    name: "project-alpha",
    description: "A machine learning framework",
    githubUrl: "https://github.com/ItsThompson/project-alpha",
    homepageUrl: "https://alpha.dev",
    primaryLanguage: { name: "Python", color: "#3572A5" },
  },
  {
    name: "project-beta",
    description: "A web component library",
    githubUrl: "https://github.com/ItsThompson/project-beta",
    homepageUrl: "",
    primaryLanguage: { name: "TypeScript", color: "#3178c6" },
  },
  {
    name: "project-gamma",
    description: "",
    githubUrl: "https://github.com/ItsThompson/project-gamma",
    homepageUrl: "",
    primaryLanguage: null,
  },
];

describe("Manifest Page - Projects Section", () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the projects section with id="projects"', () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: mockProjects, projectsError: false } },
    });
    const section = container.querySelector("section#projects");
    expect(section).not.toBeNull();
  });

  it('renders the Divider with label "PROJECTS"', () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: mockProjects, projectsError: false } },
    });
    const section = container.querySelector("section#projects");
    const dividerText = section?.textContent;
    expect(dividerText).toContain("PROJECTS");
  });

  it('renders the SectionHeading "PINNED REPOSITORIES"', () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: mockProjects, projectsError: false } },
    });
    const heading = container.querySelector("section#projects h2");
    expect(heading?.textContent).toContain("PINNED REPOSITORIES");
  });

  it("renders a 3-column responsive grid", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: mockProjects, projectsError: false } },
    });
    const grid = container.querySelector("section#projects .grid");
    expect(grid?.classList.contains("grid-cols-1")).toBe(true);
    expect(grid?.classList.contains("md:grid-cols-2")).toBe(true);
    expect(grid?.classList.contains("lg:grid-cols-3")).toBe(true);
  });

  it("renders each project name as a link to GitHub", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: mockProjects, projectsError: false } },
    });
    const links = container.querySelectorAll(
      'section#projects a[target="_blank"]',
    );
    expect(links.length).toBe(3);
    expect(links[0].textContent?.trim()).toBe("project-alpha");
    expect(links[0].getAttribute("href")).toBe(
      "https://github.com/ItsThompson/project-alpha",
    );
    expect(links[0].getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("renders project descriptions when present", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: mockProjects, projectsError: false } },
    });
    const section = container.querySelector("section#projects");
    expect(section?.textContent).toContain("A machine learning framework");
    expect(section?.textContent).toContain("A web component library");
  });

  it("renders primary language with color dot", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: mockProjects, projectsError: false } },
    });
    const dots = container.querySelectorAll(
      "section#projects span.rounded-full",
    );
    expect(dots.length).toBe(2); // Only 2 projects have primaryLanguage
    expect((dots[0] as HTMLElement).style.backgroundColor).toBe(
      "rgb(53, 114, 165)",
    );
  });

  it("renders language name text", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: mockProjects, projectsError: false } },
    });
    const section = container.querySelector("section#projects");
    expect(section?.textContent).toContain("Python");
    expect(section?.textContent).toContain("TypeScript");
  });

  it("renders the MetadataBar with project count and source", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: mockProjects, projectsError: false } },
    });
    const section = container.querySelector("section#projects");
    expect(section?.textContent).toContain(
      "PINNED: 3 // SOURCE: github.com/ItsThompson",
    );
  });

  it("renders Chevrons decoration", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: mockProjects, projectsError: false } },
    });
    const section = container.querySelector("section#projects");
    expect(section?.textContent).toContain(">>>>");
  });

  it("shows error message when projectsError is true and projects is empty", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: [], projectsError: true } },
    });
    const section = container.querySelector("section#projects");
    expect(section?.textContent).toContain("Unable to load projects");
  });

  it("does not show error message when projects are loaded successfully", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: mockProjects, projectsError: false } },
    });
    const section = container.querySelector("section#projects");
    expect(section?.textContent).not.toContain("Unable to load projects");
  });

  it("wraps each project in a Compartment (border div)", () => {
    const { container } = render(ManifestPage, {
      props: { data: { projects: mockProjects, projectsError: false } },
    });
    const grid = container.querySelector("section#projects .grid");
    const compartments = grid?.querySelectorAll(":scope > div.border");
    expect(compartments?.length).toBe(3);
  });
});
