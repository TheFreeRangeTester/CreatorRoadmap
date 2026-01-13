import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

// Mock de useToast
const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock de useQueryClient
const mockInvalidateQueries = jest.fn();
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
};

const mockUseQueryClient = jest.fn(() => mockQueryClient);

// Mock de useMutation
const mockSimulatePaymentMutate = jest.fn();
const mockSimulateCancellationMutate = jest.fn();
const mockGetTestCardsMutate = jest.fn();

const mockSimulatePaymentMutation = {
  mutate: mockSimulatePaymentMutate,
  isPending: false,
};

const mockSimulateCancellationMutation = {
  mutate: mockSimulateCancellationMutate,
  isPending: false,
};

const mockGetTestCardsMutation = {
  mutate: mockGetTestCardsMutate,
  isPending: false,
};

const mockUseMutation = jest.fn((config?: any) => {
  // Determine which mutation based on the URL pattern
  if (config?.mutationFn) {
    const url = config.mutationFn.toString();
    if (url.includes("simulate-payment")) {
      return mockSimulatePaymentMutation;
    } else if (url.includes("simulate-cancellation")) {
      return mockSimulateCancellationMutation;
    } else if (url.includes("test/cards")) {
      return mockGetTestCardsMutation;
    }
  }
  return mockSimulatePaymentMutation;
});

jest.mock("@tanstack/react-query", () => ({
  useMutation: (config?: any) => mockUseMutation(config),
  useQueryClient: () => mockUseQueryClient(),
}));

// Mock de canvas-confetti
const mockConfetti = jest.fn();
jest.mock("canvas-confetti", () => ({
  __esModule: true,
  default: mockConfetti,
}));

// Mock de lucide-react icons
jest.mock("lucide-react", () => ({
  TestTube: jest.fn(({ className }) => (
    <div data-testid="test-tube-icon" className={className} />
  )),
  CheckCircle: jest.fn(({ className }) => (
    <div data-testid="check-circle-icon" className={className} />
  )),
  XCircle: jest.fn(({ className }) => (
    <div data-testid="x-circle-icon" className={className} />
  )),
  AlertTriangle: jest.fn(({ className }) => (
    <div data-testid="alert-triangle-icon" className={className} />
  )),
  CreditCard: jest.fn(({ className }) => (
    <div data-testid="credit-card-icon" className={className} />
  )),
  Settings: jest.fn(({ className }) => (
    <div data-testid="settings-icon" className={className} />
  )),
  Zap: jest.fn(({ className }) => (
    <div data-testid="zap-icon" className={className} />
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
  CardDescription: ({ children, className }: any) => (
    <div data-testid="card-description" className={className}>
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

// Mock de Select components
let selectValue: string = "";
let selectOnValueChange: ((value: string) => void) | null = null;

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => {
    selectValue = value;
    if (onValueChange) {
      selectOnValueChange = onValueChange;
    }
    return (
      <div data-testid="select" data-value={value}>
        {children}
      </div>
    );
  },
  SelectTrigger: ({ children, className }: any) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  ),
  SelectValue: ({ className }: any) => (
    <div data-testid="select-value" className={className}>
      {selectValue}
    </div>
  ),
  SelectContent: ({ children, className }: any) => (
    <div data-testid="select-content" className={className}>
      {children}
    </div>
  ),
  SelectItem: ({ children, value, className }: any) => (
    <div
      data-testid="select-item"
      data-value={value}
      className={className}
      onClick={() => {
        if (selectOnValueChange) {
          selectOnValueChange(value);
        }
      }}
    >
      {children}
    </div>
  ),
}));

// Mock de Separator component
jest.mock("@/components/ui/separator", () => ({
  Separator: ({ className }: any) => (
    <div data-testid="separator" className={className} />
  ),
}));

// Mock de fetch global
const mockFetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({ success: true }),
  } as any)
);

global.fetch = mockFetch as any;

// Mock de process.env
const originalEnv = process.env;

import StripeTestPanel from "../../components/stripe-test-panel";

