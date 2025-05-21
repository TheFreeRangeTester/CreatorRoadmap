import ConstructionPage from "@/components/construction-page";
import { useTranslation } from "react-i18next";

export default function SuccessPage() {
  const { t } = useTranslation();
  
  return (
    <ConstructionPage 
      title={t("landing.footer.resources.success", "Success Stories")}
    />
  );
}