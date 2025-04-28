
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const MapSelector = ({ onLocationSelect }) => {
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [locationSource, setLocationSource] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const { toast } = useToast();

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
          setLocationSource('current');
          onLocationSelect(newLocation);
          toast({
            title: "Location captured",
            description: "Your current location has been set"
          });
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

  // This would be implemented with a real map library in a production app
  const handleMapClick = (e) => {
    // Simulating a map click with random coordinates near the current ones
    const randomOffset = () => (Math.random() - 0.5) * 0.01;
    
    const newLocation = {
      latitude: location.latitude + randomOffset(),
      longitude: location.longitude + randomOffset(),
    };
    
    setLocation(newLocation);
    setLocationSource('map');
    onLocationSelect(newLocation);
    
    toast({
      title: "Location selected",
      description: "Your delivery location has been set from the map"
    });
  };

  useEffect(() => {
    // For demonstration, we'll simulate loading a map
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Delivery Location</h3>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
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
          onClick={() => setLocationSource('map')}
          variant="outline"
          className="flex-1"
        >
          {locationSource === 'map' && <CheckIcon className="mr-2 h-4 w-4" />}
          <MapPin className="mr-2 h-4 w-4" />
          Select on Map
        </Button>
      </div>
      
      {locationSource === 'map' && (
        <div 
          ref={mapRef}
          className="border rounded-md p-4 h-[200px] bg-gray-100 flex items-center justify-center cursor-pointer"
          onClick={handleMapClick}
        >
          {mapLoaded ? (
            <div className="w-full h-full relative">
              <div className="absolute inset-0 bg-blue-100 flex items-center justify-center">
                <p className="text-center text-gray-600">
                  Interactive Map
                  <br />
                  <span className="text-xs">(Click anywhere to select a location)</span>
                </p>
                {location.latitude !== 0 && location.longitude !== 0 && (
                  <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                    <MapPin className="h-8 w-8 text-red-500" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">Loading map...</p>
          )}
        </div>
      )}

      {location.latitude !== 0 && location.longitude !== 0 && (
        <div className="text-sm text-gray-600 flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Location set: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </div>
      )}
    </div>
  );
};
