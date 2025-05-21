import ConstructionPage from "@/components/construction-page";
import { useTranslation } from "react-i18next";

export default function DemoPage() {
  const { t } = useTranslation();
  
  return (
    <ConstructionPage 
      title={t("landing.footer.product.demo", "Demo")}
    />
  );
}