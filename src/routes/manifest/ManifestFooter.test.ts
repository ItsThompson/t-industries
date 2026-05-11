import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import ManifestFooter from "./ManifestFooter.svelte";

describe("ManifestFooter", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders a footer element", () => {
    const { container } = render(ManifestFooter);
    const footer = container.querySelector("footer");
    expect(footer).toBeTruthy();
  });

  it("renders the archive ref ARC-2019-FWD", () => {
    const { container } = render(ManifestFooter);
    const text = container.textContent ?? "";
    expect(text).toContain("ARC-2019-FWD");
  });

  it("renders the manufacturing date MFG: LOT-05-10", () => {
    const { container } = render(ManifestFooter);
    const text = container.textContent ?? "";
    expect(text).toContain("MFG: LOT-05-10");
  });

  it("renders a timestamp (numeric)", () => {
    const { container } = render(ManifestFooter);
    const text = container.textContent ?? "";
    // Should contain a numeric timestamp (13-digit millisecond epoch)
    expect(text).toMatch(/\d{13}/);
  });

  it("renders the copyright text", () => {
    const { container } = render(ManifestFooter);
    const text = container.textContent ?? "";
    expect(text).toContain("t-industries (ti) no rights reserved.");
  });

  it("uses MetadataBar with bottom position (has border-t)", () => {
    const { container } = render(ManifestFooter);
    const metadataBar = container.querySelector(".border-t");
    expect(metadataBar).toBeTruthy();
  });
});
