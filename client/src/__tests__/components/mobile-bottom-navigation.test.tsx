import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MobileBottomNavigation } from "../../components/mobile-bottom-navigation";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValue?: string) => defaultValue || key
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Lightbulb: jest.fn(({ className }) => (
    <div data-testid="lightbulb-icon" className={className} />
  )),
  ListFilter: jest.fn(({ className }) => (
    <div data-testid="list-filter-icon" className={className} />
  )),
  Gift: jest.fn(({ className }) => (
    <div data-testid="gift-icon" className={className} />
  )),
  Package: jest.fn(({ className }) => (
    <div data-testid="package-icon" className={className} />
  )),
  Badge: jest.fn(({ className }) => (
    <div data-testid="badge-icon" className={className} />
  )),
  BarChart3: jest.fn(({ className }) => (
    <div data-testid="bar-chart3-icon" className={className} />
  )),
}));

// Mock de cn utility
jest.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
}));

// Mock de Badge component
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <div data-testid="badge" data-variant={variant} className={className}>
      {children}
    </div>
  ),
}));

// Mock de framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      initial,
      animate,
      transition,
      className,
      layoutId,
      ...props
    }: any) => (
      <div
        data-testid="motion-div"
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        data-layout-id={layoutId}
        className={className}
        {...props}
      >
        {children}
      </div>
    ),
  },
}));

