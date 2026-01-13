import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValue?: string) => defaultValue || key
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de useIsMobile
const mockIsMobile = jest.fn(() => false);

jest.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => mockIsMobile(),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Lightbulb: jest.fn(({ className }) => (
    <div data-testid="lightbulb-icon" className={className} />
  )),
}));

// Mock de Tooltip components
jest.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children, delayDuration }: any) => (
    <div data-testid="tooltip-provider" data-delay-duration={delayDuration}>
      {children}
    </div>
  ),
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) => {
    if (asChild && children) {
      return children;
    }
    return <div data-testid="tooltip-trigger">{children}</div>;
  },
  TooltipContent: ({ children, className, side, align, sideOffset }: any) => (
    <div
      data-testid="tooltip-content"
      className={className}
      data-side={side}
      data-align={align}
      data-side-offset={sideOffset}
    >
      {children}
    </div>
  ),
}));

import { SharingTipsTooltip } from "../../components/sharing-tips-tooltip";

describe("SharingTipsTooltip", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
    mockIsMobile.mockReturnValue(false);
  });

  describe("Desktop Rendering", () => {
    it("should render sharing tips tooltip", () => {
      const { container } = render(<SharingTipsTooltip />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render tooltip provider", () => {
      render(<SharingTipsTooltip />);

      expect(screen.getByTestId("tooltip-provider")).toBeTruthy();
    });

    it("should render tooltip", () => {
      render(<SharingTipsTooltip />);

      expect(screen.getByTestId("tooltip")).toBeTruthy();
    });

    it("should render lightbulb icon", () => {
      render(<SharingTipsTooltip />);

      expect(screen.getByTestId("lightbulb-icon")).toBeTruthy();
    });

    it("should render tooltip trigger button", () => {
      render(<SharingTipsTooltip />);

      // TooltipTrigger with asChild renders the button directly
      const button = screen.getByTestId("lightbulb-icon").closest("button");
      expect(button).toBeTruthy();
    });

    it("should render tooltip content", () => {
      render(<SharingTipsTooltip />);

      expect(screen.getByTestId("tooltip-content")).toBeTruthy();
    });

    it("should call translation for sharing tips title", () => {
      render(<SharingTipsTooltip />);

      expect(mockT).toHaveBeenCalledWith("dashboard.sharingTips");
    });

    it("should call translation for tips", () => {
      render(<SharingTipsTooltip />);

      expect(mockT).toHaveBeenCalledWith("dashboard.shareTip1");
      expect(mockT).toHaveBeenCalledWith("dashboard.shareTip2");
      expect(mockT).toHaveBeenCalledWith("dashboard.shareTip3");
    });

    it("should render tips list", () => {
      render(<SharingTipsTooltip />);

      const tooltipContent = screen.getByTestId("tooltip-content");
      const lists = tooltipContent.querySelectorAll("ul");
      expect(lists.length).toBeGreaterThan(0);
    });

    it("should render tip items", () => {
      render(<SharingTipsTooltip />);

      const tooltipContent = screen.getByTestId("tooltip-content");
      const listItems = tooltipContent.querySelectorAll("li");
      expect(listItems.length).toBe(3);
    });
  });

  describe("Mobile Rendering", () => {
    beforeEach(() => {
      mockIsMobile.mockReturnValue(true);
    });

    it("should render mobile version when isMobile is true", () => {
      render(<SharingTipsTooltip />);

      // Should not render tooltip provider on mobile
      expect(screen.queryByTestId("tooltip-provider")).toBeNull();
    });

    it("should render lightbulb button on mobile", () => {
      render(<SharingTipsTooltip />);

      const buttons = screen.getAllByTestId("lightbulb-icon");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should toggle modal when button is clicked", () => {
      render(<SharingTipsTooltip />);

      const button = screen
        .getAllByTestId("lightbulb-icon")
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      if (button) {
        fireEvent.click(button);
      }

      // Modal should be open
      expect(screen.getByText("dashboard.sharingTips")).toBeTruthy();
    });

    it("should close modal when close button is clicked", () => {
      render(<SharingTipsTooltip />);

      // Open modal
      const openButton = screen
        .getAllByTestId("lightbulb-icon")
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      if (openButton) {
        fireEvent.click(openButton);
      }

      // Close modal
      const closeButton = screen.getByText("×");
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      // Modal should be closed
      expect(screen.queryByText("dashboard.sharingTips")).toBeNull();
    });

    it("should render tips in mobile modal", () => {
      const { container } = render(<SharingTipsTooltip />);

      // Open modal
      const openButton = container.querySelector("button");
      if (openButton) {
        fireEvent.click(openButton);
      }

      // Tips should be rendered - check for ul elements
      const lists = container.querySelectorAll("ul");
      expect(lists.length).toBeGreaterThan(0);
    });

    it("should render modal overlay", () => {
      const { container } = render(<SharingTipsTooltip />);

      // Open modal
      const openButton = container.querySelector("button");
      if (openButton) {
        fireEvent.click(openButton);
      }

      // Modal overlay should be present - check for fixed and inset-0 classes
      const modal = container.querySelector(".fixed.inset-0");
      expect(modal).toBeTruthy();
    });
  });

  describe("Tooltip Props", () => {
    it("should have delayDuration of 0", () => {
      render(<SharingTipsTooltip />);

      const tooltipProvider = screen.getByTestId("tooltip-provider");
      expect(tooltipProvider.getAttribute("data-delay-duration")).toBe("0");
    });

    it("should have correct tooltip content props", () => {
      render(<SharingTipsTooltip />);

      const tooltipContent = screen.getByTestId("tooltip-content");
      expect(tooltipContent.getAttribute("data-side")).toBe("bottom");
      expect(tooltipContent.getAttribute("data-align")).toBe("start");
    });

    it("should have correct tooltip content classes", () => {
      render(<SharingTipsTooltip />);

      const tooltipContent = screen.getByTestId("tooltip-content");
      expect(tooltipContent.className).toContain("w-[500px]");
      expect(tooltipContent.className).toContain("max-w-[90vw]");
    });
  });

  describe("Button Styling", () => {
    it("should have correct button classes on desktop", () => {
      render(<SharingTipsTooltip />);

      // TooltipTrigger with asChild renders the button directly
      const button = screen.getByTestId("lightbulb-icon").closest("button");
      expect(button?.className).toContain("inline-flex");
      expect(button?.className).toContain("rounded-full");
    });

    it("should have correct button classes on mobile", () => {
      mockIsMobile.mockReturnValue(true);

      render(<SharingTipsTooltip />);

      const button = screen
        .getAllByTestId("lightbulb-icon")
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      expect(button?.className).toContain("inline-flex");
      expect(button?.className).toContain("rounded-full");
    });
  });
});
