// import { useState, useRef, useEffect, memo } from 'react';
// import { Button } from '@/components/ui/button';
// import { CheckIcon, MapPin, Navigation } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import maplibregl from 'maplibre-gl';
// import 'maplibre-gl/dist/maplibre-gl.css';

// interface MapSelectorProps {
//   onLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void;
// }

// export const MapSelector = memo(({ onLocationSelect }: MapSelectorProps) => {
//   const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string }>({
//     latitude: 0,
//     longitude: 0
//   });
//   const [locationSource, setLocationSource] = useState<string>('');
//   const [map, setMap] = useState<maplibregl.Map | null>(null);
//   const [marker, setMarker] = useState<maplibregl.Marker | null>(null);
//   const [isWebGLSupported, setIsWebGLSupported] = useState<boolean | null>(null);
//   const [mapLoadError, setMapLoadError] = useState<boolean>(false);
//   const mapRef = useRef<HTMLDivElement>(null);
//   const { toast } = useToast();

//   // Check WebGL support
//   useEffect(() => {
//     const canvas = document.createElement('canvas');
//     const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
//     setIsWebGLSupported(!!gl);
//     console.log('WebGL support:', !!gl);
//     if (!gl) {
//       toast({
//         variant: 'destructive',
//         title: 'Browser Error',
//         description: 'Your browser does not support WebGL. Using static map.'
//       });
//     }
//   }, [toast]);

//   // Initialize map
//   useEffect(() => {
//     console.log('MapSelector useEffect triggered', { mapRefCurrent: !!mapRef.current, map: !!map, isWebGLSupported });
//     if (!mapRef.current || map || isWebGLSupported === false) {
//       console.log('Map initialization skipped', { mapRefCurrent: !!mapRef.current, map: !!map, isWebGLSupported });
//       return;
//     }

//     // Default coordinates (San Francisco)
//     const defaultLatitude = 37.7749;
//     const defaultLongitude = -122.4194;

//     try {
//       console.log('Attempting to initialize MapLibre map');
//       const mapLibreMap = new maplibregl.Map({
//         container: mapRef.current,
//         style: {
//           version: 8,
//           sources: {
//             osm: {
//               type: 'raster',
//               tiles: [
//                 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
//                 'https://tile.openstreetmap.de/{z}/{x}/{y}.png'
//               ],
//               tileSize: 256,
//               attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             }
//           },
//           layers: [
//             {
//               id: 'osm',
//               type: 'raster',
//               source: 'osm',
//               minzoom: 0,
//               maxzoom: 19
//             }
//           ]
//         },
//         center: [defaultLongitude, defaultLatitude],
//         zoom: 13
//       });

//       // Log canvas creation
//       mapLibreMap.on('render', () => {
//         console.log('MapLibre rendering, canvas:', mapLibreMap.getCanvas());
//       });

//       // Wait for map to load
//       mapLibreMap.on('load', () => {
//         console.log('MapLibre map loaded:', mapLibreMap);
//         // Add click handler
//         mapLibreMap.on('click', (e) => {
//           const { lng, lat } = e.lngLat;
//           console.log('Map clicked:', { lat, lng });
//           updateLocation(lat, lng, 'map');
//         });
//       });

//       // Handle map errors
//       mapLibreMap.on('error', (e) => {
//         console.error('MapLibre error:', e);
//         setMapLoadError(true);
//         toast({
//           variant: 'destructive',
//           title: 'Error',
//           description: 'Failed to load map tiles. Using static map.'
//         });
//       });

//       // Timeout to detect load failure
//       const loadTimeout = setTimeout(() => {
//         if (!mapLibreMap.isStyleLoaded()) {
//           console.error('MapLibre load timeout');
//           setMapLoadError(true);
//           toast({
//             variant: 'destructive',
//             title: 'Error',
//             description: 'Map failed to load. Using static map.'
//           });
//         }
//       }, 5000);

//       setMap(mapLibreMap);
//       console.log('Map state set:', mapLibreMap);

//       // Cleanup
//       return () => {
//         console.log('Removing MapLibre map');
//         clearTimeout(loadTimeout);
//         mapLibreMap.remove();
//       };
//     } catch (error) {
//       console.error('Map initialization error:', error);
//       setMapLoadError(true);
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to initialize map. Using static map.'
//       });
//     }
//   }, [map, isWebGLSupported]);

