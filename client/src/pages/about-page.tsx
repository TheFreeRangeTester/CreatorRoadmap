import ConstructionPage from "@/components/construction-page";
import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t } = useTranslation();
  
  return (
    <ConstructionPage 
      title={t("landing.footer.company.about", "About Us")}
    />
  );
}