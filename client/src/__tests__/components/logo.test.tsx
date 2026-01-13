import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Logo } from "../../components/logo";

// Mock de wouter Link
jest.mock("wouter", () => ({
  Link: ({ children, href, className }: any) => (
    <a href={href} className={className} data-testid="logo-link">
      {children}
    </a>
  ),
}));

// Mock de la imagen del logo
jest.mock("@/assets/logo.png", () => "logo.png");

describe("Logo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render logo component", () => {
      const { container } = render(<Logo />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render logo image", () => {
      render(<Logo />);

      const img = screen.getByAltText("Logo");
      expect(img).toBeTruthy();
      expect(img.getAttribute("src")).toBe("logo.png");
    });

    it("should render link to home", () => {
      render(<Logo />);

      const link = screen.getByTestId("logo-link");
      expect(link.getAttribute("href")).toBe("/");
    });
  });

  describe("Text Display", () => {
    it("should render text by default", () => {
      render(<Logo />);

      expect(screen.getByText("Fanlist")).toBeTruthy();
    });

    it("should render text when showText is true", () => {
      render(<Logo showText={true} />);

      expect(screen.getByText("Fanlist")).toBeTruthy();
    });

    it("should not render text when showText is false", () => {
      render(<Logo showText={false} />);

      expect(screen.queryByText("Fanlist")).toBeNull();
    });
  });

  describe("Styling", () => {
    it("should apply default classes to link", () => {
      render(<Logo />);

      const link = screen.getByTestId("logo-link");
      expect(link.className).toContain("flex");
      expect(link.className).toContain("items-center");
    });

    it("should apply custom className", () => {
      render(<Logo className="custom-class" />);

      const link = screen.getByTestId("logo-link");
      expect(link.className).toContain("custom-class");
    });

    it("should have correct image classes", () => {
      render(<Logo />);

      const img = screen.getByAltText("Logo");
      expect(img.className).toContain("h-8");
      expect(img.className).toContain("w-8");
      expect(img.className).toContain("object-contain");
    });

    it("should have correct text classes", () => {
      render(<Logo />);

      const heading = screen.getByText("Fanlist");
      expect(heading.className).toContain("ml-2");
      expect(heading.className).toContain("sm:ml-3");
      expect(heading.className).toContain("text-lg");
      expect(heading.className).toContain("sm:text-xl");
      expect(heading.className).toContain("font-heading");
      expect(heading.className).toContain("font-bold");
      expect(heading.className).toContain("text-neutral-800");
      expect(heading.className).toContain("dark:text-white");
      expect(heading.tagName).toBe("H1");
    });
  });

  describe("Props", () => {
    it("should handle empty className", () => {
      render(<Logo className="" />);

      const link = screen.getByTestId("logo-link");
      expect(link.className).toContain("flex");
      expect(link.className).toContain("items-center");
    });

    it("should combine default and custom classes", () => {
      render(<Logo className="my-custom-class" />);

      const link = screen.getByTestId("logo-link");
      expect(link.className).toContain("flex");
      expect(link.className).toContain("items-center");
      expect(link.className).toContain("my-custom-class");
    });
  });
});
