import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import CreatorControls from "../../components/creator-controls";

// Mock de useTranslation
const mockT = jest.fn((key: string, defaultValue?: string, options?: any) => {
  if (options && options.count !== undefined) {
    return defaultValue?.replace("{{count}}", options.count.toString()) || key;
  }
  return defaultValue || key;
});

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de useToast
const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock de react-query
const mockUseQueryFn = jest.fn(() => ({
  data: null as any,
  isLoading: false,
}));

const mockUseQueryClientFn = jest.fn(() => ({
  invalidateQueries: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: () => mockUseQueryFn(),
  useQueryClient: () => mockUseQueryClientFn(),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  PlusCircle: jest.fn(({ className }) => (
    <div data-testid="plus-circle-icon" className={className} />
  )),
  Upload: jest.fn(({ className }) => (
    <div data-testid="upload-icon" className={className} />
  )),
  Lock: jest.fn(({ className }) => (
    <div data-testid="lock-icon" className={className} />
  )),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className, size, variant }: any) => {
    const childrenStr =
      typeof children === "string" ? children : children?.props?.children || "";
    const testId =
      childrenStr.includes("Agregar") ||
      childrenStr.includes("Add") ||
      childrenStr.includes("Nueva")
        ? "add-idea-button"
        : "csv-import-button";
    return (
      <button
        onClick={onClick}
        data-variant={variant}
        data-size={size}
        className={className}
        data-testid={testId}
      >
        {children}
      </button>
    );
  },
}));

// Mock de Tooltip components
jest.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
}));

// Mock de SubscriptionStatusIcon
jest.mock("../../components/subscription-status-icon", () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="subscription-status-icon" />),
}));

// Mock de CSVImportModal
const mockSetCsvImportOpen = jest.fn();
jest.mock("../../components/csv-import-modal", () => ({
  __esModule: true,
  default: jest.fn(({ open, onOpenChange, onImportSuccess }: any) => (
    <div data-testid="csv-import-modal">
      {open && <div data-testid="modal-open">Modal Open</div>}
      <button onClick={() => onOpenChange(true)}>Open Modal</button>
      <button onClick={() => onImportSuccess(5)}>Simulate Success</button>
    </div>
  )),
}));

// Mock de SharingTipsTooltip
jest.mock("../../components/sharing-tips-tooltip", () => ({
  SharingTipsTooltip: jest.fn(() => null),
}));

// Mock de premium-utils
const mockHasActivePremiumAccess = jest.fn();
const mockGetPremiumAccessStatus = jest.fn();

jest.mock("@shared/premium-utils", () => ({
  hasActivePremiumAccess: (user: any) => mockHasActivePremiumAccess(user),
  getPremiumAccessStatus: (user: any) => mockGetPremiumAccessStatus(user),
}));

