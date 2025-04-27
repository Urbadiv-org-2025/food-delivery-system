import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const DriverCurrentDelivery = () => {
  const { user } = useAuth(); // Access user from AuthContext
  const token = localStorage.getItem("token"); // Retrieve the token string directly
  const driverId = user?.id; // Retrieve token from user context
  console.log("driverId:", driverId); // Log driverId
    console.log("Token:", token); // Log the token for debugging

  const { data: currentDelivery, isLoading, error } = useQuery({
    queryKey: ["currentDelivery", driverId],
    queryFn: async () => {
      console.log("Fetching current delivery for driverId:", driverId); // Log driverId
      const response = await axios.get(`http://localhost:3000/api/deliveriesdriver/current/${driverId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Current Delivery Response:", response.data); // Log the response data for debugging
      return response.data; // Directly return the delivery object
    },
    enabled: !!driverId && !!token, // Only fetch if driverId and token are available
  });

  if (isLoading) {
    console.log("Loading current delivery..."); // Log loading state
    return <div>Loading current delivery...</div>;
  }
  if (error) {
    console.error("Error fetching current delivery:", error); // Log error
    return <div>Error fetching current delivery: {error.message}</div>;
  }
  if (!currentDelivery) {
    console.log("No current delivery found."); // Log no delivery found
    return <div>No current delivery found.</div>;
  }

  return (
    <div className="w-full max-w-sm bg-white shadow rounded p-6 space-y-4">
      <h2 className="text-xl font-bold">Current Delivery</h2>
      <div><strong>Order ID:</strong> {currentDelivery.orderId}</div>
      <div><strong>Delivery ID:</strong> {currentDelivery.id}</div>
      <div><strong>Status:</strong> {currentDelivery.status}</div>
    </div>
  );
};

export default DriverCurrentDelivery;