import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

// Mock de useToast
const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock de useQuery
const mockStoreItems: any[] = [];
let mockIsLoading = false;

const mockUseQuery = jest.fn((config?: any) => ({
  data: mockStoreItems,
  isLoading: mockIsLoading,
}));

// Mock de useMutation
const mockDeleteMutate = jest.fn();
const mockDeleteMutation = {
  mutate: mockDeleteMutate,
  isPending: false,
};

const mockUseMutation = jest.fn((config?: any) => mockDeleteMutation);

// Mock de useQueryClient
const mockInvalidateQueries = jest.fn();
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
};

const mockUseQueryClient = jest.fn(() => mockQueryClient);

jest.mock("@tanstack/react-query", () => ({
  useQuery: (config?: any) => mockUseQuery(config),
  useMutation: (config?: any) => mockUseMutation(config),
  useQueryClient: () => mockUseQueryClient(),
}));

// Mock de apiRequest
jest.mock("@/lib/queryClient", () => ({
  apiRequest: jest.fn(() =>
    Promise.resolve({
      json: async () => ({ success: true }),
    } as any)
  ),
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  Store: jest.fn(({ className }) => (
    <div data-testid="store-icon" className={className} />
  )),
  PlusCircle: jest.fn(({ className }) => (
    <div data-testid="plus-circle-icon" className={className} />
  )),
  Edit: jest.fn(({ className }) => (
    <div data-testid="edit-icon" className={className} />
  )),
  Trash2: jest.fn(({ className }) => (
    <div data-testid="trash-icon" className={className} />
  )),
  Users: jest.fn(({ className }) => (
    <div data-testid="users-icon" className={className} />
  )),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
}));

// Mock de Card components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <div data-testid="card-title" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

// Mock de Badge component
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <div data-testid="badge" data-variant={variant} className={className}>
      {children}
    </div>
  ),
}));

// Mock de AlertDialog components
let alertDialogOpen = false;
let alertDialogOnOpenChange: ((open: boolean) => void) | null = null;

jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children, open, onOpenChange }: any) => {
    alertDialogOpen = open !== undefined ? open : true;
    if (onOpenChange) {
      alertDialogOnOpenChange = onOpenChange;
    }
    return <div data-testid="alert-dialog">{children}</div>;
  },
  AlertDialogTrigger: ({ children, asChild }: any) => {
    if (asChild && children) {
      return children;
    }
    return <div data-testid="alert-dialog-trigger">{children}</div>;
  },
  AlertDialogContent: ({ children, className }: any) => (
    <div data-testid="alert-dialog-content" className={className}>
      {children}
    </div>
  ),
  AlertDialogHeader: ({ children, className }: any) => (
    <div data-testid="alert-dialog-header" className={className}>
      {children}
    </div>
  ),
  AlertDialogTitle: ({ children, className }: any) => (
    <div data-testid="alert-dialog-title" className={className}>
      {children}
    </div>
  ),
  AlertDialogDescription: ({ children, className }: any) => (
    <div data-testid="alert-dialog-description" className={className}>
      {children}
    </div>
  ),
  AlertDialogFooter: ({ children, className }: any) => (
    <div data-testid="alert-dialog-footer" className={className}>
      {children}
    </div>
  ),
  AlertDialogCancel: ({ children, onClick, className }: any) => (
    <button
      data-testid="alert-dialog-cancel"
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  ),
  AlertDialogAction: ({ children, onClick, className }: any) => (
    <button
      data-testid="alert-dialog-action"
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  ),
}));

// Mock de StoreItemForm
jest.mock("../../components/store-item-form", () => ({
  StoreItemForm: ({ isOpen, onClose, onSuccess, initialData }: any) => (
    <div data-testid="store-item-form" data-open={isOpen}>
      {isOpen && (
        <div>
          <button data-testid="form-close" onClick={onClose}>
            Close
          </button>
          <button
            data-testid="form-success"
            onClick={() => onSuccess && onSuccess()}
          >
            Success
          </button>
          {initialData && (
            <div data-testid="form-initial-data">{initialData.id}</div>
          )}
        </div>
      )}
    </div>
  ),
}));

import { StoreManagement } from "../../components/store-management";

