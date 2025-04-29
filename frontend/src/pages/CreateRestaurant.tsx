import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import GoogleMapPicker from "@/components/ui/GoogleMapPicker";
import { TimePicker } from "@/components/ui/time-picker";
import { loadGoogleMapsScript } from "@/lib/googleMaps";

const cuisineOptions = [
  "Italian", "Chinese", "Indian", "Mexican", "American",
  "French", "Japanese", "Mediterranean", "Thai", "Spanish", "Srilankan"
];

const CreateRestaurant = () => {
  const navigate = useNavigate();
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
  const [isLoading, setIsLoading] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyA9azTdCHv4RBAQms7mYHlew9TfATz56-E";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !selectedCuisine || !openingHours || !location.address) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (!image) {
      toast({ title: "Error", description: "Please upload an image", variant: "destructive" });
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

      toast({ title: "Success", description: "Restaurant created successfully!" });
      navigate("/restaurant_admin-dashboard");
    } catch (error) {
      console.error("Create error:", error);
      toast({ title: "Error", description: "Failed to create restaurant", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
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
            <GoogleMapPicker location={location} setLocation={setLocation} initialLoad={true} />
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
              <p>Loading map...</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label>Upload Restaurant Image</label>
          <Input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} accept="image/*" required />
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
  );
};

export default CreateRestaurant;
