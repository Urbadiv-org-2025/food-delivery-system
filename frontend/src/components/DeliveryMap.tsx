
import { useState, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

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
  endLocation: Location;
  className?: string;
}

// Use Libraries type from @react-google-maps/api
import type { Libraries } from '@react-google-maps/api';

const libraries: Libraries = ["places"];

const DeliveryMap = ({ startLocation, endLocation, className = "" }: DeliveryMapProps) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAjt-GCTto9WtDApGDNMGD1wkppIli-pHA',
    libraries,
  });

  useEffect(() => {
    if (isLoaded && startLocation && endLocation) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: {
            lat: startLocation.latitude,
            lng: startLocation.longitude,
          },
          destination: {
            lat: endLocation.latitude,
            lng: endLocation.longitude,
          },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`Error fetching directions: ${status}`);
          }
        }
      );
    }
  }, [isLoaded, startLocation, endLocation]);

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
          position={{
            lat: startLocation.latitude,
            lng: startLocation.longitude,
          }}
          title="Start Location"
          animation={google.maps.Animation.DROP}
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
            scaledSize: new google.maps.Size(40, 40),
          }}
        />
        <Marker
          position={{
            lat: endLocation.latitude,
            lng: endLocation.longitude,
          }}
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
    </div>
  );
};

export default DeliveryMap;
