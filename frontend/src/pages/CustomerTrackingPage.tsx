// import { useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import DeliveryMap from "@/components/DeliveryMap"; // Reuse your map
// import { useParams } from 'react-router-dom';

// const socket = io("http://localhost:3004"); // Your server URL

// const CustomerTrackingPage = () => {
//   const token = localStorage.getItem("token"); // Retrieve the token string directly
//   const { deliveryId } = useParams<{ deliveryId: string }>();

//   const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [stopLocation, setStopLocation] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [endLocation, setEndLocation] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [status, setStatus] = useState<string | null>(null); // Track delivery status

//   console.log("CustomerTrackingPage deliveryId:", deliveryId);

//   useEffect(() => {
//     if (deliveryId) {
//       const fetchLocations = async () => {
//         try {
//           const response = await fetch(`http://localhost:3000/api/deliveriesorder/${deliveryId}`, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           });
//           if (response.ok) {
//             const data = await response.json();
//             setEndLocation(data.endLocation);
//             setStatus(data.status); // Save delivery status
//             if (data.status === "assigned") {
//               setStopLocation(data.startLocation || null);
//             } else {
//               setStopLocation(null);
//             }
//           } else {
//             console.error("Failed to fetch locations:", response.statusText);
//           }
//         } catch (error) {
//           console.error("Error fetching locations:", error);
//         }
//       };

//       fetchLocations();

//       socket.on(`locationUpdate:${deliveryId}`, (location) => {
//         console.log("Received location update:", location);
//         setDriverLocation(location);
//       });
//     }

//     return () => {
//       socket.off(`locationUpdate:${deliveryId}`);
//     };
//   }, [deliveryId]);

//   return (
//     <div className="w-full max-w-4xl mx-auto px-4 py-8">
//       <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
//         <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Track Your Delivery</h2>
//         {driverLocation && endLocation ? (
//           <DeliveryMap
//             startLocation={driverLocation}
//             endLocation={endLocation}
//             {...(status === "assigned" && stopLocation ? { stopLocation } : {})}
//             className="border-2 border-gray-200 shadow-sm"
//           />
//         ) : (
//           <p>Waiting for driver location...</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CustomerTrackingPage;


import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // Add useNavigate, useLocation
import { useToast } from "@/hooks/use-toast"; // Add useToast
import { Button } from "@/components/ui/button"; // Add Button
import DeliveryMap from "@/components/DeliveryMap";

const socket = io("http://localhost:3004"); // Your server URL

const CustomerTrackingPage = () => {
  const token = localStorage.getItem("token");
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const navigate = useNavigate(); // For navigation
  const location = useLocation(); // To access returnPath
  const { toast } = useToast(); // For notifications
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [stopLocation, setStopLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [endLocation, setEndLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track API call state

  console.log("CustomerTrackingPage deliveryId:", deliveryId);

  // Get customer email from localStorage
  const getCustomerEmail = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return user.email || "";
      }
      return "";
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return "";
    }
  };

  // Handle "Order Received" API call
  const handleOrderReceived = async () => {
    if (!deliveryId) return;

    const customerEmail = getCustomerEmail();
    if (!customerEmail) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Customer email not found. Please log in again.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${deliveryId}/deliver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ customerEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message || "Order marked as delivered.",
        });

        // Navigate back to the OrderStatus page
        const returnPath = location.state?.returnPath || "/";
        navigate(returnPath, { state: { orderId: deliveryId } });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark order as delivered.");
      }
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to mark order as delivered.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            setStatus(data.status);
            if (data.status === "assigned") {
              setStopLocation(data.startLocation || null);
            } else {
              setStopLocation(null);
            }
          } else {
            console.error("Failed to fetch locations:", response.statusText);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to fetch delivery details.",
            });
          }
        } catch (error) {
          console.error("Error fetching locations:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "An error occurred while fetching delivery details.",
          });
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
  }, [deliveryId, toast]);

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
        <div className="flex justify-center">
          <Button
            onClick={handleOrderReceived}
            className="bg-[#FF4B3E] hover:bg-[#FF6B5E] text-white"
            disabled={isSubmitting || status !== "picked-up"} // Enable only for picked-up status
          >
            {isSubmitting ? "Processing..." : "Order Received"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerTrackingPage;