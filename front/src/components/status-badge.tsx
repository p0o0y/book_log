import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, type BookStatus } from "@/lib/mock-data";

const styles: Record<BookStatus, string> = {
  reading: "bg-blue-100 text-blue-800 border-blue-200",
  finished: "bg-emerald-100 text-emerald-800 border-emerald-200",
  wishlist: "bg-amber-100 text-amber-800 border-amber-200",
};

export function StatusBadge({
  status,
  className,
}: {
  status: BookStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(styles[status], className)}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
