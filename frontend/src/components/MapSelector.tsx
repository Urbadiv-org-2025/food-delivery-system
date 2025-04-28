
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapSelectorProps {
  onLocationSelect: (location: { latitude: number, longitude: number }) => void;
}

export const MapSelector = ({ onLocationSelect }: MapSelectorProps) => {
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [locationSource, setLocationSource] = useState<string>('');
  const [map, setMap] = useState<L.Map | null>(null);
  const [marker, setMarker] = useState<L.Marker | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map) {
      // Default coordinates (San Francisco)
      const defaultLatitude = 37.7749;
      const defaultLongitude = -122.4194;
      
      // Initialize leaflet map
      const leafletMap = L.map(mapRef.current).setView([defaultLatitude, defaultLongitude], 13);
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap);

      // Add click handler to map
      leafletMap.on('click', (e) => {
        const { lat, lng } = e.latlng;
        updateLocation(lat, lng, 'map');
      });

      setMap(leafletMap);
    }

    // Cleanup
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [mapRef.current]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          updateLocation(lat, lng, 'current');
          
          // Center map on user's location
          if (map) {
            map.setView([lat, lng], 15);
          }
        },
        () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Unable to get location"
          });
        }
      );
    }
  };

  const updateLocation = (latitude: number, longitude: number, source: string) => {
    const newLocation = { latitude, longitude };
    setLocation(newLocation);
    setLocationSource(source);
    onLocationSelect(newLocation);
    
    // Update marker
    if (map) {
      if (marker) {
        marker.setLatLng([latitude, longitude]);
      } else {
        const newMarker = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: `<div class="w-8 h-8 bg-[#FF4B3E] rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                      <path d="m3 11 19-9-9 19-2-8-8-2Z"></path>
                    </svg>
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          })
        }).addTo(map);
        setMarker(newMarker);
      }
    }
    
    // Show toast
    toast({
      title: "Location selected",
      description: source === 'current' ? "Your current location has been set" : "Location selected on map"
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Delivery Location</h3>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mb-4">
        <Button 
          type="button" 
          onClick={getLocation}
          variant="outline"
          className="flex-1"
        >
          {locationSource === 'current' && <CheckIcon className="mr-2 h-4 w-4" />}
          <Navigation className="mr-2 h-4 w-4" />
          Use Current Location
        </Button>
        <Button 
          type="button" 
          onClick={() => map?.locate()}
          variant="outline"
          className="flex-1"
        >
          {locationSource === 'map' && <CheckIcon className="mr-2 h-4 w-4" />}
          <MapPin className="mr-2 h-4 w-4" />
          Select on Map
        </Button>
      </div>
      
      <div 
        ref={mapRef}
        className="border rounded-md h-[240px] w-full bg-gray-100 shadow-inner"
      />
      
      {location.latitude !== 0 && location.longitude !== 0 && (
        <div className="text-sm text-gray-600 flex items-center mt-2">
          <MapPin className="h-4 w-4 mr-2 text-[#FF4B3E]" />
          Location set: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </div>
      )}
    </div>
  );
};
