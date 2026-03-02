import { useQuery } from "@tanstack/react-query";
import { FlaskConical, X } from "lucide-react";

export function TestModeBanner() {
  const { data } = useQuery<{ isTestMode: boolean }>({
    queryKey: ["/api/test-mode/status"],
  });

  if (!data?.isTestMode) return null;

  const handleExit = async () => {
    await fetch("/api/test-mode/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    window.location.reload();
  };

  return (
    <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 relative z-50">
      <FlaskConical className="w-4 h-4" />
      <span>TEST MODE - Data and payments are simulated</span>
      <button 
        onClick={handleExit}
        className="ml-4 hover:bg-amber-600 rounded p-1 transition-colors"
        title="Exit test mode"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
