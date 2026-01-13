import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConstructionPage from "../../components/construction-page";

// Mock de useTranslation
const mockI18n = {
  language: "en",
};

const mockT = jest.fn(
  (key: string, defaultValue?: string) => defaultValue || key
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: mockI18n,
  }),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Construction: jest.fn(({ className }) => (
    <div data-testid="construction-icon" className={className} />
  )),
  ArrowLeft: jest.fn(({ className }) => (
    <div data-testid="arrow-left-icon" className={className} />
  )),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, className }: any) => (
    <button className={className} data-testid="back-button">
      {children}
    </button>
  ),
}));

// Mock de Link component (wouter)
jest.mock("wouter", () => ({
  Link: ({ href, children }: any) => (
    <a href={href} data-testid="link">
      {children}
    </a>
  ),
}));

describe("ConstructionPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
    mockI18n.language = "en";
  });

  describe("Basic Rendering", () => {
    it("should render title", () => {
      render(<ConstructionPage title="Test Title" />);

      expect(screen.getByText("Test Title")).toBeTruthy();
    });

    it("should render construction icon", () => {
      render(<ConstructionPage title="Test Title" />);

      expect(screen.getByTestId("construction-icon")).toBeTruthy();
    });

    it("should render back button with icon", () => {
      render(<ConstructionPage title="Test Title" />);

      expect(screen.getByTestId("back-button")).toBeTruthy();
      expect(screen.getByTestId("arrow-left-icon")).toBeTruthy();
    });

    it("should render link to home page", () => {
      render(<ConstructionPage title="Test Title" />);

      const link = screen.getByTestId("link");
      expect(link.getAttribute("href")).toBe("/");
    });
  });

  describe("Subtitle", () => {
    it("should render subtitle when provided", () => {
      render(<ConstructionPage title="Test Title" subtitle="Test Subtitle" />);

      expect(screen.getByText("Test Subtitle")).toBeTruthy();
    });

    it("should not render subtitle when not provided", () => {
      render(<ConstructionPage title="Test Title" />);

      expect(screen.queryByText("Test Subtitle")).toBeNull();
    });
  });

  describe("Language Support", () => {
    it("should show English message when language is English", () => {
      mockI18n.language = "en";
      render(<ConstructionPage title="Test Title" />);

      expect(screen.getByText("This page is under construction.")).toBeTruthy();
      expect(screen.getByText("Back to home page")).toBeTruthy();
    });

    it("should show Spanish message when language starts with 'es'", () => {
      mockI18n.language = "es";
      render(<ConstructionPage title="Test Title" />);

      expect(
        screen.getByText("Esta página está en construcción.")
      ).toBeTruthy();
      expect(screen.getByText("Volver a la página principal")).toBeTruthy();
    });

    it("should show Spanish message when language is 'es-MX'", () => {
      mockI18n.language = "es-MX";
      render(<ConstructionPage title="Test Title" />);

      expect(
        screen.getByText("Esta página está en construcción.")
      ).toBeTruthy();
    });

    it("should show Spanish message when language is 'es-ES'", () => {
      mockI18n.language = "es-ES";
      render(<ConstructionPage title="Test Title" />);

      expect(
        screen.getByText("Esta página está en construcción.")
      ).toBeTruthy();
    });

    it("should update message when language changes", () => {
      mockI18n.language = "en";
      const { rerender } = render(<ConstructionPage title="Test Title" />);

      expect(screen.getByText("This page is under construction.")).toBeTruthy();

      // Change language
      mockI18n.language = "es";
      rerender(<ConstructionPage title="Test Title" />);

      expect(
        screen.getByText("Esta página está en construcción.")
      ).toBeTruthy();
    });
  });

  describe("Styling", () => {
    it("should apply correct container classes", () => {
      const { container } = render(<ConstructionPage title="Test Title" />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv?.className).toContain("min-h-screen");
      expect(mainDiv?.className).toContain("bg-gradient-to-br");
    });

    it("should apply correct title classes", () => {
      render(<ConstructionPage title="Test Title" />);

      const title = screen.getByText("Test Title");
      expect(title.className).toContain("text-3xl");
      expect(title.className).toContain("font-bold");
      expect(title.className).toContain("bg-gradient-to-r");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty title", () => {
      const { container } = render(<ConstructionPage title="" />);

      const title = container.querySelector("h1");
      expect(title).toBeTruthy();
      expect(title?.textContent).toBe("");
    });

    it("should handle very long title", () => {
      const longTitle = "A".repeat(200);
      render(<ConstructionPage title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeTruthy();
    });

    it("should not render subtitle when empty string", () => {
      const { container } = render(
        <ConstructionPage title="Test" subtitle="" />
      );

      // Empty string is falsy, so subtitle should not be rendered
      const subtitle = container.querySelector("p.text-gray-500");
      expect(subtitle).toBeNull();
    });

    it("should handle special characters in title", () => {
      const specialTitle = "Test! @#$%^&*() 世界 🌟";
      render(<ConstructionPage title={specialTitle} />);

      expect(screen.getByText(specialTitle)).toBeTruthy();
    });
  });
});
