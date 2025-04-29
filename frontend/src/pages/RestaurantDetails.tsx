import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import RestaurantAdminNavigation from "@/components/RestaurantAdminNavigation";

import { Restaurant, MenuItem } from "@/types/restaurant";

const RestaurantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);

  // ✅ Fetch Restaurant Details
  const fetchRestaurant = async () => {
    try {
      const res = await axios.get(`http://localhost:3002/api/restaurants/${id}`);
      setRestaurant(res.data.data || null);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      setRestaurant(null); // Keep page, but show 'Restaurant not found'
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Menu Items
  const fetchMenuItems = async () => {
    try {
      const res = await axios.get(`http://localhost:3002/api/restaurants/${id}/menu`);
      setMenuItems(res.data.data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setMenuItems([]);
    } finally {
      setMenuLoading(false);
    }
  };

  // ✅ Run fetches on mount
  useEffect(() => {
    if (id) {
      fetchRestaurant();
      fetchMenuItems();
    }
  }, [id]);

  // ✅ Delete Restaurant
  const handleDeleteRestaurant = async () => {
    if (!window.confirm("Are you sure you want to delete this restaurant?")) return;
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast({
          title: "Error",
          description: "You must be logged in to delete a restaurant",
          variant: "destructive",
        });
        return;
      }

      await axios.delete(`http://localhost:3000/api/restaurants/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      toast({ title: "Success", description: "Restaurant deleted successfully" });
      navigate("/restaurant_admin-dashboard");
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete restaurant. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="flex">
        <RestaurantAdminNavigation />
        <div className="flex-1 p-8 text-center">Loading restaurant details...</div>
      </div>
    );
  }

  return (
    <div className="flex">
      <RestaurantAdminNavigation />
      <div className="flex-1 p-8">
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          {/* ✅ Restaurant Info */}
          {restaurant ? (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold">{restaurant.name}</h2>
                  <p className="text-muted-foreground">{restaurant.cuisine}</p>
                  <Badge variant={restaurant.available ? "default" : "secondary"}>
                    {restaurant.available ? "Open" : "Closed"}
                  </Badge>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => navigate(`/restaurants/${id}/edit`)}>Edit Restaurant</Button>
                  <Button variant="destructive" onClick={handleDeleteRestaurant}>
                    Delete Restaurant
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-red-500 text-lg text-center">
              Restaurant not found.
            </div>
          )}

          {/* ✅ Menu Section */}
          {restaurant && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Menu Items</h3>
                
              </div>

              {menuLoading ? (
                <div>Loading menu items...</div>
              ) : menuItems.length === 0 ? (
                <p className="mt-4 text-muted-foreground">No menu items available.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {menuItems.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/restaurants/${id}/menu/${item.id}`)}
                    >
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <img
                          src={`http://localhost:3000${item.image}`}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="text-lg font-semibold">{item.name}</h4>
                        <p className="text-muted-foreground text-sm">{item.category}</p>
                        <p className="text-sm mt-2">{item.price} LKR</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
                        {item.available ? "Available" : "Not Available"}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
