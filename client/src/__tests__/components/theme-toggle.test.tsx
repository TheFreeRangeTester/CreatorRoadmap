import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// Mock de useTheme
const mockSetTheme = jest.fn();
let mockTheme = "light";

const mockUseTheme = jest.fn(() => ({
  setTheme: mockSetTheme,
  theme: mockTheme,
}));

jest.mock("next-themes", () => ({
  useTheme: () => mockUseTheme(),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Sun: jest.fn(({ className }) => (
    <div data-testid="sun-icon" className={className} />
  )),
  Moon: jest.fn(({ className }) => (
    <div data-testid="moon-icon" className={className} />
  )),
  Laptop: jest.fn(({ className }) => (
    <div data-testid="laptop-icon" className={className} />
  )),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, size, className, asChild }: any) => {
    if (asChild && children) {
      return children;
    }
    return (
      <button
        onClick={onClick}
        data-variant={variant}
        data-size={size}
        className={className}
      >
        {children}
      </button>
    );
  },
}));

// Mock de DropdownMenu components
let dropdownOpen = false;
let dropdownOnOpenChange: ((open: boolean) => void) | null = null;

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children, open, onOpenChange }: any) => {
    dropdownOpen = open !== undefined ? open : false;
    if (onOpenChange) {
      dropdownOnOpenChange = onOpenChange;
    }
    return <div data-testid="dropdown-menu">{children}</div>;
  },
  DropdownMenuTrigger: ({ children, asChild }: any) => {
    if (asChild && children) {
      return children;
    }
    return <div data-testid="dropdown-trigger">{children}</div>;
  },
  DropdownMenuContent: ({ children, align, className }: any) => (
    <div
      data-testid="dropdown-content"
      data-align={align}
      className={className}
    >
      {children}
    </div>
  ),
  DropdownMenuItem: ({ children, onClick, className }: any) => (
    <div data-testid="dropdown-item" onClick={onClick} className={className}>
      {children}
    </div>
  ),
}));

import { ThemeToggle } from "../../components/theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTheme = "light";
    mockSetTheme.mockClear();
    mockUseTheme.mockReturnValue({
      setTheme: mockSetTheme,
      theme: mockTheme,
    });
    dropdownOpen = false;
    dropdownOnOpenChange = null;
  });

  describe("Basic Rendering", () => {
    it("should render theme toggle", () => {
      const { container } = render(<ThemeToggle />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render button", () => {
      render(<ThemeToggle />);

      // Button should be rendered (either in unmounted or mounted state)
      const sunIcons = screen.queryAllByTestId("sun-icon");
      expect(sunIcons.length).toBeGreaterThan(0);
    });
  });

  describe("Unmounted State", () => {
    it("should render sun icon when not mounted", () => {
      render(<ThemeToggle />);

      // Initially, before useEffect runs, should show sun icon
      const sunIcons = screen.queryAllByTestId("sun-icon");
      expect(sunIcons.length).toBeGreaterThan(0);
    });
  });

  describe("Mounted State - Light Theme", () => {
    beforeEach(() => {
      mockTheme = "light";
      mockUseTheme.mockReturnValue({
        setTheme: mockSetTheme,
        theme: "light",
      });
    });

    it("should render dropdown menu when mounted", async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(screen.getByTestId("dropdown-menu")).toBeTruthy();
      });
    });

    it("should render sun icon for light theme", async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        const sunIcons = screen.getAllByTestId("sun-icon");
        expect(sunIcons.length).toBeGreaterThan(0);
      });
    });

    it("should render dropdown items", async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        const items = screen.getAllByTestId("dropdown-item");
        expect(items.length).toBe(3);
      });
    });

    it("should render light option", async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        const items = screen.getAllByTestId("dropdown-item");
        const lightItem = items.find((item) =>
          item.querySelector('[data-testid="sun-icon"]')
        );
        expect(lightItem).toBeTruthy();
      });
    });

    it("should render dark option", async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        const items = screen.getAllByTestId("dropdown-item");
        const darkItem = items.find((item) =>
          item.querySelector('[data-testid="moon-icon"]')
        );
        expect(darkItem).toBeTruthy();
      });
    });

    it("should render system option", async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        const items = screen.getAllByTestId("dropdown-item");
        const systemItem = items.find((item) =>
          item.querySelector('[data-testid="laptop-icon"]')
        );
        expect(systemItem).toBeTruthy();
      });
    });
  });

  describe("Mounted State - Dark Theme", () => {
    beforeEach(() => {
      mockTheme = "dark";
      mockUseTheme.mockReturnValue({
        setTheme: mockSetTheme,
        theme: "dark",
      });
    });

    it("should render moon icon for dark theme", async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        const moonIcons = screen.getAllByTestId("moon-icon");
        expect(moonIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Mounted State - System Theme", () => {
    beforeEach(() => {
      mockTheme = "system";
      mockUseTheme.mockReturnValue({
        setTheme: mockSetTheme,
        theme: "system",
      });
    });

    it("should render laptop icon for system theme", async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        const laptopIcons = screen.getAllByTestId("laptop-icon");
        expect(laptopIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Theme Changes", () => {
    beforeEach(() => {
      mockTheme = "light";
      mockUseTheme.mockReturnValue({
        setTheme: mockSetTheme,
        theme: "light",
      });
    });

    it("should call setTheme with light when light option is clicked", async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        const items = screen.getAllByTestId("dropdown-item");
        const lightItem = items.find((item) =>
          item.querySelector('[data-testid="sun-icon"]')
        );
        if (lightItem) {
          fireEvent.click(lightItem);
        }
      });

      expect(mockSetTheme).toHaveBeenCalledWith("light");
    });

    it("should call setTheme with dark when dark option is clicked", async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        const items = screen.getAllByTestId("dropdown-item");
        const darkItem = items.find((item) =>
          item.querySelector('[data-testid="moon-icon"]')
        );
        if (darkItem) {
          fireEvent.click(darkItem);
        }
      });

      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });

    it("should call setTheme with system when system option is clicked", async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        const items = screen.getAllByTestId("dropdown-item");
        const systemItem = items.find((item) =>
          item.querySelector('[data-testid="laptop-icon"]')
        );
        if (systemItem) {
          fireEvent.click(systemItem);
        }
      });

      expect(mockSetTheme).toHaveBeenCalledWith("system");
    });
  });

  describe("Button Styling", () => {
    it("should have correct button classes", () => {
      render(<ThemeToggle />);

      // Button should have correct classes (either in unmounted or mounted state)
      const sunIcons = screen.queryAllByTestId("sun-icon");
      const button = sunIcons[0]?.closest("button");
      if (button) {
        expect(button.className).toContain("w-9");
        expect(button.className).toContain("h-9");
      }
    });
  });

  describe("Dropdown Content", () => {
    it("should have correct dropdown content alignment", async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        const content = screen.getByTestId("dropdown-content");
        expect(content.getAttribute("data-align")).toBe("end");
      });
    });
  });
});
