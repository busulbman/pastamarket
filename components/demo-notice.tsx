import { Lock } from "lucide-react";
import { DEMO_WRITE_MESSAGE } from "@/lib/demo-guard";

/**
 * Canlı demoda yazma işlemlerinin kapalı olduğunu bildiren uyarı.
 * Yalnızca DEMO_READ_ONLY=true iken render edilir (çağıran taraf karar verir).
 */
export function DemoNotice({ className = "" }: { className?: string }) {
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 ${className}`}
    >
      <Lock size={17} className="mt-0.5 shrink-0" />
      <p className="leading-6">{DEMO_WRITE_MESSAGE}</p>
    </div>
  );
}

/** Form içinde kullanılan kısa satır hâli. */
export function DemoInlineNotice() {
  return (
    <p
      role="status"
      className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"
    >
      {DEMO_WRITE_MESSAGE}
    </p>
  );
}
