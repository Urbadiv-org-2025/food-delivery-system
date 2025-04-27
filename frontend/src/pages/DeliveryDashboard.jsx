import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button"; // Assuming you use a button component
import { useAuth } from "@/context/AuthContext";
import DriverDeliveries from "./DriverDeliveries";
import DriverCurrentDelivery from "../components/DriverCurrentDelivery"; // Assuming you have this component

const fetchDelivery = async () => {
  const res = await axios.get("/api/delivery/latest"); // Adjust your endpoint if needed
  return res.data;
};

const updateDeliveryStatus = async ({ id, status }) => {
  await axios.put(`/api/delivery/${id}`, { status });
};

const DeliveryDashboard = () => {
  const { user } = useAuth(); // Access user from AuthContext

  const userId = user?.id || "Unknown User"; // Fallback if user is not available

  const { data, isLoading, error } = useQuery({
    queryKey: ["delivery"],
    queryFn: fetchDelivery,
    refetchInterval: 5000, // Poll every 5 seconds for new deliveries
  });

  const mutation = useMutation({
    mutationFn: updateDeliveryStatus,
    onSuccess: () => {
      console.log("Status updated!");
    },
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
    <div className="p-4 flex flex-col items-center justify-center min-h-screen gap-4">
      {/* Display User ID at the top */}
      <div className="absolute top-4 left-4 text-gray-700">
        <strong>User ID:</strong> {userId}
      </div>

      <h1 className="text-2xl font-bold">New Delivery Request</h1>
      <div className="w-full max-w-sm bg-white shadow rounded p-6 space-y-4">
        <div><strong>Order ID:</strong> {data.orderId}</div>
        <div><strong>Delivery ID:</strong> {data.id}</div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Button className="w-full sm:w-1/2" onClick={handleAccept}>
            Accept
          </Button>
          <Button variant="destructive" className="w-full sm:w-1/2" onClick={handleDecline}>
            Decline
          </Button>
        </div>
      </div>

      {/* Include DriverDeliveries component */}
      <DriverDeliveries />

      {/* Include DriverCurrentDelivery component */}
      <DriverCurrentDelivery />
    </div>
  );
};

export default DeliveryDashboard;