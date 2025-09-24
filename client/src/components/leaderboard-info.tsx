import { useTranslation } from "react-i18next";

export default function LeaderboardInfo() {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">
          {t("dashboard.topIdeas")}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {t("dashboard.voteDescription")}
        </p>
      </div>
    </div>
  );
}