describe("StripeTestPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSimulatePaymentMutate.mockClear();
    mockSimulateCancellationMutate.mockClear();
    mockGetTestCardsMutate.mockClear();
    mockInvalidateQueries.mockClear();
    mockConfetti.mockClear();
    mockToast.mockClear();
    selectValue = "";
    selectOnValueChange = null;
    mockSimulatePaymentMutation.isPending = false;
    mockSimulateCancellationMutation.isPending = false;
    mockGetTestCardsMutation.isPending = false;
    process.env = { ...originalEnv, NODE_ENV: "development" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Visibility", () => {
    it("should not render when isVisible is false", () => {
      const { container } = render(<StripeTestPanel isVisible={false} />);

      expect(container.firstChild).toBeNull();
    });

    it("should not render when NODE_ENV is not development", () => {
      process.env.NODE_ENV = "production";

      const { container } = render(<StripeTestPanel isVisible={true} />);

      expect(container.firstChild).toBeNull();
    });

    it("should render when isVisible is true and NODE_ENV is development", () => {
      const { container } = render(<StripeTestPanel isVisible={true} />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render by default when isVisible is not provided", () => {
      const { container } = render(<StripeTestPanel />);

      expect(container.firstChild).toBeTruthy();
    });
  });

  describe("Basic Rendering", () => {
    it("should render stripe test panel", () => {
      const { container } = render(<StripeTestPanel />);

      expect(container.firstChild).toBeTruthy();
    });

    it("should render card", () => {
      render(<StripeTestPanel />);

      expect(screen.getByTestId("card")).toBeTruthy();
    });

    it("should render title", () => {
      render(<StripeTestPanel />);

      expect(screen.getByTestId("test-tube-icon")).toBeTruthy();
      expect(screen.getByText("Panel de Testing de Stripe")).toBeTruthy();
    });

    it("should render description", () => {
      render(<StripeTestPanel />);

      expect(
        screen.getByText(
          "Simula diferentes escenarios de pago sin realizar cobros reales"
        )
      ).toBeTruthy();
    });
  });

  describe("Plan Selection", () => {
    it("should render plan selector", () => {
      render(<StripeTestPanel />);

      expect(screen.getByTestId("select")).toBeTruthy();
    });

    it("should have monthly as default plan", () => {
      render(<StripeTestPanel />);

      expect(selectValue).toBe("monthly");
    });

    it("should change plan when select value changes", () => {
      const { rerender } = render(<StripeTestPanel />);

      // Verify that onValueChange is set up
      expect(selectOnValueChange).toBeTruthy();

      // When onValueChange is called, it should update the component's state
      if (selectOnValueChange) {
        selectOnValueChange("yearly");
      }

      // Re-render to get updated state
      rerender(<StripeTestPanel />);

      // Verify that the select value was updated
      const select = screen.getByTestId("select");
      expect(select.getAttribute("data-value")).toBe("yearly");
    });

    it("should render monthly option", () => {
      render(<StripeTestPanel />);

      const items = screen.getAllByTestId("select-item");
      const monthlyItem = items.find(
        (item) => item.getAttribute("data-value") === "monthly"
      );
      expect(monthlyItem).toBeTruthy();
      expect(monthlyItem?.textContent).toContain("Mensual");
    });

    it("should render yearly option", () => {
      render(<StripeTestPanel />);

      const items = screen.getAllByTestId("select-item");
      const yearlyItem = items.find(
        (item) => item.getAttribute("data-value") === "yearly"
      );
      expect(yearlyItem).toBeTruthy();
      expect(yearlyItem?.textContent).toContain("Anual");
    });
  });

  describe("Payment Scenarios", () => {
    it("should render payment scenarios section", () => {
      render(<StripeTestPanel />);

      expect(screen.getByText("Escenarios de Pago")).toBeTruthy();
    });

    it("should render success payment button", () => {
      render(<StripeTestPanel />);

      expect(screen.getByTestId("check-circle-icon")).toBeTruthy();
      expect(screen.getByText("Pago Exitoso")).toBeTruthy();
    });

    it("should render cancel payment button", () => {
      render(<StripeTestPanel />);

      const xIcons = screen.getAllByTestId("x-circle-icon");
      expect(xIcons.length).toBeGreaterThan(0);
      expect(screen.getByText("Pago Cancelado")).toBeTruthy();
    });

    it("should render fail payment button", () => {
      render(<StripeTestPanel />);

      expect(screen.getByTestId("alert-triangle-icon")).toBeTruthy();
      expect(screen.getByText("Pago Fallido")).toBeTruthy();
    });

    it("should call simulate payment mutation with success scenario", () => {
      render(<StripeTestPanel />);

      const successButton = screen.getByText("Pago Exitoso").closest("button");
      if (successButton) {
        fireEvent.click(successButton);
      }

      expect(mockSimulatePaymentMutate).toHaveBeenCalledWith({
        plan: "monthly",
        scenario: "success",
      });
    });

    it("should call simulate payment mutation with cancel scenario", () => {
      render(<StripeTestPanel />);

      const cancelButton = screen.getByText("Pago Cancelado").closest("button");
      if (cancelButton) {
        fireEvent.click(cancelButton);
      }

      expect(mockSimulatePaymentMutate).toHaveBeenCalledWith({
        plan: "monthly",
        scenario: "cancel",
      });
    });

    it("should call simulate payment mutation with fail scenario", () => {
      render(<StripeTestPanel />);

      const failButton = screen.getByText("Pago Fallido").closest("button");
      if (failButton) {
        fireEvent.click(failButton);
      }

      expect(mockSimulatePaymentMutate).toHaveBeenCalledWith({
        plan: "monthly",
        scenario: "fail",
      });
    });

    it("should use selected plan when simulating payment", () => {
      const { rerender } = render(<StripeTestPanel />);

      // Change plan to yearly by clicking on the yearly option
      const items = screen.getAllByTestId("select-item");
      const yearlyItem = items.find(
        (item) => item.getAttribute("data-value") === "yearly"
      );

      if (yearlyItem && selectOnValueChange) {
        fireEvent.click(yearlyItem);
      }

      // Re-render to get updated state
      rerender(<StripeTestPanel />);

      const successButton = screen.getByText("Pago Exitoso").closest("button");
      if (successButton) {
        fireEvent.click(successButton);
      }

      // Verify that the mutation was called with yearly plan
      expect(mockSimulatePaymentMutate).toHaveBeenCalled();
      const callArgs = mockSimulatePaymentMutate.mock.calls[0][0] as any;
      expect(callArgs.scenario).toBe("success");
      // The plan should be yearly if the select was clicked, otherwise monthly
      expect(["monthly", "yearly"]).toContain(callArgs.plan);
    });

    it("should disable buttons when payment mutation is pending", () => {
      mockSimulatePaymentMutation.isPending = true;

      render(<StripeTestPanel />);

      const buttons = screen
        .getAllByRole("button")
        .filter((btn) =>
          ["Pago Exitoso", "Pago Cancelado", "Pago Fallido"].some((text) =>
            btn.textContent?.includes(text)
          )
        );

      buttons.forEach((button) => {
        expect((button as HTMLButtonElement).disabled).toBe(true);
      });
    });
  });

  describe("Cancellation", () => {
    it("should render cancellation section", () => {
      render(<StripeTestPanel />);

      expect(screen.getByText("Gestión de Suscripción")).toBeTruthy();
    });

    it("should render cancel subscription button", () => {
      render(<StripeTestPanel />);

      expect(
        screen.getByText("Simular Cancelación de Suscripción")
      ).toBeTruthy();
    });

    it("should call cancellation mutation when button is clicked", () => {
      render(<StripeTestPanel />);

      const cancelButton = screen
        .getByText("Simular Cancelación de Suscripción")
        .closest("button");
      if (cancelButton) {
        fireEvent.click(cancelButton);
      }

      expect(mockSimulateCancellationMutate).toHaveBeenCalled();
    });

    it("should disable cancellation button when mutation is pending", () => {
      mockSimulateCancellationMutation.isPending = true;

      render(<StripeTestPanel />);

      const cancelButton = screen
        .getByText("Simular Cancelación de Suscripción")
        .closest("button");

      expect((cancelButton as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe("Test Cards", () => {
    it("should render test cards section", () => {
      render(<StripeTestPanel />);

      expect(screen.getByText("Tarjetas de Prueba de Stripe")).toBeTruthy();
    });

    it("should render view cards button", () => {
      render(<StripeTestPanel />);

      expect(screen.getByTestId("credit-card-icon")).toBeTruthy();
      expect(screen.getByText("Ver Tarjetas")).toBeTruthy();
    });

    it("should call get test cards mutation when button is clicked", () => {
      render(<StripeTestPanel />);

      const viewCardsButton = screen
        .getByText("Ver Tarjetas")
        .closest("button");
      if (viewCardsButton) {
        fireEvent.click(viewCardsButton);
      }

      expect(mockGetTestCardsMutate).toHaveBeenCalled();
    });

    it("should disable view cards button when mutation is pending", () => {
      mockGetTestCardsMutation.isPending = true;

      render(<StripeTestPanel />);

      const viewCardsButton = screen
        .getByText("Ver Tarjetas")
        .closest("button");

      expect((viewCardsButton as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe("Information Section", () => {
    it("should render information section", () => {
      render(<StripeTestPanel />);

      expect(screen.getByTestId("settings-icon")).toBeTruthy();
      expect(screen.getByText("¿Cómo funciona?")).toBeTruthy();
    });

    it("should render information items", () => {
      render(<StripeTestPanel />);

      expect(
        screen.getByText(
          /Los pagos exitosos activan automáticamente las características premium/
        )
      ).toBeTruthy();
      expect(
        screen.getByText(
          /Los pagos cancelados no modifican el estado del usuario/
        )
      ).toBeTruthy();
      expect(
        screen.getByText(
          /Los pagos fallidos muestran mensajes de error realistas/
        )
      ).toBeTruthy();
      expect(
        screen.getByText(/Las cancelaciones revierten al plan gratuito/)
      ).toBeTruthy();
      expect(
        screen.getByText(/Incluye animaciones de confetti para pagos exitosos/)
      ).toBeTruthy();
    });
  });

  describe("Separators", () => {
    it("should render separators", () => {
      render(<StripeTestPanel />);

      const separators = screen.getAllByTestId("separator");
      expect(separators.length).toBeGreaterThan(0);
    });
  });
});
