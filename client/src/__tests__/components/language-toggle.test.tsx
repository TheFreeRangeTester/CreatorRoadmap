import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LanguageToggle } from "../../components/language-toggle";

// Mock de useTranslation
const mockChangeLanguage = jest.fn();
const mockI18n = {
  language: "en",
  changeLanguage: mockChangeLanguage,
};

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: mockI18n,
  }),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Globe: jest.fn(({ className }) => (
    <div data-testid="globe-icon" className={className} />
  )),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
}));

// Mock de DropdownMenu components
const mockDropdownMenuItemClick = jest.fn();

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children, asChild }: any) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children, align }: any) => (
    <div data-testid="dropdown-content" data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onClick, className }: any) => (
    <div data-testid="dropdown-item" onClick={onClick} className={className}>
      {children}
    </div>
  ),
}));

// Mock de framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, whileHover, whileTap, className }: any) => (
      <div
        data-testid="motion-div"
        data-while-hover={JSON.stringify(whileHover)}
        data-while-tap={JSON.stringify(whileTap)}
        className={className}
      >
        {children}
      </div>
    ),
    span: ({ children, whileHover, className }: any) => (
      <span
        data-testid="motion-span"
        data-while-hover={JSON.stringify(whileHover)}
        className={className}
      >
        {children}
      </span>
    ),
  },
}));

describe("LanguageToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockI18n.language = "en";
  });

  describe("Basic Rendering", () => {
    it("should render language toggle", () => {
      const { container } = render(<LanguageToggle />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render dropdown menu", () => {
      render(<LanguageToggle />);

      expect(screen.getByTestId("dropdown-menu")).toBeTruthy();
    });

    it("should render globe icon", () => {
      render(<LanguageToggle />);

      expect(screen.getByTestId("globe-icon")).toBeTruthy();
    });

    it("should render current language label", () => {
      render(<LanguageToggle />);

      expect(screen.getByText("EN")).toBeTruthy();
    });
  });

  describe("Language Display", () => {
    it("should display EN when language is en", () => {
      mockI18n.language = "en";
      render(<LanguageToggle />);

      expect(screen.getByText("EN")).toBeTruthy();
    });

    it("should display ES when language is es", () => {
      mockI18n.language = "es";
      render(<LanguageToggle />);

      expect(screen.getByText("ES")).toBeTruthy();
    });

    it("should default to EN for unknown language", () => {
      mockI18n.language = "fr";
      render(<LanguageToggle />);

      expect(screen.getByText("EN")).toBeTruthy();
    });
  });

  describe("Language Selection", () => {
    it("should call changeLanguage with 'en' when English is clicked", () => {
      render(<LanguageToggle />);

      const englishItem = screen
        .getAllByTestId("dropdown-item")
        .find((item) => item.textContent === "English");

      if (englishItem) {
        fireEvent.click(englishItem);
      }

      expect(mockChangeLanguage).toHaveBeenCalledWith("en");
    });

    it("should call changeLanguage with 'es' when Español is clicked", () => {
      render(<LanguageToggle />);

      const spanishItem = screen
        .getAllByTestId("dropdown-item")
        .find((item) => item.textContent === "Español");

      if (spanishItem) {
        fireEvent.click(spanishItem);
      }

      expect(mockChangeLanguage).toHaveBeenCalledWith("es");
    });
  });

  describe("Active Language Highlighting", () => {
    it("should highlight English when language is en", () => {
      mockI18n.language = "en";
      render(<LanguageToggle />);

      const englishItem = screen
        .getAllByTestId("dropdown-item")
        .find((item) => item.textContent === "English");

      expect(englishItem?.className).toContain("bg-primary/10");
      expect(englishItem?.className).toContain("text-primary");
    });

    it("should highlight Español when language is es", () => {
      mockI18n.language = "es";
      render(<LanguageToggle />);

      const spanishItem = screen
        .getAllByTestId("dropdown-item")
        .find((item) => item.textContent === "Español");

      expect(spanishItem?.className).toContain("bg-primary/10");
      expect(spanishItem?.className).toContain("text-primary");
    });

    it("should not highlight inactive language", () => {
      mockI18n.language = "en";
      render(<LanguageToggle />);

      const spanishItem = screen
        .getAllByTestId("dropdown-item")
        .find((item) => item.textContent === "Español");

      expect(spanishItem?.className).not.toContain("bg-primary/10");
      expect(spanishItem?.className).not.toContain("text-primary");
    });
  });

  describe("Animation Props", () => {
    it("should have motion.div with hover and tap animations", () => {
      render(<LanguageToggle />);

      const motionDiv = screen.getByTestId("motion-div");
      const whileHover = JSON.parse(
        motionDiv.getAttribute("data-while-hover") || "{}"
      );
      const whileTap = JSON.parse(
        motionDiv.getAttribute("data-while-tap") || "{}"
      );

      expect(whileHover.scale).toBe(1.05);
      expect(whileTap.scale).toBe(0.95);
    });

    it("should have motion.span with rotate animation", () => {
      render(<LanguageToggle />);

      const motionSpan = screen.getByTestId("motion-span");
      const whileHover = JSON.parse(
        motionSpan.getAttribute("data-while-hover") || "{}"
      );

      expect(Array.isArray(whileHover.rotate)).toBe(true);
      expect(whileHover.transition?.duration).toBe(0.5);
    });
  });

  describe("Dropdown Menu Configuration", () => {
    it("should have dropdown content aligned to end", () => {
      render(<LanguageToggle />);

      const dropdownContent = screen.getByTestId("dropdown-content");
      expect(dropdownContent.getAttribute("data-align")).toBe("end");
    });

    it("should render both language options", () => {
      render(<LanguageToggle />);

      expect(screen.getByText("English")).toBeTruthy();
      expect(screen.getByText("Español")).toBeTruthy();
    });
  });
});