describe("MobileBottomNavigation", () => {
  const mockOnTabChange = jest.fn();
  const mockOnStatsClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
  });

  describe("Basic Rendering", () => {
    it("should render mobile bottom navigation", () => {
      const { container } = render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
        />
      );

      expect(container.firstChild).toBeTruthy();
    });

    it("should render all five tabs", () => {
      render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
        />
      );

      expect(mockT).toHaveBeenCalledWith("dashboard.published");
      expect(mockT).toHaveBeenCalledWith("dashboard.suggested");
      expect(mockT).toHaveBeenCalledWith("dashboard.stats", "Stats");
      expect(mockT).toHaveBeenCalledWith("dashboard.store");
      expect(mockT).toHaveBeenCalledWith("redemptions.short");
    });

    it("should render icons for all tabs", () => {
      render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
        />
      );

      expect(screen.getByTestId("lightbulb-icon")).toBeTruthy();
      expect(screen.getByTestId("list-filter-icon")).toBeTruthy();
      expect(screen.getByTestId("bar-chart3-icon")).toBeTruthy();
      expect(screen.getByTestId("gift-icon")).toBeTruthy();
      expect(screen.getByTestId("package-icon")).toBeTruthy();
    });
  });

  describe("Active Tab", () => {
    it("should highlight published tab when active", () => {
      const { container } = render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
        />
      );

      const buttons = container.querySelectorAll("button");
      const publishedButton = Array.from(buttons).find((btn) =>
        btn.textContent?.includes("dashboard.published")
      );
      expect(publishedButton?.className).toContain("bg-accent");
    });

    it("should highlight suggested tab when active", () => {
      const { container } = render(
        <MobileBottomNavigation
          activeTab="suggested"
          onTabChange={mockOnTabChange}
        />
      );

      const buttons = container.querySelectorAll("button");
      const suggestedButton = Array.from(buttons).find((btn) =>
        btn.textContent?.includes("dashboard.suggested")
      );
      expect(suggestedButton?.className).toContain("bg-accent");
    });

    it("should not highlight inactive tabs", () => {
      const { container } = render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
        />
      );

      const buttons = container.querySelectorAll("button");
      const storeButton = Array.from(buttons).find((btn) =>
        btn.textContent?.includes("dashboard.store")
      );
      // Check that it doesn't have bg-accent as a standalone class (not hover:bg-accent/50)
      const classList = storeButton?.className.split(" ") || [];
      expect(classList).not.toContain("bg-accent");
    });
  });

  describe("Click Handlers", () => {
    it("should call onTabChange with 'published' when published tab is clicked", () => {
      const { container } = render(
        <MobileBottomNavigation
          activeTab="store"
          onTabChange={mockOnTabChange}
        />
      );

      const buttons = container.querySelectorAll("button");
      const publishedButton = Array.from(buttons).find((btn) =>
        btn.textContent?.includes("dashboard.published")
      );
      if (publishedButton) {
        fireEvent.click(publishedButton);
      }

      expect(mockOnTabChange).toHaveBeenCalledWith("published");
    });

    it("should call onTabChange with 'suggested' when suggested tab is clicked", () => {
      const { container } = render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
        />
      );

      const buttons = container.querySelectorAll("button");
      const suggestedButton = Array.from(buttons).find((btn) =>
        btn.textContent?.includes("dashboard.suggested")
      );
      if (suggestedButton) {
        fireEvent.click(suggestedButton);
      }

      expect(mockOnTabChange).toHaveBeenCalledWith("suggested");
    });

    it("should call onStatsClick when stats tab is clicked and onStatsClick is provided", () => {
      const { container } = render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
          onStatsClick={mockOnStatsClick}
        />
      );

      const buttons = container.querySelectorAll("button");
      const statsButton = Array.from(buttons).find((btn) =>
        btn.textContent?.includes("Stats")
      );
      if (statsButton) {
        fireEvent.click(statsButton);
      }

      expect(mockOnStatsClick).toHaveBeenCalled();
      expect(mockOnTabChange).not.toHaveBeenCalled();
    });

    it("should call onTabChange with 'stats' when stats tab is clicked and onStatsClick is not provided", () => {
      const { container } = render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
        />
      );

      const buttons = container.querySelectorAll("button");
      const statsButton = Array.from(buttons).find((btn) =>
        btn.textContent?.includes("Stats")
      );
      if (statsButton) {
        fireEvent.click(statsButton);
      }

      expect(mockOnTabChange).toHaveBeenCalledWith("stats");
    });
  });

  describe("Badge", () => {
    it("should render badge when pendingCount is greater than 0", () => {
      render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
          pendingCount={5}
        />
      );

      expect(screen.getByTestId("badge")).toBeTruthy();
      expect(screen.getByText("5")).toBeTruthy();
    });

    it("should not render badge when pendingCount is 0", () => {
      render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
          pendingCount={0}
        />
      );

      expect(screen.queryByTestId("badge")).toBeNull();
    });

    it("should display 99+ when pendingCount is greater than 99", () => {
      render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
          pendingCount={150}
        />
      );

      expect(screen.getByText("99+")).toBeTruthy();
    });

    it("should have correct badge variant", () => {
      render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
          pendingCount={3}
        />
      );

      const badge = screen.getByTestId("badge");
      expect(badge.getAttribute("data-variant")).toBe("destructive");
    });
  });

  describe("Custom ClassName", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
          className="custom-class"
        />
      );

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv?.className).toContain("custom-class");
    });
  });

  describe("Animation Props", () => {
    it("should have motion.div with animation for active tab", () => {
      render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
        />
      );

      const motionDivs = screen.getAllByTestId("motion-div");
      const iconDiv = motionDivs.find((div) =>
        div.className.includes("flex flex-col items-center gap-1")
      );
      if (iconDiv) {
        const animate = JSON.parse(
          iconDiv.getAttribute("data-animate") || "{}"
        );
        expect(animate.scale).toBe(1.1);
        expect(animate.y).toBe(-2);
      }
    });

    it("should have active indicator with layoutId", () => {
      render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
        />
      );

      const motionDivs = screen.getAllByTestId("motion-div");
      const indicator = motionDivs.find(
        (div) => div.getAttribute("data-layout-id") === "activeTab"
      );
      expect(indicator).toBeTruthy();
    });
  });

  describe("Default Props", () => {
    it("should default pendingCount to 0", () => {
      render(
        <MobileBottomNavigation
          activeTab="published"
          onTabChange={mockOnTabChange}
        />
      );

      expect(screen.queryByTestId("badge")).toBeNull();
    });
  });
});