//   // Reverse geocode to get address
//   const getAddress = async (latitude: number, longitude: number): Promise<string | undefined> => {
//     try {
//       const response = await fetch(
//           `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`
//       );
//       const data = await response.json();
//       console.log('Reverse geocoding result:', data);
//       return data.display_name || undefined;
//     } catch (error) {
//       console.error('Reverse geocoding error:', error);
//       return undefined;
//     }
//   };

//   const getLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//           async (position) => {
//             const lat = position.coords.latitude;
//             const lng = position.coords.longitude;
//             console.log('Geolocation success:', { lat, lng });
//             const address = await getAddress(lat, lng);
//             updateLocation(lat, lng, 'current', address);

//             // Center map on user's location
//             if (map) {
//               console.log('Centering map on:', { lng, lat });
//               map.flyTo({ center: [lng, lat], zoom: 15 });
//             }
//           },
//           (error) => {
//             console.error('Geolocation error:', error);
//             toast({
//               variant: 'destructive',
//               title: 'Error',
//               description: 'Unable to get location. Please select on map or enter coordinates.'
//             });
//           }
//       );
//     } else {
//       console.error('Geolocation not supported');
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Geolocation not supported by your browser.'
//       });
//     }
//   };

//   const updateLocation = async (latitude: number, longitude: number, source: string, address?: string) => {
//     const newLocation = { latitude, longitude, address };
//     console.log('Updating location:', newLocation);
//     setLocation(newLocation);
//     setLocationSource(source);
//     onLocationSelect(newLocation);

//     // Update marker
//     if (map && !mapLoadError) {
//       console.log('Updating marker for:', { latitude, longitude });
//       if (marker) {
//         marker.setLngLat([longitude, latitude]);
//       } else {
//         const newMarker = new maplibregl.Marker({
//           color: '#FF4B3E',
//           element: (() => {
//             const el = document.createElement('div');
//             el.innerHTML = `
//               <div class="w-8 h-8 bg-[#FF4B3E] rounded-full flex items-center justify-center shadow-md">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
//                   <path d="m3 11 19-9-9 19-2-8-8-2Z"></path>
//                 </svg>
//               </div>
//             `;
//             return el;
//           })()
//         })
//             .setLngLat([longitude, latitude])
//             .addTo(map);
//         setMarker(newMarker);
//         console.log('New marker added:', newMarker);
//       }
//     }
//   };

//   // Static map fallback
//   const getStaticMapUrl = () => {
//     const lat = location.latitude || 37.7749;
//     const lng = location.longitude || -122.4194;
//     return `https://static-maps.openstreetmap.de/staticmap?center=${lat},${lng}&zoom=13&size=400x200&maptype=osm`;
//   };

//   return (
//       <div className="space-y-3 sm:space-y-4">
//         <h3 className="font-medium text-sm sm:text-base text-gray-800">Delivery Location</h3>
//         <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 mb-3 sm:mb-4">
//           <Button
//               type="button"
//               onClick={getLocation}
//               variant="outline"
//               className="flex-1 text-xs sm:text-sm border-gray-300"
//           >
//             {locationSource === 'current' && <CheckIcon className="mr-2 h-4 w-4" />}
//             <Navigation className="mr-2 h-4 w-4" />
//             Use Current Location
//           </Button>
//           <Button
//               type="button"
//               onClick={() => {
//                 console.log('Select on Map clicked');
//                 if (map) {
//                   map.resize();
//                   console.log('Map resized');
//                 }
//               }}
//               variant="outline"
//               className="flex-1 text-xs sm:text-sm border-gray-300"
//               disabled={mapLoadError || isWebGLSupported === false}
//           >
//             {locationSource === 'map' && <CheckIcon className="mr-2 h-4 w-4" />}
//             <MapPin className="mr-2 h-4 w-4" />
//             Select on Map
//           </Button>
//         </div>

//         {isWebGLSupported === false || mapLoadError ? (
//             <div className="border rounded-md h-[200px] sm:h-[240px] w-full bg-gray-100 shadow-inner flex items-center justify-center">
//               <img
//                   src={getStaticMapUrl()}
//                   alt="Static map"
//                   className="w-full h-full object-cover rounded-md cursor-pointer"
//                   onClick={() => window.open(`https://www.openstreetmap.org/#map=13/${location.latitude || 37.7749}/${location.longitude || -122.4194}`, '_blank')}
//               />
//             </div>
//         ) : (
//             <div
//                 ref={mapRef}
//                 className="border rounded-md h-[200px] sm:h-[240px] w-full bg-gray-100 shadow-inner map-container"
//                 style={{ position: 'relative', zIndex: 0 }}
//             />
//         )}

