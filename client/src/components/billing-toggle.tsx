
import React from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface BillingToggleProps {
  value: string;
  onChange: (value: string) => void;
}

export default function BillingToggle({ value, onChange }: BillingToggleProps) {
  const { t } = useTranslation();
  
  return (
    <div className="inline-flex items-center rounded-md border p-1 bg-background">
      <Button
        variant={value === "monthly" ? "default" : "ghost"}
        size="sm"
        className="rounded-sm px-3 py-1 transition-all"
        onClick={() => onChange("monthly")}
      >
        {t("pricing.monthly", "Monthly")}
      </Button>
      <Button
        variant={value === "yearly" ? "default" : "ghost"}
        size="sm"
        className="rounded-sm px-3 py-1 transition-all"
        onClick={() => onChange("yearly")}
      >
        {t("pricing.yearly", "Yearly (20% off)")}
      </Button>
    </div>
  );
}
