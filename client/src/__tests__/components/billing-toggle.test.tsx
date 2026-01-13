import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BillingToggle from "../../components/billing-toggle";

// Mock de useTranslation
const mockT = jest.fn(
  (key: string, defaultValue?: string) => defaultValue || key
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

// Mock de Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, className, size }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      data-testid={children?.toString().includes("Monthly") ? "monthly-button" : "yearly-button"}
    >
      {children}
    </button>
  ),
}));

describe("BillingToggle", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue || key
    );
  });

  describe("Rendering", () => {
    it("should render both buttons", () => {
      render(<BillingToggle value="monthly" onChange={mockOnChange} />);

      expect(screen.getByTestId("monthly-button")).toBeTruthy();
      expect(screen.getByTestId("yearly-button")).toBeTruthy();
    });

    it("should display translated labels", () => {
      render(<BillingToggle value="monthly" onChange={mockOnChange} />);

      expect(screen.getByText("Monthly")).toBeTruthy();
      expect(screen.getByText("Yearly (20% off)")).toBeTruthy();
    });

    it("should call translation function with correct keys", () => {
      render(<BillingToggle value="monthly" onChange={mockOnChange} />);

      expect(mockT).toHaveBeenCalledWith("pricing.monthly", "Monthly");
      expect(mockT).toHaveBeenCalledWith("pricing.yearly", "Yearly (20% off)");
    });
  });

  describe("Button Variants", () => {
    it("should set monthly button to default variant when value is monthly", () => {
      render(<BillingToggle value="monthly" onChange={mockOnChange} />);

      const monthlyButton = screen.getByTestId("monthly-button");
      expect(monthlyButton.getAttribute("data-variant")).toBe("default");
    });

    it("should set monthly button to ghost variant when value is yearly", () => {
      render(<BillingToggle value="yearly" onChange={mockOnChange} />);

      const monthlyButton = screen.getByTestId("monthly-button");
      expect(monthlyButton.getAttribute("data-variant")).toBe("ghost");
    });

    it("should set yearly button to default variant when value is yearly", () => {
      render(<BillingToggle value="yearly" onChange={mockOnChange} />);

      const yearlyButton = screen.getByTestId("yearly-button");
      expect(yearlyButton.getAttribute("data-variant")).toBe("default");
    });

    it("should set yearly button to ghost variant when value is monthly", () => {
      render(<BillingToggle value="monthly" onChange={mockOnChange} />);

      const yearlyButton = screen.getByTestId("yearly-button");
      expect(yearlyButton.getAttribute("data-variant")).toBe("ghost");
    });
  });

  describe("User Interactions", () => {
    it("should call onChange with 'monthly' when monthly button is clicked", () => {
      render(<BillingToggle value="yearly" onChange={mockOnChange} />);

      const monthlyButton = screen.getByTestId("monthly-button");
      fireEvent.click(monthlyButton);

      expect(mockOnChange).toHaveBeenCalledWith("monthly");
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it("should call onChange with 'yearly' when yearly button is clicked", () => {
      render(<BillingToggle value="monthly" onChange={mockOnChange} />);

      const yearlyButton = screen.getByTestId("yearly-button");
      fireEvent.click(yearlyButton);

      expect(mockOnChange).toHaveBeenCalledWith("yearly");
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it("should allow switching between monthly and yearly", () => {
      const { rerender } = render(
        <BillingToggle value="monthly" onChange={mockOnChange} />
      );

      // Click yearly
      const yearlyButton = screen.getByTestId("yearly-button");
      fireEvent.click(yearlyButton);
      expect(mockOnChange).toHaveBeenCalledWith("yearly");

      // Update value and click monthly
      rerender(<BillingToggle value="yearly" onChange={mockOnChange} />);
      const monthlyButton = screen.getByTestId("monthly-button");
      fireEvent.click(monthlyButton);
      expect(mockOnChange).toHaveBeenCalledWith("monthly");
    });
  });

  describe("Button Properties", () => {
    it("should set size to 'sm' for both buttons", () => {
      render(<BillingToggle value="monthly" onChange={mockOnChange} />);

      const monthlyButton = screen.getByTestId("monthly-button");
      const yearlyButton = screen.getByTestId("yearly-button");

      expect(monthlyButton.getAttribute("data-size")).toBe("sm");
      expect(yearlyButton.getAttribute("data-size")).toBe("sm");
    });

    it("should apply correct className to buttons", () => {
      render(<BillingToggle value="monthly" onChange={mockOnChange} />);

      const monthlyButton = screen.getByTestId("monthly-button");
      expect(monthlyButton.className).toContain("rounded-md");
      expect(monthlyButton.className).toContain("px-3");
      expect(monthlyButton.className).toContain("py-1");
      expect(monthlyButton.className).toContain("transition-all");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string value", () => {
      render(<BillingToggle value="" onChange={mockOnChange} />);

      // Both buttons should be ghost variant when value is empty
      const monthlyButton = screen.getByTestId("monthly-button");
      const yearlyButton = screen.getByTestId("yearly-button");

      expect(monthlyButton.getAttribute("data-variant")).toBe("ghost");
      expect(yearlyButton.getAttribute("data-variant")).toBe("ghost");
    });

    it("should handle unknown value", () => {
      render(<BillingToggle value="unknown" onChange={mockOnChange} />);

      // Both buttons should be ghost variant when value is unknown
      const monthlyButton = screen.getByTestId("monthly-button");
      const yearlyButton = screen.getByTestId("yearly-button");

      expect(monthlyButton.getAttribute("data-variant")).toBe("ghost");
      expect(yearlyButton.getAttribute("data-variant")).toBe("ghost");
    });

    it("should handle multiple rapid clicks", () => {
      render(<BillingToggle value="monthly" onChange={mockOnChange} />);

      const monthlyButton = screen.getByTestId("monthly-button");
      const yearlyButton = screen.getByTestId("yearly-button");

      // Click multiple times rapidly
      fireEvent.click(monthlyButton);
      fireEvent.click(yearlyButton);
      fireEvent.click(monthlyButton);
      fireEvent.click(yearlyButton);

      expect(mockOnChange).toHaveBeenCalledTimes(4);
      expect(mockOnChange).toHaveBeenNthCalledWith(1, "monthly");
      expect(mockOnChange).toHaveBeenNthCalledWith(2, "yearly");
      expect(mockOnChange).toHaveBeenNthCalledWith(3, "monthly");
      expect(mockOnChange).toHaveBeenNthCalledWith(4, "yearly");
    });
  });
});
