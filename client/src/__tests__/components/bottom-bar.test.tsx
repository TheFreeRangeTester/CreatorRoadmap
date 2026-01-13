import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BottomBar } from "../../components/bottom-bar";

describe("BottomBar", () => {
  describe("Rendering", () => {
    it("should render the component", () => {
      const { container } = render(<BottomBar />);
      expect(container.firstChild).toBeTruthy();
    });

    it("should have fixed positioning classes", () => {
      const { container } = render(<BottomBar />);
      const element = container.firstChild as HTMLElement;
      
      expect(element.className).toContain("fixed");
      expect(element.className).toContain("bottom-0");
      expect(element.className).toContain("left-0");
      expect(element.className).toContain("right-0");
    });

    it("should be hidden on medium screens and above", () => {
      const { container } = render(<BottomBar />);
      const element = container.firstChild as HTMLElement;
      
      expect(element.className).toContain("md:hidden");
    });

    it("should have background and border classes", () => {
      const { container } = render(<BottomBar />);
      const element = container.firstChild as HTMLElement;
      
      expect(element.className).toContain("bg-white");
      expect(element.className).toContain("dark:bg-gray-900");
      expect(element.className).toContain("border-t");
      expect(element.className).toContain("border-gray-200");
      expect(element.className).toContain("dark:border-gray-800");
    });

    it("should have z-index class", () => {
      const { container } = render(<BottomBar />);
      const element = container.firstChild as HTMLElement;
      
      expect(element.className).toContain("z-50");
    });

    it("should render container with proper classes", () => {
      const { container } = render(<BottomBar />);
      const containerElement = container.querySelector(".container");
      
      expect(containerElement).toBeTruthy();
      expect(containerElement?.className).toContain("mx-auto");
      expect(containerElement?.className).toContain("px-4");
    });

    it("should render inner flex container", () => {
      const { container } = render(<BottomBar />);
      const flexContainer = container.querySelector(".flex");
      
      expect(flexContainer).toBeTruthy();
      expect(flexContainer?.className).toContain("items-center");
      expect(flexContainer?.className).toContain("justify-center");
      expect(flexContainer?.className).toContain("gap-4");
      expect(flexContainer?.className).toContain("h-16");
    });

    it("should have empty content area", () => {
      const { container } = render(<BottomBar />);
      const flexContainer = container.querySelector(".flex");
      
      // The flex container should be empty (no children)
      expect(flexContainer?.children.length).toBe(0);
    });
  });

  describe("Structure", () => {
    it("should have correct DOM structure", () => {
      const { container } = render(<BottomBar />);
      
      // Should have main div
      const mainDiv = container.firstChild;
      expect(mainDiv).toBeTruthy();
      
      // Should have container div
      const containerDiv = container.querySelector(".container");
      expect(containerDiv).toBeTruthy();
      
      // Should have flex div
      const flexDiv = container.querySelector(".flex");
      expect(flexDiv).toBeTruthy();
    });
  });
});
