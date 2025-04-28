import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await axios.get(`http://localhost:3002/api/restaurant/${id}`);
        const data = res.data.data;
        setRestaurant(data);
        setAvailable(data.available);
        setSelectedCuisine(data.cuisine);
        setOpeningHours(data.openingHours);
        setLocation(data.location);
        setName(data.name);
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      }
    };
    fetchRestaurant();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("cuisine", selectedCuisine);
      formData.append("available", String(available));
      formData.append("openingHours", openingHours);
      formData.append("location.address", location.address);
      formData.append("location.latitude", String(location.latitude));
      formData.append("location.longitude", String(location.longitude));
      if (image) {
        formData.append("image", image);
      }

      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3000/api/restaurants/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      toast({ title: "Success", description: "Restaurant updated successfully!" });
      navigate(`/restaurant/${id}`);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update restaurant", variant: "destructive" });
    }
  };

  if (!restaurant) return <div>Loading...</div>;

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
          <label>Availability  </label>
          <Switch checked={available} onCheckedChange={setAvailable} /> {available ? "Open" : "Closed"}
        </div>
        <div className="space-y-2">
          <label>Opening Hours</label>
          <TimePicker value={openingHours} onChange={setOpeningHours} />
        </div>
        <div className="space-y-2">
          <label>Location</label>
          <GoogleMapPicker location={location} setLocation={setLocation} />
        </div>
        <div className="space-y-2">
          <label>Change Image (optional)</label>
          <Input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        </div>
        <Button type="submit" className="bg-[#FF4B3E] hover:bg-[#FF6B5E] w-full">
          Update Restaurant
        </Button>
      </form>
    </div>
  );
};

export default EditRestaurant;