describe("StoreManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
    mockStoreItems.length = 0;
    mockIsLoading = false;
    mockUseQuery.mockImplementation((config?: any) => ({
      data: mockStoreItems,
      isLoading: mockIsLoading,
    }));
    mockDeleteMutate.mockClear();
    mockInvalidateQueries.mockClear();
    alertDialogOpen = false;
    alertDialogOnOpenChange = null;
  });

  describe("Basic Rendering", () => {
    it("should render store management", () => {
      const { container } = render(<StoreManagement />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render title", () => {
      render(<StoreManagement />);

      const storeIcons = screen.getAllByTestId("store-icon");
      expect(storeIcons.length).toBeGreaterThan(0);
      expect(mockT).toHaveBeenCalledWith("store.title");
    });

    it("should render description", () => {
      render(<StoreManagement />);

      expect(mockT).toHaveBeenCalledWith("store.description");
    });

    it("should render create item button", () => {
      render(<StoreManagement />);

      const plusIcons = screen.getAllByTestId("plus-circle-icon");
      expect(plusIcons.length).toBeGreaterThan(0);
      expect(mockT).toHaveBeenCalledWith("store.createItem");
    });
  });

  describe("Loading State", () => {
    it("should render loading spinner when loading", () => {
      mockIsLoading = true;
      mockUseQuery.mockImplementation((config?: any) => ({
        data: [],
        isLoading: true,
      }));

      const { container } = render(<StoreManagement />);

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeTruthy();
    });

    it("should not render content when loading", () => {
      mockIsLoading = true;
      mockUseQuery.mockImplementation((config?: any) => ({
        data: [],
        isLoading: true,
      }));

      render(<StoreManagement />);

      expect(screen.queryByTestId("store-icon")).toBeNull();
    });
  });

  describe("Empty State", () => {
    it("should render empty state when no items", () => {
      mockStoreItems.length = 0;
      mockIsLoading = false;
      mockUseQuery.mockImplementation((config?: any) => ({
        data: [],
        isLoading: false,
      }));

      render(<StoreManagement />);

      expect(mockT).toHaveBeenCalledWith("store.noItems");
      expect(mockT).toHaveBeenCalledWith("store.createFirst");
    });

    it("should render create button in empty state", () => {
      mockStoreItems.length = 0;
      mockIsLoading = false;
      mockUseQuery.mockImplementation((config?: any) => ({
        data: [],
        isLoading: false,
      }));

      render(<StoreManagement />);

      const buttons = screen.getAllByTestId("plus-circle-icon");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should open create modal when empty state button is clicked", () => {
      mockStoreItems.length = 0;
      mockIsLoading = false;
      mockUseQuery.mockImplementation((config?: any) => ({
        data: [],
        isLoading: false,
      }));

      render(<StoreManagement />);

      const buttons = screen.getAllByTestId("plus-circle-icon");
      const emptyStateButton = buttons
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      if (emptyStateButton) {
        fireEvent.click(emptyStateButton);
      }

      expect(screen.getByTestId("store-item-form")).toBeTruthy();
      expect(
        screen.getByTestId("store-item-form").getAttribute("data-open")
      ).toBe("true");
    });
  });

  describe("Items List", () => {
    const mockItem1 = {
      id: 1,
      title: "Item 1",
      description: "Description 1",
      pointsCost: 100,
      currentQuantity: 5,
      maxQuantity: 10,
      isActive: true,
      isAvailable: true,
    };

    const mockItem2 = {
      id: 2,
      title: "Item 2",
      description: "Description 2",
      pointsCost: 200,
      currentQuantity: 0,
      maxQuantity: null,
      isActive: false,
      isAvailable: false,
    };

    beforeEach(() => {
      mockStoreItems.length = 0;
      mockStoreItems.push(mockItem1, mockItem2);
      mockIsLoading = false;
      mockUseQuery.mockImplementation((config?: any) => ({
        data: mockStoreItems,
        isLoading: false,
      }));
    });

    it("should render items list", () => {
      render(<StoreManagement />);

      const cards = screen.getAllByTestId("card");
      // Header card + 2 item cards
      expect(cards.length).toBeGreaterThanOrEqual(2);
    });

    it("should render item title", () => {
      render(<StoreManagement />);

      expect(screen.getByText("Item 1")).toBeTruthy();
      expect(screen.getByText("Item 2")).toBeTruthy();
    });

    it("should render item description", () => {
      render(<StoreManagement />);

      expect(screen.getByText("Description 1")).toBeTruthy();
      expect(screen.getByText("Description 2")).toBeTruthy();
    });

    it("should render points cost", () => {
      render(<StoreManagement />);

      expect(mockT).toHaveBeenCalledWith("store.pointsCost");
      expect(screen.getByText("100 pts")).toBeTruthy();
      expect(screen.getByText("200 pts")).toBeTruthy();
    });

    it("should render current quantity", () => {
      render(<StoreManagement />);

      expect(mockT).toHaveBeenCalledWith("store.currentQuantity");
      expect(screen.getByText("5 / 10")).toBeTruthy();
      expect(screen.getByText("0")).toBeTruthy();
    });

    it("should render status badge", () => {
      render(<StoreManagement />);

      expect(mockT).toHaveBeenCalledWith("common.status");
      expect(mockT).toHaveBeenCalledWith("store.available");
      expect(mockT).toHaveBeenCalledWith("store.unavailable");
    });

    it("should render out of stock badge when quantity is maxed", () => {
      const maxedItem = {
        id: 3,
        title: "Maxed Item",
        description: "Maxed Description",
        pointsCost: 50,
        currentQuantity: 5,
        maxQuantity: 5,
        isActive: true,
        isAvailable: true,
      };

      mockStoreItems.length = 0;
      mockStoreItems.push(maxedItem);
      mockIsLoading = false;
      mockUseQuery.mockImplementation((config?: any) => ({
        data: mockStoreItems,
        isLoading: false,
      }));

      render(<StoreManagement />);

      expect(mockT).toHaveBeenCalledWith("store.outOfStock");
    });

    it("should not render out of stock badge when quantity is not maxed", () => {
      render(<StoreManagement />);

      // Item 1 has currentQuantity 5 and maxQuantity 10, so not maxed
      const badges = screen.getAllByTestId("badge");
      const outOfStockBadges = badges.filter((badge) =>
        badge.textContent?.includes("store.outOfStock")
      );
      expect(outOfStockBadges.length).toBe(0);
    });
  });

  describe("Create Item", () => {
    it("should open create modal when create button is clicked", () => {
      mockStoreItems.length = 0;
      mockIsLoading = false;
      mockUseQuery.mockImplementation((config?: any) => ({
        data: [],
        isLoading: false,
      }));

      render(<StoreManagement />);

      const buttons = screen.getAllByTestId("plus-circle-icon");
      const createButton = buttons
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null && !btn.disabled);

      if (createButton) {
        fireEvent.click(createButton);
      }

      expect(screen.getByTestId("store-item-form")).toBeTruthy();
      expect(
        screen.getByTestId("store-item-form").getAttribute("data-open")
      ).toBe("true");
    });

    it("should close create modal when form calls onClose", () => {
      mockStoreItems.length = 0;
      mockIsLoading = false;
      mockUseQuery.mockImplementation((config?: any) => ({
        data: [],
        isLoading: false,
      }));

      render(<StoreManagement />);

      // Open modal
      const buttons = screen.getAllByTestId("plus-circle-icon");
      const createButton = buttons
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      if (createButton) {
        fireEvent.click(createButton);
      }

      // Close modal
      const closeButton = screen.getByTestId("form-close");
      fireEvent.click(closeButton);

      expect(
        screen.getByTestId("store-item-form").getAttribute("data-open")
      ).toBe("false");
    });

    it("should invalidate queries when create succeeds", () => {
      mockStoreItems.length = 0;
      mockIsLoading = false;
      mockUseQuery.mockImplementation((config?: any) => ({
        data: [],
        isLoading: false,
      }));

      render(<StoreManagement />);

      // Open modal
      const buttons = screen.getAllByTestId("plus-circle-icon");
      const createButton = buttons
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      if (createButton) {
        fireEvent.click(createButton);
      }

      // Trigger success
      const successButton = screen.getByTestId("form-success");
      fireEvent.click(successButton);

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["/api/store/items"],
      });
    });
  });

  describe("Edit Item", () => {
    const mockItem = {
      id: 1,
      title: "Item 1",
      description: "Description 1",
      pointsCost: 100,
      currentQuantity: 5,
      maxQuantity: 10,
      isActive: true,
      isAvailable: true,
    };

    beforeEach(() => {
      mockStoreItems.length = 0;
      mockStoreItems.push(mockItem);
      mockIsLoading = false;
      mockUseQuery.mockImplementation((config?: any) => ({
        data: mockStoreItems,
        isLoading: false,
      }));
    });

    it("should open edit modal when edit button is clicked", () => {
      render(<StoreManagement />);

      const editButtons = screen.getAllByTestId("edit-icon");
      const editButton = editButtons
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      if (editButton) {
        fireEvent.click(editButton);
      }

      const forms = screen.getAllByTestId("store-item-form");
      const editForm = forms.find(
        (form) => form.getAttribute("data-open") === "true"
      );
      expect(editForm).toBeTruthy();
      expect(screen.getByTestId("form-initial-data")).toBeTruthy();
      expect(screen.getByTestId("form-initial-data").textContent).toBe("1");
    });

    it("should close edit modal when form calls onClose", () => {
      render(<StoreManagement />);

      // Open modal
      const editButtons = screen.getAllByTestId("edit-icon");
      const editButton = editButtons
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      if (editButton) {
        fireEvent.click(editButton);
      }

      // Close modal
      const closeButton = screen.getByTestId("form-close");
      fireEvent.click(closeButton);

      expect(
        screen.getByTestId("store-item-form").getAttribute("data-open")
      ).toBe("false");
    });

    it("should invalidate queries when edit succeeds", () => {
      render(<StoreManagement />);

      // Open modal
      const editButtons = screen.getAllByTestId("edit-icon");
      const editButton = editButtons
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      if (editButton) {
        fireEvent.click(editButton);
      }

      // Trigger success
      const successButton = screen.getByTestId("form-success");
      fireEvent.click(successButton);

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["/api/store/items"],
      });
    });
  });

  describe("Delete Item", () => {
    const mockItem = {
      id: 1,
      title: "Item 1",
      description: "Description 1",
      pointsCost: 100,
      currentQuantity: 5,
      maxQuantity: 10,
      isActive: true,
      isAvailable: true,
    };

    beforeEach(() => {
      mockStoreItems.length = 0;
      mockStoreItems.push(mockItem);
      mockIsLoading = false;
      mockUseQuery.mockImplementation((config?: any) => ({
        data: mockStoreItems,
        isLoading: false,
      }));
    });

    it("should render delete button", () => {
      render(<StoreManagement />);

      expect(screen.getAllByTestId("trash-icon").length).toBeGreaterThan(0);
    });

    it("should open delete confirmation dialog when delete button is clicked", () => {
      render(<StoreManagement />);

      const trashButtons = screen.getAllByTestId("trash-icon");
      const deleteButton = trashButtons
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      if (deleteButton) {
        fireEvent.click(deleteButton);
      }

      expect(screen.getByTestId("alert-dialog")).toBeTruthy();
      expect(screen.getByTestId("alert-dialog-content")).toBeTruthy();
    });

    it("should render delete confirmation title", () => {
      render(<StoreManagement />);

      const trashButtons = screen.getAllByTestId("trash-icon");
      const deleteButton = trashButtons
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      if (deleteButton) {
        fireEvent.click(deleteButton);
      }

      expect(mockT).toHaveBeenCalledWith("store.deleteItem");
    });

    it("should render delete confirmation description", () => {
      render(<StoreManagement />);

      const trashButtons = screen.getAllByTestId("trash-icon");
      const deleteButton = trashButtons
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      if (deleteButton) {
        fireEvent.click(deleteButton);
      }

      expect(mockT).toHaveBeenCalledWith("store.confirmDelete");
    });

    it("should call delete mutation when confirm button is clicked", () => {
      render(<StoreManagement />);

      // Open dialog
      const trashButtons = screen.getAllByTestId("trash-icon");
      const deleteButton = trashButtons
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      if (deleteButton) {
        fireEvent.click(deleteButton);
      }

      // Confirm delete
      const confirmButton = screen.getByTestId("alert-dialog-action");
      fireEvent.click(confirmButton);

      expect(mockDeleteMutate).toHaveBeenCalledWith(1);
    });

    it("should invalidate queries after successful delete", () => {
      // Mock the mutation's onSuccess to be called
      (mockUseMutation as any).mockImplementation((config: any) => {
        const mutation = {
          mutate: jest.fn((itemId: number) => {
            if (config.onSuccess) {
              config.onSuccess();
            }
          }),
          isPending: false,
        };
        return mutation;
      });

      render(<StoreManagement />);

      // Open dialog
      const trashButtons = screen.getAllByTestId("trash-icon");
      const deleteButton = trashButtons
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      if (deleteButton) {
        fireEvent.click(deleteButton);
      }

      // Confirm delete
      const confirmButton = screen.getByTestId("alert-dialog-action");
      fireEvent.click(confirmButton);

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["/api/store/items"],
      });
    });

    it("should show toast after successful delete", () => {
      // Mock the mutation's onSuccess to be called
      (mockUseMutation as any).mockImplementation((config: any) => {
        const mutation = {
          mutate: jest.fn((itemId: number) => {
            if (config.onSuccess) {
              config.onSuccess();
            }
          }),
          isPending: false,
        };
        return mutation;
      });

      render(<StoreManagement />);

      // Open dialog
      const trashButtons = screen.getAllByTestId("trash-icon");
      const deleteButton = trashButtons
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      if (deleteButton) {
        fireEvent.click(deleteButton);
      }

      // Confirm delete
      const confirmButton = screen.getByTestId("alert-dialog-action");
      fireEvent.click(confirmButton);

      expect(mockToast).toHaveBeenCalled();
    });
  });

  describe("Max Items Limit", () => {
    it("should disable create button when 5 items are reached", () => {
      const items = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        title: `Item ${i + 1}`,
        description: `Description ${i + 1}`,
        pointsCost: 100,
        currentQuantity: 0,
        maxQuantity: null,
        isActive: true,
        isAvailable: true,
      }));

      mockStoreItems.length = 0;
      mockStoreItems.push(...items);
      mockIsLoading = false;
      mockUseQuery.mockImplementation((config?: any) => ({
        data: mockStoreItems,
        isLoading: false,
      }));

      render(<StoreManagement />);

      const buttons = screen.getAllByTestId("plus-circle-icon");
      const createButton = buttons
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null);

      expect(createButton?.disabled).toBe(true);
    });

    it("should show max items reached message when 5 items are reached", () => {
      const items = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        title: `Item ${i + 1}`,
        description: `Description ${i + 1}`,
        pointsCost: 100,
        currentQuantity: 0,
        maxQuantity: null,
        isActive: true,
        isAvailable: true,
      }));

      mockStoreItems.length = 0;
      mockStoreItems.push(...items);
      mockIsLoading = false;
      mockUseQuery.mockImplementation((config?: any) => ({
        data: mockStoreItems,
        isLoading: false,
      }));

      render(<StoreManagement />);

      expect(mockT).toHaveBeenCalledWith("store.maxItemsReached");
    });

    it("should not disable create button when less than 5 items", () => {
      const items = Array.from({ length: 4 }, (_, i) => ({
        id: i + 1,
        title: `Item ${i + 1}`,
        description: `Description ${i + 1}`,
        pointsCost: 100,
        currentQuantity: 0,
        maxQuantity: null,
        isActive: true,
        isAvailable: true,
      }));

      mockStoreItems.length = 0;
      mockStoreItems.push(...items);
      mockIsLoading = false;
      mockUseQuery.mockImplementation((config?: any) => ({
        data: mockStoreItems,
        isLoading: false,
      }));

      render(<StoreManagement />);

      const buttons = screen.getAllByTestId("plus-circle-icon");
      const createButton = buttons
        .map((icon) => icon.closest("button"))
        .find((btn) => btn !== null && !btn.disabled);

      expect(createButton?.disabled).toBe(false);
    });
  });
});
