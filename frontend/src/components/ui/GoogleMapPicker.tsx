import { useEffect, useRef, useState } from "react";

interface GoogleMapPickerProps {
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  setLocation: (location: { address: string; latitude: number; longitude: number }) => void;
}

declare global {
  interface Window {
    initMap: () => void;
  }
}

const DEFAULT_LATITUDE = 6.9271; // Colombo latitude
const DEFAULT_LONGITUDE = 79.8612; // Colombo longitude

const GoogleMapPicker = ({ location, setLocation }: GoogleMapPickerProps) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load current location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            address: "Current Location",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    }

    const loadScript = () => {
      if (document.getElementById("google-maps-script")) {
        // If script already exists, initialize map directly
        window.initMap();
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA9azTdCHv4RBAQms7mYHlew9TfATz56-E&libraries=places`;
      script.async = true;

      script.onload = () => {
        window.initMap();
        setIsLoading(false);
      };

      document.body.appendChild(script);
    };

    window.initMap = () => {
      if (mapRef.current) {
        const initialLat = location.latitude || DEFAULT_LATITUDE;
        const initialLng = location.longitude || DEFAULT_LONGITUDE;

        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: initialLat, lng: initialLng },
          zoom: 15, // Increased zoom level
          disableDefaultUI: false,
          zoomControl: true,
        });

        markerRef.current = new google.maps.Marker({
          position: { lat: initialLat, lng: initialLng },
          map: mapInstanceRef.current,
          draggable: true,
          animation: google.maps.Animation.DROP, // Add drop animation
        });

        markerRef.current.addListener("dragend", (event: google.maps.MapMouseEvent) => {
          const lat = event.latLng?.lat() || 0;
          const lng = event.latLng?.lng() || 0;

          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              setLocation({
                address: results[0].formatted_address,
                latitude: lat,
                longitude: lng,
              });
            } else {
              setLocation({
                address: "Unknown location",
                latitude: lat,
                longitude: lng,
              });
            }
          });
        });
      }
    };

    loadScript();

    return () => {
      markerRef.current?.setMap(null);
      mapInstanceRef.current = null;
    };
  }, []);

  // Update marker position if location changes
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      const newPosition = new google.maps.LatLng(location.latitude || DEFAULT_LATITUDE, location.longitude || DEFAULT_LONGITUDE);
      markerRef.current.setPosition(newPosition);
      mapInstanceRef.current.setCenter(newPosition);
    }
  }, [location.latitude, location.longitude]);

  return (
    <div>
      {isLoading && (
        <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg border">
          Loading map...
        </div>
      )}
      <div ref={mapRef} className={`w-full h-64 rounded-lg border ${isLoading ? 'hidden' : ''}`} />
      <p className="mt-2 text-sm text-muted-foreground">
        Selected Address: {location.address || "No location selected yet"}
      </p>
    </div>
  );
};

export default GoogleMapPicker;
