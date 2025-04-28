import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import DeliveryMap from "@/components/DeliveryMap"; 
import DeliveryInfoCard from "@/components/DeliveryInfoCard";
import ActionButton from "@/components/ActionButton";
import { Route } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import { io } from "socket.io-client";

// double check the socket connection URL
const socket = io("http://localhost:3004");

const DriverCurrentDelivery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const token = localStorage.getItem("token");
  const driverId = user?.id;
  const queryClient = useQueryClient();

  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Fetch current delivery data
  const {
    data: currentDelivery,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["currentDelivery", driverId],
    queryFn: async () => {
      const response = await axios.get(
        `http://localhost:3000/api/deliveriesdriver/current/${driverId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    enabled: !!driverId && !!token,
    retry: 1,
    meta: {
      onError: (err: Error) => {
        console.error("Failed to fetch delivery:", err);
      },
    },
  });

  // Mutation for updating delivery status
  const updateDeliveryStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await axios.put(
        `http://localhost:3000/api/deliveries/${currentDelivery.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["currentDelivery", driverId] });

      const message = variables === "in_transit" 
        ? "Delivery started successfully! Drive safely." 
        : "Delivery completed successfully!";
        
      toast({
        title: variables === "in_transit" ? "Delivery Started" : "Delivery Completed",
        description: message,
        duration: 4000,
      });
    },
    onError: (error) => {
      console.error("Error updating delivery status:", error);
      toast({
        title: "Update Failed",
        description: "Could not update delivery status. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleStartDelivery = () => {
    updateDeliveryStatus.mutate("in_transit");
  };

  const handleEndDelivery = () => {
    updateDeliveryStatus.mutate("delivered");
  };

  // Track driver's live location
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });

        if (currentDelivery?.orderId) {
          socket.emit('driverLocationUpdate', {
            deliveryId: currentDelivery.orderId,
            location: { latitude, longitude },
          });
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [currentDelivery?.orderId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-[400px] bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // No active delivery state
  if (!currentDelivery) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col items-center justify-center h-96 text-gray-500 space-y-6">
            <div className="p-6 bg-gray-50 rounded-full">
              <Route className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700">No Active Delivery</h3>
            <p className="text-center text-gray-400 max-w-md">
              You currently have no assigned deliveries. Please wait for a new delivery 
              to be assigned or check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Decide the start and end points for map
  let mapStartLocation = null;
  let mapEndLocation = null;

  if (currentLocation) {
    if (currentDelivery.status === "assigned") {
      mapStartLocation = currentLocation;
      mapEndLocation = currentDelivery.startLocation;
    } else if (currentDelivery.status === "in_transit") {
      mapStartLocation = currentLocation;
      mapEndLocation = currentDelivery.endLocation;
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Current Delivery</h2>
          <div className="text-sm text-gray-500 mt-2 md:mt-0">
            Updated {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className="space-y-6">
          {/* Delivery Info Card */}
          <DeliveryInfoCard 
            delivery={{
              ...currentDelivery,
              customerName: currentDelivery.customerName || "Customer",
              customerAddress: currentDelivery.customerAddress || "Delivery Location",
              items: currentDelivery.items || [],
            }}
          />

          {/* Map */}
          {mapStartLocation && mapEndLocation && (
            <DeliveryMap
              startLocation={mapStartLocation}
              endLocation={mapEndLocation}
              className="border-2 border-gray-200 shadow-sm"
            />
          )}

          {/* Action Button */}
          {(currentDelivery.status === "assigned" || currentDelivery.status === "in_transit") && (
            <div className="flex justify-center pt-4">
              {currentDelivery.status === "assigned" ? (
                <ActionButton
                  variant="start"
                  onClick={handleStartDelivery}
                  isLoading={updateDeliveryStatus.isPending}
                >
                  Start Delivery
                </ActionButton>
              ) : (
                <ActionButton
                  variant="end"
                  onClick={handleEndDelivery}
                  isLoading={updateDeliveryStatus.isPending}
                >
                  Complete Delivery
                </ActionButton>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverCurrentDelivery;
