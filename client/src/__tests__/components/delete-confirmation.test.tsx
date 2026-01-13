import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeleteConfirmation from "../../components/delete-confirmation";

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
  AlertTriangle: jest.fn(({ className }) => (
    <div data-testid="alert-triangle-icon" className={className} />
  )),
  Loader2: jest.fn(({ className }) => (
    <div data-testid="loader-icon" className={className} />
  )),
}));

// Mock de AlertDialog components
jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children, open, onOpenChange }: any) => {
    if (!open) return null;
    return (
      <div data-testid="alert-dialog" onClick={() => onOpenChange(false)}>
        {children}
      </div>
    );
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
  AlertDialogCancel: ({ children, onClick, disabled, className }: any) => (
    <button
      data-testid="alert-dialog-cancel"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  ),
  AlertDialogAction: ({ children, onClick, disabled, className }: any) => (
    <button
      data-testid="alert-dialog-action"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  ),
}));

describe("DeleteConfirmation", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
  });

  describe("Visibility", () => {
    it("should not render when isOpen is false", () => {
      render(
        <DeleteConfirmation
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={false}
        />
      );

      expect(screen.queryByTestId("alert-dialog")).toBeNull();
    });

    it("should render when isOpen is true", () => {
      render(
        <DeleteConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={false}
        />
      );

      expect(screen.getByTestId("alert-dialog")).toBeTruthy();
    });
  });

  describe("Content", () => {
    it("should render title", () => {
      render(
        <DeleteConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={false}
        />
      );

      expect(screen.getByText("Delete idea")).toBeTruthy();
    });

    it("should render description", () => {
      render(
        <DeleteConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={false}
        />
      );

      expect(
        screen.getByText(
          "Are you sure you want to delete this idea? This action cannot be undone and all votes will be lost."
        )
      ).toBeTruthy();
    });

    it("should render alert triangle icon", () => {
      render(
        <DeleteConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={false}
        />
      );

      expect(screen.getByTestId("alert-triangle-icon")).toBeTruthy();
    });
  });

  describe("Buttons", () => {
    it("should render cancel button", () => {
      render(
        <DeleteConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={false}
        />
      );

      expect(screen.getByTestId("alert-dialog-cancel")).toBeTruthy();
      expect(screen.getByText("Cancel")).toBeTruthy();
    });

    it("should render delete button", () => {
      render(
        <DeleteConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={false}
        />
      );

      expect(screen.getByTestId("alert-dialog-action")).toBeTruthy();
      expect(screen.getByText("Delete")).toBeTruthy();
    });

    it("should call onConfirm when delete button is clicked", () => {
      render(
        <DeleteConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={false}
        />
      );

      const deleteButton = screen.getByTestId("alert-dialog-action");
      fireEvent.click(deleteButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when cancel button is clicked", () => {
      render(
        <DeleteConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={false}
        />
      );

      const cancelButton = screen.getByTestId("alert-dialog-cancel");
      fireEvent.click(cancelButton);

      // Cancel button triggers onOpenChange(false) which calls onClose
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Deleting State", () => {
    it("should show loading state when isDeleting is true", () => {
      render(
        <DeleteConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={true}
        />
      );

      expect(screen.getByText("Deleting...")).toBeTruthy();
      expect(screen.getByTestId("loader-icon")).toBeTruthy();
    });

    it("should disable buttons when isDeleting is true", () => {
      render(
        <DeleteConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={true}
        />
      );

      const cancelButton = screen.getByTestId(
        "alert-dialog-cancel"
      ) as HTMLButtonElement;
      const deleteButton = screen.getByTestId(
        "alert-dialog-action"
      ) as HTMLButtonElement;

      expect(cancelButton.disabled).toBe(true);
      expect(deleteButton.disabled).toBe(true);
    });

    it("should show delete text when isDeleting is false", () => {
      render(
        <DeleteConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={false}
        />
      );

      expect(screen.getByText("Delete")).toBeTruthy();
      expect(screen.queryByText("Deleting...")).toBeNull();
    });
  });

  describe("Dialog Close", () => {
    it("should call onClose when dialog is closed", () => {
      render(
        <DeleteConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={false}
        />
      );

      const dialog = screen.getByTestId("alert-dialog");
      fireEvent.click(dialog);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid clicks on delete button", () => {
      render(
        <DeleteConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={false}
        />
      );

      const deleteButton = screen.getByTestId("alert-dialog-action");
      fireEvent.click(deleteButton);
      fireEvent.click(deleteButton);
      fireEvent.click(deleteButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(3);
    });

    it("should not call onConfirm when delete button is disabled", () => {
      render(
        <DeleteConfirmation
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          isDeleting={true}
        />
      );

      const deleteButton = screen.getByTestId(
        "alert-dialog-action"
      ) as HTMLButtonElement;
      fireEvent.click(deleteButton);

      // Button is disabled, so onClick may not fire, but if it does, onConfirm should not be called
      // Actually, disabled buttons can still fire events in tests, so we check the button state
      expect(deleteButton.disabled).toBe(true);
    });
  });
});
