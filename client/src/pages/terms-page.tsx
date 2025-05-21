import ConstructionPage from "@/components/construction-page";
import { useTranslation } from "react-i18next";

export default function TermsPage() {
  const { t } = useTranslation();
  
  return (
    <ConstructionPage 
      title={t("landing.footer.legal.terms", "Terms of Service")}
    />
  );
}