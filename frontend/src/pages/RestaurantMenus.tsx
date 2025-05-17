import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { MenuItem } from "@/types/restaurant";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import RestaurantAdminNavigation from "@/components/RestaurantAdminNavigation";

const RestaurantMenus = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurantId, setRestaurantId] = useState<string>("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      // First get the admin's restaurant
      fetch(`http://localhost:3002/api/restaurants/admin/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data && data.data.length > 0) {
            const restaurant = data.data[0]; // Get first restaurant since admin can only have one
            setRestaurantId(restaurant.id);
            // Then fetch the menu items
            return fetch(
              `http://localhost:3002/api/restaurants/${restaurant.id}/menu`
            );
          }
          throw new Error("No restaurant found");
        })
        .then((res) => res.json())
        .then((data) => setMenuItems(data.data || []))
        .catch((error) => {
          console.error(error);
          toast({
            title: "Error",
            description: "Could not load menu items",
            variant: "destructive",
          });
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleMenuItemClick = (item: MenuItem) => {
    navigate(`/restaurants/${restaurantId}/menu/${item.id}`);
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
            <h2 className="text-3xl font-bold">Menu Items</h2>
            <Button
              onClick={() => navigate(`/restaurants/${restaurantId}/menu/new`)}
              disabled={!restaurantId}
              className="bg-[#FF4B3E] hover:bg-[#FF6B5E]"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              New Menu Item
            </Button>
          </div>

          {loading && <p className="text-gray-500">Loading menu...</p>}

          {!loading && menuItems.length === 0 && (
            <p className="text-gray-500">
              No menu items found for your restaurant.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white shadow rounded-xl overflow-hidden relative cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleMenuItemClick(item)}
              >
                <div className="aspect-video">
                  <img
                    src={
                      item.image
                        ? `http://localhost:3000${item.image}`
                        : "/placeholder-image.jpg"
                    }
                    alt={item.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-image.jpg";
                    }}
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
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
