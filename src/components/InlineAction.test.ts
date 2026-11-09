import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import InlineAction from "./InlineAction.svelte";
import type { NoteScreenshot } from "$lib/bio-links";

const ACCENT = "#FF6363";
const RETURN_SYMBOL = "\u21B5";

const SCREENSHOT: NoteScreenshot = {
  staticAssetPathWithDeployBase: "/old-site.png",
  alt: "Screenshot of the first website",
  intrinsicPixelWidth: 2048,
  intrinsicPixelHeight: 1610,
};

function renderAction(props: Record<string, unknown> = {}) {
  return render(InlineAction, {
    props: {
      target: "test",
      accent: ACCENT,
      label: "Label / Test",
      note: "A note that is long enough to describe what the action reveals.",
      ...props,
    },
  });
}

function trigger(container: HTMLElement): HTMLElement {
  const element = container.querySelector("[aria-describedby]");
  if (!element) throw new Error("No trigger rendered");
  return element as HTMLElement;
}

function noteFor(container: HTMLElement): HTMLElement {
  const element = container.querySelector('[role="tooltip"]');
  if (!element) throw new Error("No note rendered");
  return element as HTMLElement;
}

describe("InlineAction", () => {
  afterEach(() => {
    cleanup();
  });

  describe("positioning the note", () => {
    const FIRST_LINE = new DOMRect(0, 100, 300, 20);
    const SECOND_LINE = new DOMRect(0, 120, 120, 20);

    /** An action that wrapped, so the browser reports one rect per line. */
    function wrapAcrossTwoLines(element: HTMLElement): void {
      element.getClientRects = () =>
        [FIRST_LINE, SECOND_LINE] as unknown as DOMRectList;
      // The union spans the paragraph, which is what made the note land badly.
      element.getBoundingClientRect = () => new DOMRect(0, 100, 300, 40);
    }

    function noteLeft(container: HTMLElement): string | undefined {
      return noteFor(container).style.left;
    }

    it("anchors the note to the line the pointer is on", async () => {
      const { container } = renderAction();
      const element = trigger(container);
      wrapAcrossTwoLines(element);

      // Inside the second, shorter line.
      await fireEvent.mouseEnter(element, { clientX: 100, clientY: 130 });
      await tick();

      // Centred on the 120px line, not on the 300px union of both.
      expect(noteLeft(container)).toBe("60px");
    });

    it("follows the pointer as it moves between lines", async () => {
      const { container } = renderAction();
      const element = trigger(container);
      wrapAcrossTwoLines(element);

      await fireEvent.mouseEnter(element, { clientX: 200, clientY: 110 });
      await tick();
      expect(noteLeft(container)).toBe("150px");

      await fireEvent.mouseMove(element, { clientX: 100, clientY: 130 });
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      await tick();

      expect(noteLeft(container)).toBe("60px");
    });

    it("anchors to the first line when focus opens the note", async () => {
      const { container } = renderAction();
      wrapAcrossTwoLines(trigger(container));

      await fireEvent.focus(trigger(container));
      await tick();

      expect(noteLeft(container)).toBe("150px");
    });
  });

  describe("trigger semantics", () => {
    it("renders an anchor with the given destination", () => {
      const { container } = renderAction({ href: "/experience" });
      const element = trigger(container);

      expect(element.tagName).toBe("A");
      expect(element.getAttribute("href")).toBe("/experience");
      expect(element.getAttribute("role")).toBe("link");
    });

    it("gives an action that runs in place button semantics, on a span", async () => {
      const onActivate = vi.fn();
      const { container } = renderAction({ onActivate });
      const element = trigger(container);

      // A span keeps the action in the text flow, so it wraps like prose.
      expect(element.tagName).toBe("SPAN");
      expect(element.getAttribute("role")).toBe("button");
      expect(element.getAttribute("tabindex")).toBe("0");

      await fireEvent.click(element);
      expect(onActivate).toHaveBeenCalledTimes(1);
    });

    it("activates a span action from the keyboard", async () => {
      const onActivate = vi.fn();
      const { container } = renderAction({ onActivate });
      const element = trigger(container);

      await fireEvent.keyDown(element, { key: "Enter" });
      expect(onActivate).toHaveBeenCalledTimes(1);

      await fireEvent.keyDown(element, { key: " " });
      expect(onActivate).toHaveBeenCalledTimes(2);
    });

    it("marks a keyboard activation as such, so focus can return on close", async () => {
      const onActivate = vi.fn();
      const { container } = renderAction({ onActivate });

      await fireEvent.keyDown(trigger(container), { key: "Enter" });

      expect(onActivate.mock.calls[0][0].detail).toBe(0);
    });

    it("renders a focusable span when the action only reveals its note", async () => {
      const { container } = renderAction();
      const element = trigger(container);

      expect(element.tagName).toBe("SPAN");
      expect(element.getAttribute("tabindex")).toBe("0");
      expect(element.hasAttribute("role")).toBe(false);
      expect(element.hasAttribute("href")).toBe(false);
      expect(container.querySelector("a")).toBeNull();
      expect(container.querySelector("button")).toBeNull();
    });

    it("describes the trigger with the note, in the document", () => {
      const { container } = renderAction();
      const element = trigger(container);

      expect(element.getAttribute("aria-describedby")).toBe(
        noteFor(container).id,
      );
    });
  });

  describe("revealing the note", () => {
    it("keeps the note hidden until the reader asks for it", () => {
      const { container } = renderAction();
      expect(noteFor(container).className).toContain("invisible");
    });

    it("shows the note on hover", async () => {
      const { container } = renderAction();

      await fireEvent.mouseEnter(trigger(container));
      await tick();

      expect(noteFor(container).className).toContain("visible");
    });

    it("shows the note on keyboard focus", async () => {
      const { container } = renderAction();

      await fireEvent.focus(trigger(container));
      await tick();

      expect(noteFor(container).className).toContain("visible");
    });

    it("hides the note when the pointer leaves", async () => {
      const { container } = renderAction();

      await fireEvent.mouseEnter(trigger(container));
      await tick();
      await fireEvent.mouseLeave(trigger(container));
      await tick();

      expect(noteFor(container).className).toContain("invisible");
    });

    it("hides the note on Escape", async () => {
      const { container } = renderAction();

      await fireEvent.focus(trigger(container));
      await tick();
      await fireEvent.keyDown(trigger(container), { key: "Escape" });
      await tick();

      expect(noteFor(container).className).toContain("invisible");
    });
  });

  describe("activating the note", () => {
    it("marks an anchor as opening a target", () => {
      const { container } = renderAction({ href: "/experience" });
      expect(noteFor(container).textContent).toContain(RETURN_SYMBOL);
    });

    it("marks a button as opening a target", () => {
      const { container } = renderAction({ onActivate: vi.fn() });
      expect(noteFor(container).textContent).toContain(RETURN_SYMBOL);
    });

    it("leaves the return symbol off an action that only reveals its note", () => {
      const { container } = renderAction();
      expect(noteFor(container).textContent).not.toContain(RETURN_SYMBOL);
    });
  });

  describe("screenshot in the note", () => {
    it("fetches nothing before the note opens", () => {
      const { container } = renderAction({ screenshot: SCREENSHOT });
      expect(noteFor(container).querySelector("img")).toBeNull();
    });

    it("renders the image with its alt text and intrinsic size once open", async () => {
      const { container } = renderAction({ screenshot: SCREENSHOT });

      await fireEvent.focus(trigger(container));
      await tick();

      const image = noteFor(container).querySelector("img");
      if (!image) throw new Error("No screenshot rendered");

      expect(image.getAttribute("src")).toBe("/old-site.png");
      expect(image.getAttribute("alt")).toBe("Screenshot of the first website");
      // The declared size reserves the image box before the bytes arrive.
      expect(image.getAttribute("width")).toBe("2048");
      expect(image.getAttribute("height")).toBe("1610");
      expect(image.className).toContain("w-full");
    });

    it("drops the image again when the note closes", async () => {
      const { container } = renderAction({ screenshot: SCREENSHOT });

      await fireEvent.focus(trigger(container));
      await tick();
      await fireEvent.blur(trigger(container));
      await tick();

      expect(noteFor(container).querySelector("img")).toBeNull();
    });

    it("renders no image when the action has none", async () => {
      const { container } = renderAction();

      await fireEvent.focus(trigger(container));
      await tick();

      expect(noteFor(container).querySelector("img")).toBeNull();
    });

    it("leaves out the description line when the action has no note", async () => {
      const { container } = renderAction({
        note: undefined,
        screenshot: SCREENSHOT,
      });

      await fireEvent.focus(trigger(container));
      await tick();

      const note = noteFor(container);
      expect(note.querySelector("img")).toBeTruthy();
      expect(note.textContent).toContain("Label / Test");
      expect(note.textContent).not.toContain("A note that is long enough");
    });
  });
});
