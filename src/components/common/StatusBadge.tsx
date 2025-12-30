import { Badge } from "@/components/ui/badge";

const statusColor: Record<string, string> = {
  Pending: "bg-yellow-500",
  "In Review": "bg-blue-500",
  Approved: "bg-green-600",
  Declined: "bg-red-600",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={statusColor[status] || "bg-gray-400"}>
      {status}
    </Badge>
  );
}
