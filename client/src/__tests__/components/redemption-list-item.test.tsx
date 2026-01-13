import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import RedemptionListItem from "../../components/redemption-list-item";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValue?: string) => defaultValue || key
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de date-fns
jest.mock("date-fns", () => ({
  format: jest.fn((date: Date, formatStr: string) => {
    return date.toLocaleDateString();
  }),
}));

// Mock de framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, initial, animate, transition, className }: any) => (
      <div
        data-testid="motion-div"
        data-initial={JSON.stringify(initial)}
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        className={className}
      >
        {children}
      </div>
    ),
  },
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  User: jest.fn(({ className }) => (
    <div data-testid="user-icon" className={className} />
  )),
  Calendar: jest.fn(({ className }) => (
    <div data-testid="calendar-icon" className={className} />
  )),
  Package: jest.fn(({ className }) => (
    <div data-testid="package-icon" className={className} />
  )),
  Mail: jest.fn(({ className }) => (
    <div data-testid="mail-icon" className={className} />
  )),
}));

// Mock de Badge component
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <div data-testid="badge" data-variant={variant} className={className}>
      {children}
    </div>
  ),
}));

// Mock de Select components
let selectOnValueChange: ((value: string) => void) | null = null;

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange, disabled }: any) => {
    selectOnValueChange = onValueChange;
    return (
      <div data-testid="select" data-value={value} data-disabled={disabled}>
        {children}
      </div>
    );
  },
  SelectTrigger: ({ children, className }: any) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  ),
  SelectValue: () => <div data-testid="select-value">Select Value</div>,
  SelectContent: ({ children }: any) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value, className }: any) => (
    <div
      data-testid={`select-item-${value}`}
      className={className}
      onClick={() => selectOnValueChange && selectOnValueChange(value)}
    >
      {children}
    </div>
  ),
}));

describe("RedemptionListItem", () => {
  const mockRedemption: any = {
    id: 1,
    userUsername: "testuser",
    userEmail: "test@example.com",
    storeItemTitle: "Test Item",
    storeItemDescription: "Test Description",
    pointsSpent: 100,
    status: "pending" as const,
    createdAt: "2024-01-01T00:00:00Z",
  };

  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
    selectOnValueChange = null;
  });

  describe("Basic Rendering", () => {
    it("should render redemption list item", () => {
      const { container } = render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      expect(container.firstChild).toBeTruthy();
    });

    it("should render position number", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={5}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      expect(screen.getByText("#5")).toBeTruthy();
    });
  });

  describe("User Information", () => {
    it("should render username", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      expect(screen.getByText("testuser")).toBeTruthy();
    });

    it("should render user email", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      expect(screen.getByText("test@example.com")).toBeTruthy();
    });

    it("should render user icon", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      expect(screen.getByTestId("user-icon")).toBeTruthy();
    });

    it("should render mail icon", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      expect(screen.getByTestId("mail-icon")).toBeTruthy();
    });
  });

  describe("Item Information", () => {
    it("should render item title", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      expect(screen.getByText("Test Item")).toBeTruthy();
    });

    it("should render item description", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      expect(screen.getByText("Test Description")).toBeTruthy();
    });

    it("should render package icon", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      expect(screen.getByTestId("package-icon")).toBeTruthy();
    });
  });

  describe("Date and Points", () => {
    it("should render points spent", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      expect(screen.getByText("100 pts")).toBeTruthy();
    });

    it("should render calendar icon", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      expect(screen.getByTestId("calendar-icon")).toBeTruthy();
    });
  });

  describe("Status Badge", () => {
    it("should render pending badge when status is pending", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      expect(mockT).toHaveBeenCalledWith("redemptions.pending");
    });

    it("should render completed badge when status is completed", () => {
      const completedRedemption = {
        ...mockRedemption,
        status: "completed" as const,
      };

      render(
        <RedemptionListItem
          redemption={completedRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      expect(mockT).toHaveBeenCalledWith("redemptions.completed");
    });

    it("should apply correct variant for pending status", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      const badges = screen.getAllByTestId("badge");
      const statusBadge = badges.find(
        (badge) => badge.getAttribute("data-variant") === "secondary"
      );
      expect(statusBadge).toBeTruthy();
    });

    it("should apply correct variant for completed status", () => {
      const completedRedemption = {
        ...mockRedemption,
        status: "completed" as const,
      };

      render(
        <RedemptionListItem
          redemption={completedRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      const badges = screen.getAllByTestId("badge");
      const statusBadge = badges.find(
        (badge) => badge.getAttribute("data-variant") === "default"
      );
      expect(statusBadge).toBeTruthy();
    });
  });

  describe("Status Select", () => {
    it("should render select component", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      expect(screen.getByTestId("select")).toBeTruthy();
    });

    it("should have correct value for pending status", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      const select = screen.getByTestId("select");
      expect(select.getAttribute("data-value")).toBe("pending");
    });

    it("should have correct value for completed status", () => {
      const completedRedemption = {
        ...mockRedemption,
        status: "completed" as const,
      };

      render(
        <RedemptionListItem
          redemption={completedRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      const select = screen.getByTestId("select");
      expect(select.getAttribute("data-value")).toBe("completed");
    });

    it("should render select items", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      expect(screen.getByTestId("select-item-pending")).toBeTruthy();
      expect(screen.getByTestId("select-item-completed")).toBeTruthy();
    });

    it("should call onStatusChange when select item is clicked", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      const completedItem = screen.getByTestId("select-item-completed");
      fireEvent.click(completedItem);

      expect(mockOnStatusChange).toHaveBeenCalledWith(1, "completed");
    });

    it("should disable select when isUpdating is true", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={true}
        />
      );

      const select = screen.getByTestId("select");
      expect(select.getAttribute("data-disabled")).toBe("true");
    });
  });

  describe("Animation", () => {
    it("should render motion.div with animation props", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={1}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      const motionDiv = screen.getByTestId("motion-div");
      expect(motionDiv).toBeTruthy();
      expect(motionDiv.getAttribute("data-initial")).toBeTruthy();
    });

    it("should have delay based on position", () => {
      render(
        <RedemptionListItem
          redemption={mockRedemption}
          position={3}
          onStatusChange={mockOnStatusChange}
          isUpdating={false}
        />
      );

      const motionDiv = screen.getByTestId("motion-div");
      const transition = JSON.parse(
        motionDiv.getAttribute("data-transition") || "{}"
      );
      expect(transition.delay).toBe(3 * 0.05);
    });
  });
});
