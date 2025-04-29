import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Restaurant, MenuItem } from "@/types/restaurant";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import RestaurantAdminNavigation from "@/components/RestaurantAdminNavigation";

const RestaurantMenus = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:3002/api/restaurants/owner/${user.id}`)
        .then(res => res.json())
        .then(data => setRestaurants(data.data || []))
        .catch(() => toast({ title: "Error", description: "Could not load restaurants", variant: "destructive" }));
    }
  }, [user]);

  useEffect(() => {
    if (selectedRestaurantId) {
      setLoading(true);
      fetch(`http://localhost:3002/api/restaurants/${selectedRestaurantId}/menu`)
        .then(res => res.json())
        .then(data => setMenuItems(data.data || []))
        .catch(() => toast({ title: "Error", description: "Failed to load menu", variant: "destructive" }))
        .finally(() => setLoading(false));
    } else {
      setMenuItems([]);
    }
  }, [selectedRestaurantId]);

  if (!user || user.role !== "restaurant_admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex">
      <RestaurantAdminNavigation />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">View Menus</h2>

        <Select onValueChange={setSelectedRestaurantId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a restaurant" />
          </SelectTrigger>
          <SelectContent>
            {restaurants.map(r => (
              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {loading && <p className="text-gray-500">Loading menu...</p>}

        {!loading && selectedRestaurantId && menuItems.length === 0 && (
          <p className="text-gray-500">No menu items found for this restaurant.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {menuItems.map(item => (
            <div
              key={item.id}
              className="bg-white shadow rounded-xl overflow-hidden relative"
            >
              <div className="aspect-video">
                <img
                  src={`http://localhost:3000${item.image}`}
                  alt={item.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge>{item.category}</Badge>
                  {item.available ? (
                    <Badge variant="default">Available</Badge>
                  ) : (
                    <Badge variant="secondary">Not Available</Badge>
                  )}
                </div>
                <p className="text-sm">{item.price} LKR</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenus;
