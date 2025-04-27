import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { useState, useEffect } from "react";

const containerStyle = {
  width: '100%',
  height: '400px',
};

const DriverCurrentDelivery = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const driverId = user?.id;
  const [directions, setDirections] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAjt-GCTto9WtDApGDNMGD1wkppIli-pHA',
    libraries: ['places'],
  });

  const { data: currentDelivery, isLoading, error } = useQuery({
    queryKey: ["currentDelivery", driverId],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:3000/api/deliveriesdriver/current/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!driverId && !!token,
  });

  useEffect(() => {
    if (currentDelivery && isLoaded) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: {
            lat: currentDelivery.startLocation.latitude,
            lng: currentDelivery.startLocation.longitude,
          },
          destination: {
            lat: currentDelivery.endLocation.latitude,
            lng: currentDelivery.endLocation.longitude,
          },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`error fetching directions ${result}`);
          }
        }
      );
    }
  }, [currentDelivery, isLoaded]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60 animate-pulse">
        <span className="text-gray-400 text-lg">Loading current delivery...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-60 text-red-500 font-semibold">
        Error fetching current delivery: {error.message}
      </div>
    );
  }

  if (!currentDelivery) {
    return (
      <div className="flex items-center justify-center h-60 text-gray-400">
        No active delivery assigned yet.
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-extrabold text-gray-800">Current Delivery</h2>
        <div className="text-sm text-gray-500 mt-2 md:mt-0">
          Last updated a few seconds ago
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 text-base">
        <div className="flex flex-col">
          <span className="font-semibold">Order ID</span>
          <span>{currentDelivery.orderId}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold">Delivery ID</span>
          <span>{currentDelivery.id}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold">Status</span>
          <span className={`capitalize ${currentDelivery.status === 'pending' ? 'text-yellow-500' : 'text-green-600'}`}>
            {currentDelivery.status}
          </span>
        </div>
      </div>

      {isLoaded && (
        <div className="rounded-xl overflow-hidden mt-6 border-2 border-gray-200 shadow-sm">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{
              lat: currentDelivery.startLocation.latitude,
              lng: currentDelivery.startLocation.longitude,
            }}
            zoom={13}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              clickableIcons: false,
            }}
          >
            <Marker
  position={{
    lat: currentDelivery.startLocation.latitude,
    lng: currentDelivery.startLocation.longitude,
  }}
  title="Start Location"
  icon={{
    url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
    scaledSize: new window.google.maps.Size(40, 40),
  }}
/>

<Marker
  position={{
    lat: currentDelivery.endLocation.latitude,
    lng: currentDelivery.endLocation.longitude,
  }}
  title="End Location"
  icon={{
    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    scaledSize: new window.google.maps.Size(40, 40),
  }}
/>

            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </div>
      )}
    </div>
  );
};

export default DriverCurrentDelivery;
