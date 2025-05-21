import ConstructionPage from "@/components/construction-page";
import { useTranslation } from "react-i18next";

export default function BlogPage() {
  const { t } = useTranslation();
  
  return (
    <ConstructionPage 
      title={t("landing.footer.resources.blog", "Blog")}
    />
  );
}