//         {location.latitude !== 0 && location.longitude !== 0 && (
//             <div className="text-xs sm:text-sm text-gray-600 flex items-center mt-2">
//               <MapPin className="h-4 w-4 mr-2 text-[#FF4B3E]" />
//               <span>
//             Location set:{' '}
//                 {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
//           </span>
//             </div>
//         )}
//       </div>
//   );
// });

import { useState, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import type { Libraries } from '@react-google-maps/api';

interface MapSelectorProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void;
}

const libraries: Libraries = ['places']; // Required for Google Maps

const mapContainerStyle = {
  width: '100%',
  height: '240px', // Matches sm:h-[240px] from original
};

export const MapSelector = memo(({ onLocationSelect }: MapSelectorProps) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string }>({
    latitude: 0,
    longitude: 0,
  });
  const [locationSource, setLocationSource] = useState<string>('');
  const { toast } = useToast();

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyAjt-GCTto9WtDApGDNMGD1wkppIli-pHA', // Use your API key
    libraries,
  });

  // Default center (San Francisco, as in original)
  const defaultCenter = {
    lat: 37.7749,
    lng: -122.4194,
  };

  // Reverse geocode to get address
  const getAddress = async (latitude: number, longitude: number): Promise<string | undefined> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`
      );
      const data = await response.json();
      console.log('Reverse geocoding result:', data);
      return data.display_name || undefined;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch address.',
      });
      return undefined;
    }
  };

  // Get current location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log('Geolocation success:', { lat, lng });
          const address = await getAddress(lat, lng);
          updateLocation(lat, lng, 'current', address);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Unable to get location. Please select on map.',
          });
        }
      );
    } else {
      console.error('Geolocation not supported');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Geolocation not supported by your browser.',
      });
    }
  };

  // Update location and notify parent
  const updateLocation = async (latitude: number, longitude: number, source: string, address?: string) => {
    const newLocation = { latitude, longitude, address };
    console.log('Updating location:', newLocation);
    setLocation(newLocation);
    setLocationSource(source);
    onLocationSelect(newLocation);
  };

  // Handle map click to select location
  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      console.log('Map clicked:', { lat, lng });
      const address = await getAddress(lat, lng);
      updateLocation(lat, lng, 'map', address);
    }
  };

  // Static map fallback (if Google Maps fails to load)
  const getStaticMapUrl = () => {
    const lat = location.latitude || defaultCenter.lat;
    const lng = location.longitude || defaultCenter.lng;
    return `https://static-maps.openstreetmap.de/staticmap?center=${lat},${lng}&zoom=13&size=400x200&maptype=osm`;
  };

  if (!isLoaded) {
    return (
      <div className="border rounded-md h-[200px] sm:h-[240px] w-full bg-gray-100 shadow-inner flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-medium text-sm sm:text-base text-gray-800">Delivery Location</h3>
      <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 mb-3 sm:mb-4">
        <Button
          type="button"
          onClick={getLocation}
          variant="outline"
          className="flex-1 text-xs sm:text-sm border-gray-300"
        >
          {locationSource === 'current' && <CheckIcon className="mr-2 h-4 w-4" />}
          <Navigation className="mr-2 h-4 w-4" />
          Use Current Location
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 text-xs sm:text-sm border-gray-300"
        >
          {locationSource === 'map' && <CheckIcon className="mr-2 h-4 w-4" />}
          <MapPin className="mr-2 h-4 w-4" />
          Select on Map
        </Button>
      </div>

      <div className="border rounded-md h-[200px] sm:h-[240px] w-full bg-gray-100 shadow-inner">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={location.latitude !== 0 && location.longitude !== 0 ? { lat: location.latitude, lng: location.longitude } : defaultCenter}
          zoom={13}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            clickableIcons: false,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          }}
        >
          {location.latitude !== 0 && location.longitude !== 0 && (
            <Marker
              position={{ lat: location.latitude, lng: location.longitude }}
              title="Selected Location"
              animation={google.maps.Animation.DROP}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new google.maps.Size(40, 40),
              }}
            />
          )}
        </GoogleMap>
      </div>

      {location.latitude !== 0 && location.longitude !== 0 && (
        <div className="text-xs sm:text-sm text-gray-600 flex items-center mt-2">
          <MapPin className="h-4 w-4 mr-2 text-[#FF4B3E]" />
          <span>
            Location set:{' '}
            {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
          </span>
        </div>
      )}
    </div>
  );
});