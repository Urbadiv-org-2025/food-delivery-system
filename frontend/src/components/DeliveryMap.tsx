import { useState, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import type { Libraries } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

interface Location {
  latitude: number;
  longitude: number;
}

interface DeliveryMapProps {
  startLocation: Location;
  stopLocation?: Location | null; // Optional
  endLocation: Location;
  className?: string;
}

const libraries: Libraries = ["places"];

const DeliveryMap = ({ startLocation, stopLocation, endLocation, className = "" }: DeliveryMapProps) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null); // NEW: state for estimated time

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAjt-GCTto9WtDApGDNMGD1wkppIli-pHA',
    libraries,
  });

  useEffect(() => {
    if (isLoaded && startLocation && endLocation) {
      const directionsService = new google.maps.DirectionsService();
      const waypoints = stopLocation
        ? [{ location: { lat: stopLocation.latitude, lng: stopLocation.longitude }, stopover: true }]
        : [];

      directionsService.route(
        {
          origin: { lat: startLocation.latitude, lng: startLocation.longitude },
          destination: { lat: endLocation.latitude, lng: endLocation.longitude },
          travelMode: google.maps.TravelMode.DRIVING,
          waypoints,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);

            // NEW: Extract estimated time
            const legs = result.routes[0]?.legs;
            if (legs && legs.length > 0) {
              const totalDuration = legs.reduce((acc, leg) => acc + (leg.duration?.value || 0), 0);
              const minutes = Math.ceil(totalDuration / 60);
              setEstimatedTime(`${minutes} min`);
            }
          } else {
            console.error(`Error fetching directions: ${status}`);
          }
        }
      );
    }
  }, [isLoaded, startLocation, stopLocation, endLocation]);

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center h-[400px] bg-gray-100 rounded-xl ${className}`}>
        <div className="animate-pulse text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden ${className}`}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{
          lat: startLocation.latitude,
          lng: startLocation.longitude,
        }}
        zoom={13}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          clickableIcons: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
      >
        <Marker
          position={{ lat: startLocation.latitude, lng: startLocation.longitude }}
          title="Start Location"
          animation={google.maps.Animation.DROP}
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
            scaledSize: new google.maps.Size(40, 40),
          }}
        />
        {stopLocation && (
          <Marker
            position={{ lat: stopLocation.latitude, lng: stopLocation.longitude }}
            title="Stop Location"
            animation={google.maps.Animation.DROP}
            icon={{
              url: "http://maps.google.com/mapfiles/kml/shapes/dining.png",
              scaledSize: new google.maps.Size(25, 25),
            }}
          />
        )}
        <Marker
          position={{ lat: endLocation.latitude, lng: endLocation.longitude }}
          title="End Location"
          animation={google.maps.Animation.DROP}
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new google.maps.Size(40, 40),
          }}
        />
        {directions && (
          <DirectionsRenderer 
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: "#4F46E5",
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
              suppressMarkers: true,
            }}
          />
        )}
      </GoogleMap>

      {/* NEW: Show estimated delivery time */}
      {estimatedTime && (
        <div className="mt-2 text-center text-sm text-gray-600 font-medium">
          Estimated Delivery Time: <span className="text-indigo-600">{estimatedTime}</span>
        </div>
      )}
    </div>
  );
};

export default DeliveryMap;
