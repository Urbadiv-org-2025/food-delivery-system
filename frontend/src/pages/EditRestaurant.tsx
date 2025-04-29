import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import GoogleMapPicker from "@/components/ui/GoogleMapPicker"; 
import { TimePicker } from "@/components/ui/time-picker"; 
import { Restaurant } from "@/types/restaurant";
import { loadGoogleMapsScript } from "@/lib/googleMaps";


const cuisineOptions = [
  "Italian", "Chinese", "Indian", "Mexican", "American",
  "French", "Japanese", "Mediterranean", "Thai", "Spanish", "Srilankan"
];

const EditRestaurant = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [available, setAvailable] = useState(true);
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [openingHours, setOpeningHours] = useState("09:00");
  const [location, setLocation] = useState({ address: "", latitude: 0, longitude: 0 });
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Get Google Maps API key from environment variable
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyA9azTdCHv4RBAQms7mYHlew9TfATz56-E";

  // Load Google Maps API
  useEffect(() => {
    const loadMaps = async () => {
      try {
        await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
        setIsMapLoaded(true);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        setError("Failed to load Google Maps. Please check your internet connection and refresh.");
      }
    };
    
    loadMaps();
  }, [GOOGLE_MAPS_API_KEY]);

  // Fetch restaurant data with retry mechanism
  const fetchRestaurant = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await axios.get(`http://localhost:3002/api/restaurants/${id}`);
      const data = res.data.data;
      
      setRestaurant(data);
      setAvailable(data.available);
      setSelectedCuisine(data.cuisine);
      setOpeningHours(data.openingHours);
      setLocation({
        address: data.location?.address || "",
        latitude: parseFloat(data.location?.latitude) || 0,
        longitude: parseFloat(data.location?.longitude) || 0
      });
      setName(data.name);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      
      // Retry logic - try up to 3 times with increasing delays
      if (retryCount < 3) {
        setTimeout(() => {
          fetchRestaurant(retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
      } else {
        setError("Failed to load restaurant data. Please try again later.");
        setIsLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Log the current state before creating updateData
      console.log('Current available state:', available);

      const updateData = {
        name,
        cuisine: selectedCuisine,
        available: available, // Remove Boolean() conversion as it's already boolean
        openingHours,
        location: {
          address: location.address,
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString()
        }
      };

      // Log the update data before sending
      console.log('Sending update data:', updateData);
      
      const token = localStorage.getItem("token");
      
      toast({ title: "Updating", description: "Updating restaurant information..." });
      
      await axios.put(
        `http://localhost:3000/api/restaurants/${id}`, // Changed port to 3002
        updateData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      // Handle file upload separately if there's an image
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        await axios.put(
          `http://localhost:3002/api/restaurant/${id}/image`,
          formData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            timeout: 15000, // Longer timeout for image upload
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1)
              );
              console.log(`Upload progress: ${percentCompleted}%`);
            }
          }
        );
      }

      toast({ title: "Success", description: "Restaurant updated successfully!" });
      navigate(`/restaurant/${id}`);
    } catch (error) {
      console.error("Update error:", error);
      toast({ 
        title: "Error", 
        description: "Failed to update restaurant. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-[#FF4B3E] mb-2"></div>
          <p>Loading restaurant data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
          <Button 
            className="mt-4 bg-[#FF4B3E]" 
            onClick={() => fetchRestaurant()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
          <p>Restaurant not found.</p>
          <Button 
            className="mt-4 bg-[#FF4B3E]" 
            onClick={() => navigate('/restaurants')}
          >
            Back to Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">Edit Restaurant</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Restaurant Name" required />
        <div className="space-y-2">
          <label>Cuisine</label>
          <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
            <SelectTrigger><SelectValue placeholder="Select Cuisine" /></SelectTrigger>
            <SelectContent>
              {cuisineOptions.map((cuisine) => (
                <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label>Availability</label>
          <div className="flex items-center space-x-2">
            <Switch checked={available} onCheckedChange={setAvailable} /> 
            <span>{available ? "Open" : "Closed"}</span>
          </div>
        </div>
        <div className="space-y-2">
          <label>Opening Hours</label>
          <TimePicker value={openingHours} onChange={setOpeningHours} />
        </div>
        <div className="space-y-2">
          <label>Location</label>
          {isMapLoaded ? (
            <GoogleMapPicker 
              location={location} 
              setLocation={setLocation} 
              initialLoad={true}
            />
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
              <p>Loading map component...</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label>Change Image (optional)</label>
          <Input 
            type="file" 
            onChange={(e) => setImage(e.target.files?.[0] || null)} 
            accept="image/*"
          />
        </div>
        <Button 
          type="submit" 
          className="bg-[#FF4B3E] hover:bg-[#FF6B5E] w-full"
          disabled={isLoading}
        >
          Update Restaurant
        </Button>
      </form>
    </div>
  );
};

export default EditRestaurant;