describe("CreatorControls", () => {
  const mockOnAddIdea = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string, options?: any) => {
        if (options && options.count !== undefined) {
          return (
            defaultValue?.replace("{{count}}", options.count.toString()) || key
          );
        }
        return defaultValue || key;
      }
    );
    mockUseQueryFn.mockImplementation(() => ({
      data: null,
      isLoading: false,
    }));
    mockUseQueryClientFn.mockImplementation(() => ({
      invalidateQueries: jest.fn(),
    }));
    mockHasActivePremiumAccess.mockReturnValue(false);
    mockGetPremiumAccessStatus.mockReturnValue({
      hasAccess: false,
      reason: "no_subscription",
    });
  });

  describe("Basic Rendering", () => {
    it("should render title", () => {
      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      expect(screen.getByText("Panel de Creador")).toBeTruthy();
    });

    it("should render subscription status icon", () => {
      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      expect(screen.getByTestId("subscription-status-icon")).toBeTruthy();
    });

    it("should render add idea button", () => {
      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      expect(screen.getByText("Agregar Nueva Idea")).toBeTruthy();
    });

    it("should render CSV import button", () => {
      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      expect(screen.getByText("Importar CSV")).toBeTruthy();
    });

    it("should render CSV import modal", () => {
      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      expect(screen.getByTestId("csv-import-modal")).toBeTruthy();
    });
  });

  describe("Add Idea Button", () => {
    it("should call onAddIdea when add idea button is clicked", () => {
      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      const addButton = screen
        .getByText("Agregar Nueva Idea")
        .closest("button");
      if (addButton) {
        fireEvent.click(addButton);
      }

      expect(mockOnAddIdea).toHaveBeenCalledTimes(1);
    });

    it("should render PlusCircle icon in add idea button", () => {
      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      expect(screen.getByTestId("plus-circle-icon")).toBeTruthy();
    });
  });

  describe("CSV Import - Non-Pro User", () => {
    it("should show lock icon for non-pro users", () => {
      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      expect(screen.getByTestId("lock-icon")).toBeTruthy();
    });

    it("should show tooltip for non-pro users", () => {
      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      expect(screen.getByTestId("tooltip-content")).toBeTruthy();
      expect(screen.getByText("Función exclusiva Pro")).toBeTruthy();
    });

    it("should show premium star icon for non-pro users", () => {
      const { container } = render(
        <CreatorControls onAddIdea={mockOnAddIdea} />
      );

      const starIcon = container.querySelector("svg");
      expect(starIcon).toBeTruthy();
    });

    it("should show toast when CSV import is clicked without premium access", () => {
      mockUseQueryFn.mockReturnValue({
        data: { id: 1, username: "test", userRole: "creator" },
        isLoading: false,
      });

      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      const csvButton = screen.getByText("Importar CSV").closest("button");
      if (csvButton) {
        fireEvent.click(csvButton);
      }

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Pro Feature",
          description: expect.stringContaining("Pro users only"),
          variant: "destructive",
        })
      );
    });

    it("should not open modal when CSV import is clicked without premium access", () => {
      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      const csvButton = screen.getByText("Importar CSV").closest("button");
      if (csvButton) {
        fireEvent.click(csvButton);
      }

      expect(screen.queryByTestId("modal-open")).toBeNull();
    });
  });

  describe("CSV Import - Pro User", () => {
    beforeEach(() => {
      mockHasActivePremiumAccess.mockReturnValue(true);
      mockGetPremiumAccessStatus.mockReturnValue({
        hasAccess: true,
      });
      mockUseQueryFn.mockReturnValue({
        data: { id: 1, username: "test", userRole: "creator" },
        isLoading: false,
      });
    });

    it("should not show lock icon for pro users", () => {
      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      // Lock icon should not be rendered for pro users
      expect(screen.queryByTestId("lock-icon")).toBeNull();
    });

    it("should not show tooltip for pro users", () => {
      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      // Tooltip content should not contain the pro message for pro users
      const tooltips = screen.queryAllByTestId("tooltip-content");
      const hasProMessage = tooltips.some(
        (tooltip) =>
          tooltip.textContent?.includes("Función exclusiva Pro") ||
          tooltip.textContent?.includes("Función exclusiva")
      );
      expect(hasProMessage).toBe(false);
    });

    it("should open modal when CSV import is clicked for pro users", () => {
      mockUseQueryFn.mockReturnValue({
        data: { id: 1, username: "test", userRole: "creator" },
        isLoading: false,
      });

      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      const csvButton = screen.getByText("Importar CSV").closest("button");
      if (csvButton) {
        fireEvent.click(csvButton);
      }

      // Modal should be open
      expect(screen.getByTestId("modal-open")).toBeTruthy();
    });
  });

  describe("CSV Import - Premium Status Reasons", () => {
    beforeEach(() => {
      mockUseQueryFn.mockReturnValue({
        data: { id: 1, username: "test", userRole: "creator" },
        isLoading: false,
      });
    });

    it("should show trial expired message", () => {
      mockGetPremiumAccessStatus.mockReturnValue({
        hasAccess: false,
        reason: "trial_expired",
      });

      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      const csvButton = screen.getByText("Importar CSV").closest("button");
      if (csvButton) {
        fireEvent.click(csvButton);
      }

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining("trial has expired"),
        })
      );
    });

    it("should show premium expired message", () => {
      mockGetPremiumAccessStatus.mockReturnValue({
        hasAccess: false,
        reason: "premium_expired",
      });

      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      const csvButton = screen.getByText("Importar CSV").closest("button");
      if (csvButton) {
        fireEvent.click(csvButton);
      }

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining(
            "premium subscription has expired"
          ),
        })
      );
    });

    it("should show default pro required message", () => {
      mockGetPremiumAccessStatus.mockReturnValue({
        hasAccess: false,
        reason: "no_subscription",
      });

      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      const csvButton = screen.getByText("Importar CSV").closest("button");
      if (csvButton) {
        fireEvent.click(csvButton);
      }

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining("Pro users only"),
        })
      );
    });
  });

  describe("CSV Import Success", () => {
    it("should invalidate queries and show toast on import success", () => {
      const mockInvalidateQueries = jest.fn();
      mockUseQueryClientFn.mockReturnValue({
        invalidateQueries: mockInvalidateQueries,
      });

      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      // Simulate import success
      const successButton = screen.getByText("Simulate Success");
      fireEvent.click(successButton);

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["/api/ideas"],
      });
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Ideas imported successfully",
          description: "5 ideas have been imported to your dashboard",
        })
      );
    });
  });

  describe("User Data", () => {
    it("should not open CSV modal when user is not available", () => {
      mockUseQueryFn.mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      const csvButton = screen.getByText("Importar CSV").closest("button");
      if (csvButton) {
        fireEvent.click(csvButton);
      }

      // When user is null, handleCSVImportClick returns early without showing toast
      // So we just verify modal is not open
      expect(screen.queryByTestId("modal-open")).toBeNull();
    });

    it("should use user data for premium check", () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        userRole: "creator" as const,
      };

      mockUseQueryFn.mockReturnValue({
        data: mockUser,
        isLoading: false,
      });

      render(<CreatorControls onAddIdea={mockOnAddIdea} />);

      // Verify that hasActivePremiumAccess was called with user data
      expect(mockHasActivePremiumAccess).toHaveBeenCalled();
      const calls = (mockHasActivePremiumAccess as jest.MockedFunction<any>)
        .mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(calls[0][0]).toEqual(mockUser);
    });
  });
});
