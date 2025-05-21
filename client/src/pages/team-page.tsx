import ConstructionPage from "@/components/construction-page";
import { useTranslation } from "react-i18next";

export default function TeamPage() {
  const { t } = useTranslation();
  
  return (
    <ConstructionPage 
      title={t("landing.footer.company.team", "Our Team")}
    />
  );
}