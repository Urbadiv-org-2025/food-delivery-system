import { useEffect, useRef, useState } from "react";

interface GoogleMapPickerProps {
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  setLocation: (location: { address: string; latitude: number; longitude: number }) => void;
  initialLoad?: boolean; // Made optional since we're not using it
}

declare global {
  interface Window {
    initMap: () => void;
    gm_authFailure?: () => void;
  }
}

const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({ 
  location, 
  setLocation,
  initialLoad 
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up auth failure handler
  useEffect(() => {
    window.gm_authFailure = () => {
      setMapError("Google Maps API key error. Please check your API key.");
      setIsLoading(false);
    };

    return () => {
      window.gm_authFailure = undefined;
    };
  }, []);

  // Check if Google Maps API is loaded
  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps) {
        setIsGoogleLoaded(true);
        setIsLoading(false);
      } else {
        // Set a timeout to prevent infinite checks
        const timeoutId = setTimeout(checkGoogleMapsLoaded, 100);
        
        // After 10 seconds, stop trying and show error
        setTimeout(() => {
          clearTimeout(timeoutId);
          if (!window.google || !window.google.maps) {
            setMapError("Failed to load Google Maps. Check your internet connection.");
            setIsLoading(false);
          }
        }, 10000);
      }
    };

    checkGoogleMapsLoaded();
  }, []);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isGoogleLoaded) return;

    const loadMap = async () => {
      try {
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
        
        // Get initial position from location prop
        const initialPosition = {
          lat: location.latitude || 0,
          lng: location.longitude || 0
        };

        // Initialize map
        if (!mapRef.current) {
          const mapOptions = {
            zoom: 15,
            center: initialPosition,
            mapId: 'RESTAURANT_MAP',
            disableDefaultUI: false,
            zoomControl: true,
          };
          
          mapRef.current = new Map(document.getElementById("map")!, mapOptions);

          // Initialize marker at the restaurant location
          markerRef.current = new AdvancedMarkerElement({
            map: mapRef.current,
            position: initialPosition,
            gmpDraggable: true,
            title: "Restaurant Location"
          });

          // Add click listener to map
          mapRef.current.addListener("click", handleMapClick);
          
          if (markerRef.current) {
            markerRef.current.addListener("dragend", handleMarkerDragEnd);
          }
        }

        // Always update marker position and map center when location changes
        if (markerRef.current && location.latitude && location.longitude) {
          const newPosition = {
            lat: location.latitude,
            lng: location.longitude
          };
          
          markerRef.current.position = newPosition;
          mapRef.current?.setCenter(newPosition);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError("Failed to initialize map. Please refresh the page and try again.");
      }
    };

    loadMap();
  }, [location, isGoogleLoaded]); // Remove initialLoad from dependencies

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    const lat = event.latLng?.lat() || 0;
    const lng = event.latLng?.lng() || 0;

    try {
      // Using newer async/await approach with Geocoder
      const { Geocoder } = await google.maps.importLibrary("geocoding") as google.maps.GeocodingLibrary;
      const geocoder = new Geocoder();
      
      const response = await geocoder.geocode({ 
        location: { lat, lng } 
      });
      
      if (response.results && response.results[0]) {
        setLocation({
          address: response.results[0].formatted_address,
          latitude: lat,
          longitude: lng,
        });
        
        // Update marker position
        if (markerRef.current) {
          markerRef.current.position = { lat, lng };
        }
      } else {
        setLocation({
          address: "Unknown location",
          latitude: lat,
          longitude: lng,
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setLocation({
        address: "Error finding address",
        latitude: lat,
        longitude: lng,
      });
    }
  };

  const handleMarkerDragEnd = async (event: google.maps.MapMouseEvent) => {
    const lat = event.latLng?.lat() || 0;
    const lng = event.latLng?.lng() || 0;

    try {
      // Using newer async/await approach with Geocoder
      const { Geocoder } = await google.maps.importLibrary("geocoding") as google.maps.GeocodingLibrary;
      const geocoder = new Geocoder();
      
      const response = await geocoder.geocode({ 
        location: { lat, lng } 
      });
      
      if (response.results && response.results[0]) {
        setLocation({
          address: response.results[0].formatted_address,
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
    } catch (error) {
      console.error("Geocoding error:", error);
      setLocation({
        address: "Error finding address",
        latitude: lat,
        longitude: lng,
      });
    }
  };

  if (mapError) {
    return (
      <div className="border border-red-200 bg-red-50 p-4 rounded-md">
        <p className="text-red-600">{mapError}</p>
        <p className="text-sm mt-2">
          You can still enter location details manually below:
        </p>
        <input 
          type="text"
          className="mt-2 p-2 border rounded w-full"
          placeholder="Address" 
          value={location.address}
          onChange={(e) => setLocation({
            ...location,
            address: e.target.value
          })}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 border border-gray-200 rounded-md">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-2"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div 
        id="map" 
        className="h-96 w-full rounded-md border border-gray-200"
        aria-label="Google Maps location picker"
      />
      <p className="text-sm text-gray-500">
        Click on the map or drag the marker to set location
      </p>
    </div>
  );
};

export default GoogleMapPicker;