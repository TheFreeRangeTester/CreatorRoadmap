import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MobileBottomNav } from "../../components/mobile-bottom-nav";

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
  User: jest.fn(({ className }) => (
    <div data-testid="user-icon" className={className} />
  )),
  Store: jest.fn(({ className }) => (
    <div data-testid="store-icon" className={className} />
  )),
  Activity: jest.fn(({ className }) => (
    <div data-testid="activity-icon" className={className} />
  )),
  Grid3x3: jest.fn(({ className }) => (
    <div data-testid="grid3x3-icon" className={className} />
  )),
}));

// Mock de cn utility
jest.mock("@/lib/utils", () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(" "),
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
    button: ({ children, onClick, className, whileTap, ...props }: any) => (
      <button
        data-testid="motion-button"
        onClick={onClick}
        data-while-tap={JSON.stringify(whileTap)}
        className={className}
        {...props}
      >
        {children}
      </button>
    ),
    span: ({ children, className, animate, ...props }: any) => (
      <span
        data-testid="motion-span"
        data-animate={JSON.stringify(animate)}
        className={className}
        {...props}
      >
        {children}
      </span>
    ),
  },
}));

describe("MobileBottomNav", () => {
  const mockOnSectionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
  });

  describe("Basic Rendering", () => {
    it("should render mobile bottom nav", () => {
      const { container } = render(
        <MobileBottomNav
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      expect(container.firstChild).toBeTruthy();
    });

    it("should render all three navigation items", () => {
      render(
        <MobileBottomNav
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      expect(screen.getByText("Ideas")).toBeTruthy();
      expect(screen.getByText("Tienda")).toBeTruthy();
      expect(screen.getByText("Actividad")).toBeTruthy();
    });

    it("should render icons for all items", () => {
      render(
        <MobileBottomNav
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      expect(screen.getByTestId("grid3x3-icon")).toBeTruthy();
      expect(screen.getByTestId("store-icon")).toBeTruthy();
      expect(screen.getByTestId("activity-icon")).toBeTruthy();
    });
  });

  describe("Active Section", () => {
    it("should highlight ideas section when active", () => {
      render(
        <MobileBottomNav
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const ideasButton = screen.getByText("Ideas").closest("button");
      expect(ideasButton?.className).toContain("text-primary");
    });

    it("should highlight store section when active", () => {
      render(
        <MobileBottomNav
          activeSection="store"
          onSectionChange={mockOnSectionChange}
        />
      );

      const storeButton = screen.getByText("Tienda").closest("button");
      expect(storeButton?.className).toContain("text-primary");
    });

    it("should highlight activity section when active", () => {
      render(
        <MobileBottomNav
          activeSection="activity"
          onSectionChange={mockOnSectionChange}
        />
      );

      const activityButton = screen.getByText("Actividad").closest("button");
      expect(activityButton?.className).toContain("text-primary");
    });

    it("should not highlight inactive sections", () => {
      render(
        <MobileBottomNav
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const storeButton = screen.getByText("Tienda").closest("button");
      expect(storeButton?.className).not.toContain("text-primary");
      expect(storeButton?.className).toContain("text-gray-500");
    });
  });

  describe("Click Handlers", () => {
    it("should call onSectionChange with 'ideas' when ideas button is clicked", () => {
      render(
        <MobileBottomNav
          activeSection="store"
          onSectionChange={mockOnSectionChange}
        />
      );

      const ideasButton = screen.getByText("Ideas").closest("button");
      if (ideasButton) {
        fireEvent.click(ideasButton);
      }

      expect(mockOnSectionChange).toHaveBeenCalledWith("ideas");
    });

    it("should call onSectionChange with 'store' when store button is clicked", () => {
      render(
        <MobileBottomNav
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const storeButton = screen.getByText("Tienda").closest("button");
      if (storeButton) {
        fireEvent.click(storeButton);
      }

      expect(mockOnSectionChange).toHaveBeenCalledWith("store");
    });

    it("should call onSectionChange with 'activity' when activity button is clicked", () => {
      render(
        <MobileBottomNav
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const activityButton = screen.getByText("Actividad").closest("button");
      if (activityButton) {
        fireEvent.click(activityButton);
      }

      expect(mockOnSectionChange).toHaveBeenCalledWith("activity");
    });
  });

  describe("Custom ClassName", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <MobileBottomNav
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
          className="custom-class"
        />
      );

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv?.className).toContain("custom-class");
    });
  });

  describe("Translation Calls", () => {
    it("should call translation for ideas label", () => {
      render(
        <MobileBottomNav
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      expect(mockT).toHaveBeenCalledWith("ideas.short", "Ideas");
    });

    it("should call translation for store label", () => {
      render(
        <MobileBottomNav
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      expect(mockT).toHaveBeenCalledWith("store.short", "Tienda");
    });

    it("should call translation for activity label", () => {
      render(
        <MobileBottomNav
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      expect(mockT).toHaveBeenCalledWith("activity.short", "Actividad");
    });
  });

  describe("Active Indicator", () => {
    it("should show active background when section is active", () => {
      const { container } = render(
        <MobileBottomNav
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const activeBackgrounds = container.querySelectorAll(".bg-primary\\/10");
      expect(activeBackgrounds.length).toBeGreaterThan(0);
    });

    it("should show active indicator dot when section is active", () => {
      const { container } = render(
        <MobileBottomNav
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const indicatorDots = container.querySelectorAll(
        ".bg-primary.rounded-full"
      );
      expect(indicatorDots.length).toBeGreaterThan(0);
    });
  });

  describe("Animation Props", () => {
    it("should have motion.div with initial animation", () => {
      render(
        <MobileBottomNav
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const motionDivs = screen.getAllByTestId("motion-div");
      const mainDiv = motionDivs[0];
      const initial = JSON.parse(mainDiv.getAttribute("data-initial") || "{}");
      expect(initial.y).toBe(100);
      expect(initial.opacity).toBe(0);
    });

    it("should have motion.button with whileTap animation", () => {
      render(
        <MobileBottomNav
          activeSection="ideas"
          onSectionChange={mockOnSectionChange}
        />
      );

      const motionButtons = screen.getAllByTestId("motion-button");
      const button = motionButtons[0];
      const whileTap = JSON.parse(
        button.getAttribute("data-while-tap") || "{}"
      );
      expect(whileTap.scale).toBe(0.95);
    });
  });
});
