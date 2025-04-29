import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { MenuItem } from "@/types/restaurant";

const MenuDetails = () => {
  const { id } = useParams<{ id: string }>();  // this is menuId!
  const navigate = useNavigate();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Menu Item
  const fetchMenuItem = async () => {
    console.log("Fetching menu item with id:", id);
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3002/api/menu/${id}`);
      console.log("Raw response:", response);
      
      if (!response.data) {
        throw new Error("No data received from server");
      }
      
      setMenuItem(response.data.data || null);
      toast({
        title: "Success",
        description: "Menu item loaded successfully!",
      });
    } catch (error: any) {
      console.error("Error fetching menu item:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch menu item",
        variant: "destructive",
      });
      setMenuItem(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (id) {
      console.log("Fetching menu item for ID:", id);
      fetchMenuItem();
    }
  }, [id]);
  

  // ✅ Delete Menu Item
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error",
          description: "You must be logged in to delete a menu item.",
          variant: "destructive",
        });
        return;
      }

      await axios.delete(`http://localhost:3000/api/menu/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({ title: "Success", description: "Menu item deleted successfully!" });
      navigate(-1); // Go back to previous page
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete menu item.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div className="p-6 text-center">Loading menu item...</div>;

  if (!menuItem) return <div className="p-6 text-center text-red-500">Menu item not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Big image */}
      <div className="aspect-video rounded-lg overflow-hidden">
        <img
          src={`http://localhost:3000${menuItem.image}`}
          alt={menuItem.name}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Details */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">{menuItem.name}</h2>
        <p className="text-muted-foreground text-lg">{menuItem.description}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">{menuItem.category}</Badge>
          {menuItem.available ? (
            <Badge variant="default">Available</Badge>
          ) : (
            <Badge variant="secondary">Not Available</Badge>
          )}
        </div>
        <p className="text-xl font-bold">{menuItem.price} LKR</p>

        {/* Ingredients */}
        <div>
          <h4 className="text-lg font-semibold">Ingredients:</h4>
          <ul className="list-disc list-inside text-muted-foreground">
            {menuItem.ingredients.map((ing, index) => (
              <li key={index}>{ing}</li>
            ))}
          </ul>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <h4 className="text-lg font-semibold">Dietary Restrictions:</h4>
          <ul className="list-disc list-inside text-muted-foreground">
            {menuItem.dietaryRestrictions.map((d, index) => (
              <li key={index}>{d}</li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <Button onClick={() => navigate(`/restaurants/${menuItem.restaurantId}/menu/${menuItem.id}/edit`)}>Edit</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </div>
      </div>
    </div>
  );
};

export default MenuDetails;
