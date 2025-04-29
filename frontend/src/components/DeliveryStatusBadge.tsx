
import { cn } from "@/lib/utils";

interface DeliveryStatusBadgeProps {
  status: string;
  className?: string;
}

const DeliveryStatusBadge = ({ status, className }: DeliveryStatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_transit":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-sm font-semibold border capitalize",
        getStatusStyles(),
        className
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
};

export default DeliveryStatusBadge;
