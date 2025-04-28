import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import DriverDeliveries from "./DriverDeliveries";
import DriverCurrentDelivery from "../components/DriverCurrentDelivery";

const fetchDelivery = async () => {
  const res = await axios.get("/api/delivery/latest");
  return res.data;
};

const updateDeliveryStatus = async ({ id, status }) => {
  await axios.put(`/api/delivery/${id}`, { status });
};

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const userId = user?.id || "Unknown User";

  const { data, isLoading, error } = useQuery({
    queryKey: ["delivery"],
    queryFn: fetchDelivery,
    refetchInterval: 5000,
  });

  const mutation = useMutation({
    mutationFn: updateDeliveryStatus,
    onSuccess: () => console.log("Status updated!"),
  });

  const handleAccept = () => {
    mutation.mutate({ id: data.id, status: "accepted" });
  };

  const handleDecline = () => {
    mutation.mutate({ id: data.id, status: "declined" });
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="text-center text-red-500">Error fetching delivery</div>;

  return (
    <div className="p-4 flex flex-col items-center min-h-screen bg-gray-50 relative">
      {/* User ID Top Left */}
      <div className="absolute top-4 left-4 text-sm text-gray-600">
        <span className="font-semibold">User ID:</span> {userId}
      </div>

      {/* Current Delivery */}
      <DriverCurrentDelivery />


      {/* Driver Deliveries
      <div className="w-full max-w-3xl mt-6">
        <DriverDeliveries />
      </div> */}
    </div>
  );
};

export default DeliveryDashboard;
