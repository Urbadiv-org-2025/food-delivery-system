import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import DeliveryMap from "@/components/DeliveryMap"; // Reuse your map
import { useParams } from 'react-router-dom';

const socket = io("http://localhost:3004"); // Your server URL

const CustomerTrackingPage = () => {
  const token = localStorage.getItem("token"); // Retrieve the token string directly
  const { deliveryId } = useParams<{ deliveryId: string }>();

  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [stopLocation, setStopLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [endLocation, setEndLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [status, setStatus] = useState<string | null>(null); // Track delivery status

  console.log("CustomerTrackingPage deliveryId:", deliveryId);

  useEffect(() => {
    if (deliveryId) {
      const fetchLocations = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/deliveriesorder/${deliveryId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setEndLocation(data.endLocation);
            setStatus(data.status); // Save delivery status
            if (data.status === "assigned") {
              setStopLocation(data.startLocation || null);
            } else {
              setStopLocation(null);
            }
          } else {
            console.error("Failed to fetch locations:", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching locations:", error);
        }
      };

      fetchLocations();

      socket.on(`locationUpdate:${deliveryId}`, (location) => {
        console.log("Received location update:", location);
        setDriverLocation(location);
      });
    }

    return () => {
      socket.off(`locationUpdate:${deliveryId}`);
    };
  }, [deliveryId]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Track Your Delivery</h2>
        {driverLocation && endLocation ? (
          <DeliveryMap
            startLocation={driverLocation}
            endLocation={endLocation}
            {...(status === "assigned" && stopLocation ? { stopLocation } : {})}
            className="border-2 border-gray-200 shadow-sm"
          />
        ) : (
          <p>Waiting for driver location...</p>
        )}
      </div>
    </div>
  );
};

export default CustomerTrackingPage;
