// src/pages/Index.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Restaurant } from "@/types/restaurant";

const cuisineOptions = [
  "Italian", "Chinese", "Indian", "Mexican", "American",
  "French", "Japanese", "Mediterranean", "Thai", "Spanish", "Srilankan"
];
const categoryOptions = ["appetizer", "main-course", "dessert", "beverage"];

const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    name: "",
    cuisine: "",
    available: "",
    menuCategory: "",
  });
  

  const fetchRestaurants = async (customUrl?: string) => {
    try {
      const url = customUrl || `http://localhost:3002/api/restaurants/filter`;
      const res = await fetch(`${url}?${new URLSearchParams(filters as any)}`);
      const data = await res.json();
      setRestaurants(data.data || []);
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      toast({ title: "Error", description: "Failed to load restaurants", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchRestaurants(`http://localhost:3000/api/restaurants/nearby&latitude=${latitude}&longitude=${longitude}`);
      },
      (err) => {
        toast({ title: "Error", description: "Failed to get location", variant: "destructive" });
      }
    );
  };

  useEffect(() => {
    fetchRestaurants();
  }, [filters]);

  if (!user) return <Navigate to="/app" replace />;
  if (user.role !== "customer") return <Navigate to={`/${user.role}-dashboard`} replace />;

  const handleRestaurantClick = (id: string) => navigate(`/restaurants/${id}`);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Explore Restaurants</h1>
          <Button onClick={() => { logout(); window.location.href = "/"; }}>Sign Out</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input placeholder="Search by name" onChange={e => setFilters({ ...filters, name: e.target.value })} />
          <Select onValueChange={(val) => setFilters({ ...filters, cuisine: val })}>
            <SelectTrigger><SelectValue placeholder="Cuisine" /></SelectTrigger>
            <SelectContent>
              {cuisineOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select onValueChange={(val) => setFilters({ ...filters, available: val })}>
            <SelectTrigger><SelectValue placeholder="Availability" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="true">Available</SelectItem>
              <SelectItem value="false">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(val) => setFilters({ ...filters, menuCategory: val })}>
            <SelectTrigger><SelectValue placeholder="Menu Category" /></SelectTrigger>
            <SelectContent>
              {categoryOptions.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handleLocation} className="col-span-1 md:col-span-4 mt-2">Use My Location</Button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading restaurants...</div>
        ) : restaurants.length === 0 ? (
          <div className="text-center text-gray-500">No restaurants found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => handleRestaurantClick(restaurant.id)}
                className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={`http://localhost:3000${restaurant.image}`}
                    alt={restaurant.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="text-lg font-bold">{restaurant.name}</h3>
                  <p className="text-muted-foreground text-sm">{restaurant.cuisine}</p>
                  <p className="text-xs text-gray-500">{restaurant.location?.address}</p>
                  <div className="text-sm font-medium">⭐ {restaurant.rating?.toFixed(1) || 'N/A'} • {restaurant.available ? 'Open' : 'Closed'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
