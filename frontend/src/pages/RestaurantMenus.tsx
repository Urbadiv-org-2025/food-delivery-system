import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { Restaurant, MenuItem } from "@/types/restaurant";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {PlusCircle} from "lucide-react";
import RestaurantAdminNavigation from "@/components/RestaurantAdminNavigation";

const RestaurantMenus = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:3002/api/restaurants/admin/${user.id}`)
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
        .then(data => setMenuItems(data.data || []))  // Fixed: Removed extra parenthesis
        .catch(() => toast({ 
          title: "Error", 
          description: "Failed to load menu", 
          variant: "destructive" 
        }))
        .finally(() => setLoading(false));
    } else {
      setMenuItems([]);
    }
  }, [selectedRestaurantId]);

  const handleMenuItemClick = (item: MenuItem) => {
    navigate(`/restaurants/${selectedRestaurantId}/menu/${item.id}`);
  };

  if (!user || user.role !== "restaurant_admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <RestaurantAdminNavigation />
      <div className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">View Menus</h2>
            <Button 
              onClick={() => navigate(`/restaurants/${selectedRestaurantId}/menu/new`)}
              disabled={!selectedRestaurantId}
              className="bg-[#FF4B3E] hover:bg-[#FF6B5E]"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              New Menu Item
            </Button>
          </div>

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
                className="bg-white shadow rounded-xl overflow-hidden relative cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleMenuItemClick(item)}
              >
                <div className="aspect-video">
                  <img
                    src={item.image ? `http://localhost:3000${item.image}` : '/placeholder-image.jpg'}
                    alt={item.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg';
                    }}
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
    </div>
  );
};

export default RestaurantMenus;
