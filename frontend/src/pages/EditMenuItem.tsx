import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { MenuItem } from "@/types/restaurant";
import RestaurantAdminNavigation from "@/components/RestaurantAdminNavigation";

const categoryOptions = ["appetizer", "main-course", "dessert", "beverage"];
const dietaryOptions = ["vegetarian", "vegan", "Non-Veg", "nut-free"];

const EditMenuItem = () => {
  const { restaurantId, id } = useParams<{ restaurantId: string; id: string }>();
  const navigate = useNavigate();

  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [available, setAvailable] = useState(true);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 Fetch existing menu item
  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        const response = await axios.get(`http://localhost:3002/api/menu/${id}`);
        const data = response.data.data;

        setMenuItem(data);
        setName(data.name);
        setPrice(data.price);
        setDescription(data.description);
        setCategory(data.category);
        setAvailable(data.available);
        setIngredients(data.ingredients || []);
        setDietaryRestrictions(data.dietaryRestrictions || []);
      } catch (error) {
        console.error("Failed to load menu item:", error);
        toast({ title: "Error", description: "Failed to load menu item", variant: "destructive" });
      }
    };

    if (id) fetchMenuItem();
  }, [id]);

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleToggleDietary = (item: string) => {
    if (dietaryRestrictions.includes(item)) {
      setDietaryRestrictions(dietaryRestrictions.filter(d => d !== item));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!name || !price || !category || ingredients.length === 0) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
  
    try {
      setIsLoading(true);
  
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", String(price));
      formData.append("description", description);
      formData.append("category", category);
      formData.append("available", String(available));
      ingredients.forEach((ingredient) => formData.append("ingredients", ingredient));
      dietaryRestrictions.forEach((restriction) => formData.append("dietaryRestrictions", restriction));
      if (image) {
        formData.append("image", image);
      }
  
      const token = localStorage.getItem("token");
  
      await axios.put(
        `http://localhost:3000/api/menu/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      toast({ title: "Success", description: "Menu item updated successfully!" });
      navigate(`/restaurants/${restaurantId}/menu/${id}`);
    } catch (error) {
      console.error("Update Menu Error:", error);
      toast({ title: "Error", description: "Failed to update menu item", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  

  if (!menuItem) {
    return (
      <div className="flex">
        <RestaurantAdminNavigation />
        <div className="flex-1 p-8 text-center">Loading menu item...</div>
      </div>
    );
  }

  return (
    <div className="flex">
      <RestaurantAdminNavigation />
      <div className="flex-1 p-8">
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold mb-4">Edit Menu Item</h2>
          <form onSubmit={handleSubmit} className="space-y-4">

            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item Name"
              required
            />

            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
              placeholder="Price (LKR)"
              required
            />

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              rows={3}
            />

            <div className="space-y-2">
              <label>Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label>Availability</label>
              <div className="flex items-center space-x-2">
                <Switch checked={available} onCheckedChange={setAvailable} />
                <span>{available ? "Available" : "Not Available"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label>Ingredients</label>
              <div className="flex gap-2">
                <Input
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  placeholder="Enter an ingredient"
                />
                <Button type="button" onClick={handleAddIngredient}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {ingredients.map((ingredient, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-200 px-2 py-1 rounded cursor-pointer text-sm"
                    onClick={() => handleRemoveIngredient(idx)}
                  >
                    {ingredient} ×
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label>Dietary Restrictions</label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={dietaryRestrictions.includes(option) ? "default" : "outline"}
                    onClick={() => handleToggleDietary(option)}
                    className="text-xs"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label>Change Item Image (optional)</label>
              <Input
                type="file"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                accept="image/*"
              />
            </div>

            <Button
              type="submit"
              className="bg-[#FF4B3E] hover:bg-[#FF6B5E] w-full"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Menu Item"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMenuItem;
