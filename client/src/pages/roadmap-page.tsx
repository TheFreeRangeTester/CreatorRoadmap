import ConstructionPage from "@/components/construction-page";
import { useTranslation } from "react-i18next";

export default function RoadmapPage() {
  const { t } = useTranslation();
  
  return (
    <ConstructionPage 
      title={t("landing.footer.product.roadmap", "Roadmap")}
    />
  );
}