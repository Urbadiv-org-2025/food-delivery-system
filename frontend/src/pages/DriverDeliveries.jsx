import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const fetchDriverDeliveries = async (driverId) => {
  const token = localStorage.getItem("token"); // Retrieve the token string directly

  console.log("Token:", token); // Log the token for debugging
  if (!token) {
    throw new Error("Token not found");
  }

  const response = await axios.get(`http://localhost:3000/api/deliveriesdriver/${driverId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("Response data:", response.data); // Log the response data for debugging
  return response.data;
};

const DriverDeliveries = () => {
  const { user } = useAuth();
  const driverId = user?.id;

  const { data: deliveries, isLoading, error } = useQuery({
    queryKey: ["driverDeliveries", driverId],
    queryFn: () => fetchDriverDeliveries(driverId),
    enabled: !!driverId, // Only fetch if driverId is available
  });

  if (isLoading) return <div>Loading deliveries...</div>;
  if (error) return <div>Error fetching deliveries: {error.message}</div>;

  return (
    <div>
      <h1>My Deliveries</h1>
      {deliveries?.length > 0 ? (
        <ul>
          {deliveries.map((delivery) => (
            <li key={delivery._id}>
              <strong>Delivery ID:</strong> {delivery.id} <br />
              <strong>Order ID:</strong> {delivery.orderId} <br />
              <strong>Driver ID:</strong> {delivery.driverId} <br />
              <strong>Status:</strong> {delivery.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>No deliveries found.</p>
      )}
    </div>
  );
};

export default DriverDeliveries;