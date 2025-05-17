import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Restaurant } from "@/types/restaurant";
import { MapPin, X } from "lucide-react"; // ✨ Location + Clear icons
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";
import ExploreHeader from "@/components/ExploreHeader";

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

const ExploreRestaurants = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: "",
    cuisine: "",
    available: "",
  });

  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3002/api/restaurants`);
      const data = await res.json();
      setAllRestaurants(data.data || []);
      setFilteredRestaurants(data.data || []);
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      toast({
        title: "Error",
        description: "Failed to load restaurants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allRestaurants];

    if (filters.name.trim()) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(filters.name.trim().toLowerCase())
      );
    }
    if (filters.cuisine) {
      filtered = filtered.filter((r) => r.cuisine === filters.cuisine);
    }
    if (filters.available) {
      const available = filters.available === "true";
      filtered = filtered.filter((r) => r.available === available);
    }

    setFilteredRestaurants(filtered);
  };

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearby = allRestaurants.filter((r) => {
          const distance = calculateDistance(
            latitude,
            longitude,
            r.location?.latitude || 0,
            r.location?.longitude || 0
          );
          return distance <= 20; // Changed from 5km to 20km
        });

        setFilteredRestaurants(nearby);

        if (nearby.length === 0) {
          toast({
            title: "No Restaurants Nearby",
            description: "No restaurants found within 20km.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Nearby Restaurants",
            description: `Found ${nearby.length} restaurants within 20km.`,
          });
        }
      },
      () => {
        toast({
          title: "Error",
          description: "Failed to get location.",
          variant: "destructive",
        });
      }
    );
  };

  const handleClearFilters = () => {
    setFilters({ name: "", cuisine: "", available: "" });
  };

  // Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allRestaurants]);

  if (!user) return <Navigate to="/restaurants/explore" replace />;
  if (user.role !== "customer")
    return <Navigate to={`/${user.role}-dashboard`} replace />;

  const handleRestaurantClick = (id: string) => navigate(`/restaurants/${id}`);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <ExploreHeader />
        <div className="pt-20">
          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Input
              placeholder="Search by name"
              value={filters.name}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Select
              value={filters.cuisine}
              onValueChange={(val) =>
                setFilters((prev) => ({ ...prev, cuisine: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Cuisine" />
              </SelectTrigger>
              <SelectContent>
                {cuisineOptions.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.available}
              onValueChange={(val) =>
                setFilters((prev) => ({
                  ...prev,
                  available: val === "all" ? "" : val,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Available</SelectItem>
                <SelectItem value="false">Closed</SelectItem>
              </SelectContent>
            </Select>

            {/* Use Location */}
            <Button
              variant="outline"
              onClick={handleLocation}
              className="flex items-center justify-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Use Location
            </Button>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>

          {/* Restaurant Categories */}
          {loading ? (
            <div className="text-center text-gray-500">
              Loading restaurants...
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center text-gray-500">
              No restaurants found.
            </div>
          ) : (
            <div className="space-y-8">
              {cuisineOptions.map((cuisine) => {
                const restaurantsByCuisine = filteredRestaurants.filter(
                  (r) => r.cuisine === cuisine
                );
                if (restaurantsByCuisine.length === 0) return null;

                return (
                  <div key={cuisine} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">{cuisine}</h2>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, cuisine }))
                        }
                      >
                        See all
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {restaurantsByCuisine.map((restaurant) => (
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
                            <h3 className="text-lg font-bold">
                              {restaurant.name}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {restaurant.cuisine}
                            </p>
                            <p className="text-xs text-gray-500">
                              {restaurant.location?.address}
                            </p>
                            <div className="text-sm font-medium">
                              ⭐ {restaurant.rating?.toFixed(1) || "N/A"} •{" "}
                              {restaurant.available ? "Open" : "Closed"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreRestaurants;
