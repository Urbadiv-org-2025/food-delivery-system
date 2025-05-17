import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import GoogleMapPicker from "@/components/ui/GoogleMapPicker";
import { TimePicker } from "@/components/ui/time-picker";
import { loadGoogleMapsScript } from "@/lib/googleMaps";
import RestaurantAdminNavigation from "@/components/RestaurantAdminNavigation";

const cuisineOptions = [
  "Italian",
  "Chinese",
  "Indian",
  "Mexican",
  "American",
  "French",
  "Japanese",
  "Mediterranean",
  "Thai",
  "Spanish",
  "Srilankan",
];

const CreateRestaurant = () => {
  const navigate = useNavigate();
  const [hasExistingRestaurant, setHasExistingRestaurant] = useState(false);
  const [name, setName] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [available, setAvailable] = useState(true);
  const [openingHours, setOpeningHours] = useState("09:00");
  const [location, setLocation] = useState({
    address: "Colombo, Sri Lanka",
    latitude: 6.9271,
    longitude: 79.8612,
  });
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Changed to true initially
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const GOOGLE_MAPS_API_KEY =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    "AIzaSyAjt-GCTto9WtDApGDNMGD1wkppIli-pHA";

  useEffect(() => {
    const loadMaps = async () => {
      try {
        await loadGoogleMapsScript(GOOGLE_MAPS_API_KEY);
        setIsMapLoaded(true);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
      }
    };
    loadMaps();
  }, [GOOGLE_MAPS_API_KEY]);

  useEffect(() => {
    const checkExistingRestaurant = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:3000/api/admin/restaurants",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.data && response.data.data.length > 0) {
          setHasExistingRestaurant(true);
          toast({
            title: "Notice",
            description:
              "You already have a restaurant. Redirecting to dashboard...",
            variant: "default",
          });
          navigate("/restaurant_admin-dashboard");
        }
      } catch (error) {
        console.error("Error checking existing restaurant:", error);
        toast({
          title: "Error",
          description: "Failed to check existing restaurant status",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingRestaurant();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !selectedCuisine || !openingHours || !location.address) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!image) {
      toast({
        title: "Error",
        description: "Please upload an image",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("cuisine", selectedCuisine);
      formData.append("openingHours", openingHours);
      formData.append("location.address", location.address);
      formData.append("location.latitude", location.latitude.toString());
      formData.append("location.longitude", location.longitude.toString());
      formData.append("image", image);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:3000/api/restaurants",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast({
        title: "Success",
        description: "Restaurant created successfully!",
      });
      navigate("/restaurant_admin-dashboard");
    } catch (error) {
      console.error("Create error:", error);
      toast({
        title: "Error",
        description: "Failed to create restaurant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-600">Checking restaurant status</p>
        </div>
      </div>
    );
  }

  if (hasExistingRestaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Restaurant Already Exists</h2>
          <p className="mb-6 text-gray-600">
            You can only manage one restaurant at a time. Please use the
            dashboard to manage your existing restaurant.
          </p>
          <Button
            onClick={() => navigate("/restaurant_admin-dashboard")}
            className="bg-[#FF4B3E] hover:bg-[#FF6B5E] w-full"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <RestaurantAdminNavigation />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">Create New Restaurant</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Restaurant Name"
            required
          />

          <div className="space-y-2">
            <label>Cuisine</label>
            <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
              <SelectTrigger>
                <SelectValue placeholder="Select Cuisine" />
              </SelectTrigger>
              <SelectContent>
                {cuisineOptions.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </SelectItem>
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
                <p>Loading map...</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label>Upload Restaurant Image</label>
            <Input
              type="file"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              accept="image/*"
              required
            />
          </div>

          <Button
            type="submit"
            className="bg-[#FF4B3E] hover:bg-[#FF6B5E] w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Restaurant"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateRestaurant;
