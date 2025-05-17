import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Restaurant, MenuItem } from "@/types/restaurant";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CartItem, useCart } from "@/context/CartContext";
import ExploreHeader from "@/components/ExploreHeader";

const categoryOptions = ["appetizer", "main-course", "dessert", "beverage"];
type Dietary = "vegetarian" | "vegan" | "Non-Veg" | "nut-free";
const dietaryOptions: Dietary[] = [
  "vegetarian",
  "vegan",
  "Non-Veg",
  "nut-free",
];

const RestaurantDetailsClient = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filters, setFilters] = useState<{
    category: string;
    dietary: Dietary | "";
    available: string;
  }>({
    category: "",
    dietary: "",
    available: "",
  });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const {
    addToCart,
    restaurantId: currentCartRestaurantId,
    clearCart,
  } = useCart();
  const [showConflict, setShowConflict] = useState(false);
  const [pendingItem, setPendingItem] = useState<CartItem | null>(null);

  const handleAddToCart = (item: MenuItem, quantity: number) => {
    const newItem: CartItem = {
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity,
      restaurantId: restaurant?.id ?? "",
      restaurantName: restaurant?.name ?? "",
    };

    if (
      currentCartRestaurantId &&
      currentCartRestaurantId !== newItem.restaurantId
    ) {
      setPendingItem(newItem);
      setShowConflict(true);
      return;
    }

    addToCart(newItem);
    toast({
      title: "Added to cart",
      description: `${newItem.name} × ${quantity} added to your cart`,
    });
  };

  const fetchData = async () => {
    try {
      const restRes = await fetch(
        `http://localhost:3002/api/restaurants/${id}`
      );
      const menuRes = await fetch(
        `http://localhost:3002/api/restaurants/${id}/menu`
      );
      const restData = await restRes.json();
      const menuData = await menuRes.json();
      setRestaurant(restData.data);
      setMenuItems(menuData.data || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const filteredMenus = menuItems.filter(
    (item) =>
      (!filters.category || item.category === filters.category) &&
      (!filters.dietary ||
        item.dietaryRestrictions?.includes(filters.dietary)) &&
      (!filters.available || item.available === (filters.available === "true"))
  );

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (!restaurant)
    return <div className="text-center text-red-500">Restaurant not found</div>;

  return (
    <>
      <ExploreHeader />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="p-6 max-w-7xl mx-auto space-y-8">
          {/* Hero */}
          <div className="rounded-xl overflow-hidden h-[300px]">
            <img
              src={`http://localhost:3000${restaurant.image}`}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Header Info */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">{restaurant.name}</h1>
            <p className="text-gray-600">{restaurant.location?.address}</p>
            <Badge variant={restaurant.available ? "default" : "secondary"}>
              {restaurant.available ? "Open" : "Closed"}
            </Badge>
          </div>

          {/* Map & Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Map */}
            <div className="md:col-span-2 h-46 rounded-lg overflow-hidden relative">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAjt-GCTto9WtDApGDNMGD1wkppIli-pHA&q=${restaurant.location?.latitude},${restaurant.location?.longitude}&zoom=14`}
                width="100%"
                height="100%"
                allowFullScreen
                className="border-0 w-full h-full"
                loading="lazy"
                style={{
                  filter: "grayscale(20%) contrast(90%) brightness(95%)",
                }}
              />
            </div>

            {/* Info box */}
            <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between h-46">
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">
                  📍 Address
                </p>
                <p className="text-base font-medium">
                  {restaurant.location?.address}
                </p>
                <p className="text-sm text-gray-400">
                  {restaurant.location?.city}, {restaurant.location?.region}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">
                  🕒 Hours
                </p>
                <p className="text-base font-medium">
                  {restaurant.available ? "Open Now" : "Closed"}
                </p>
                <p className="text-sm text-gray-400">
                  Open until {restaurant.openingHours || "10:00 PM"}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Select
              onValueChange={(val) =>
                setFilters((prev) => ({ ...prev, category: val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={(val) => {
                if (
                  ["vegetarian", "vegan", "Non-Veg", "nut-free"].includes(val)
                ) {
                  setFilters((prev) => ({ ...prev, dietary: val as Dietary }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Dietary Restriction" />
              </SelectTrigger>
              <SelectContent>
                {dietaryOptions.map((diet) => (
                  <SelectItem key={diet} value={diet}>
                    {diet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
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
          </div>

          {/* Menu */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenus.map((item) => (
              <div
                key={item.id}
                className="bg-white shadow rounded-xl overflow-hidden relative"
              >
                <div className="aspect-video">
                  <img
                    src={`http://localhost:3000${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge>{item.category}</Badge>
                    <Badge variant={item.available ? "default" : "secondary"}>
                      {item.available ? "Available" : "Not Available"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.price} LKR
                  </p>
                </div>
                {item.available && (
                  <Button
                    size="icon"
                    className="absolute bottom-4 right-4 rounded-full bg-[#FF4B3E] hover:bg-[#e34033] w-10 h-10"
                    onClick={() => {
                      setSelectedItem(item);
                      setQuantity(1);
                    }}
                  >
                    <Plus className="text-white h-5 w-5" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Dialog for item */}
          {selectedItem && (
            <Dialog
              open={!!selectedItem}
              onOpenChange={() => setSelectedItem(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedItem.name}</DialogTitle>
                </DialogHeader>
                <div className="flex gap-4 items-center">
                  <img
                    src={`http://localhost:3000${selectedItem.image}`}
                    className="w-24 h-24 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">
                      {selectedItem.description}
                    </p>
                    <div className="flex gap-2 items-center">
                      <span>Qty:</span>
                      <Input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(+e.target.value)}
                        className="w-20"
                      />
                    </div>
                    <div className="mt-2 font-semibold text-lg">
                      Total: {selectedItem.price * quantity} LKR
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedItem(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#FF4B3E] hover:bg-[#e34033] text-white"
                    onClick={() => {
                      handleAddToCart(selectedItem, quantity);
                      setSelectedItem(null);
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Conflict Dialog */}
          <Dialog open={showConflict} onOpenChange={setShowConflict}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new order?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-500">
                Your cart has items from another restaurant. Start a new order
                to add items from <b>{restaurant?.name}</b>?
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowConflict(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-black text-white"
                  onClick={() => {
                    if (pendingItem) {
                      clearCart();
                      addToCart(pendingItem);
                      toast({
                        title: "Cart updated",
                        description: "Started new order.",
                      });
                      setShowConflict(false);
                    }
                  }}
                >
                  New Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default RestaurantDetailsClient;
