import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Restaurant, MenuItem } from "@/types/restaurant";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";

const categoryOptions = ["appetizer", "main-course", "dessert", "beverage"];
type Dietary = "vegetarian" | "vegan" | "Non-Veg" | "nut-free";
const dietaryOptions: Dietary[] = ["vegetarian", "vegan", "Non-Veg", "nut-free"];

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

  const fetchData = async () => {
    try {
      const restRes = await fetch(`http://localhost:3002/api/restaurants/${id}`);
      const menuRes = await fetch(`http://localhost:3002/api/restaurants/${id}/menu`);
      const restData = await restRes.json();
      const menuData = await menuRes.json();
      setRestaurant(restData.data);
      setMenuItems(menuData.data || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const filteredMenus = menuItems.filter(item =>
    (!filters.category || item.category === filters.category) &&
    (!filters.dietary || item.dietaryRestrictions?.includes(filters.dietary)) &&
    (!filters.available || item.available === (filters.available === "true"))
  );
  

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (!restaurant) return <div className="text-center text-red-500">Restaurant not found</div>;

  return (
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
  <div className="md:col-span-2 h-56 rounded-lg overflow-hidden relative">
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
  <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between h-56">
    <div>
      <p className="text-sm text-gray-500 font-semibold mb-1">📍 Address</p>
      <p className="text-base font-medium">{restaurant.location?.address}</p>
      <p className="text-sm text-gray-400">{restaurant.location?.city}, {restaurant.location?.region}</p>
    </div>
    <div>
      <p className="text-sm text-gray-500 font-semibold mb-1">🕒 Hours</p>
      <p className="text-base font-medium">{restaurant.available ? "Open Now" : "Closed"}</p>
      <p className="text-sm text-gray-400">Open until {restaurant.openingHours || "10:00 PM"}</p>
    </div>
  </div>
</div>



      {/* Filters */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Select onValueChange={(val) => setFilters(prev => ({ ...prev, category: val }))}>
          <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
          <SelectContent>
            {categoryOptions.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
  onValueChange={(val) => {
    if (["vegetarian", "vegan", "Non-Veg", "nut-free"].includes(val)) {
      setFilters((prev) => ({ ...prev, dietary: val as Dietary }));
    }
  }}
>

          <SelectTrigger><SelectValue placeholder="Dietary Restriction" /></SelectTrigger>
          <SelectContent>
            {dietaryOptions.map(diet => (
              <SelectItem key={diet} value={diet}>{diet}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(val) => setFilters(prev => ({ ...prev, available: val === "all" ? "" : val }))}>
          <SelectTrigger><SelectValue placeholder="Availability" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Available</SelectItem>
            <SelectItem value="false">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredMenus.map(item => (
  <div key={item.id} className="bg-white shadow rounded-xl overflow-hidden relative">
    <div className="aspect-video">
      <img
        src={`http://localhost:3000${item.image}`}
        alt={item.name}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="p-4 space-y-2">
      <h3 className="font-bold text-lg">{item.name}</h3>
      <p className="text-gray-600 text-sm">{item.description}</p>
      <div className="flex gap-2 flex-wrap">
        <Badge>{item.category}</Badge>
        {item.available ? (
          <Badge variant="default">Available</Badge>
        ) : (
          <Badge variant="secondary">Not Available</Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{item.price} LKR</p>
    </div>

    {/* ➕ Plus Button */}
    {item.available && (
      <Button
        size="icon"
        className="absolute bottom-4 right-4 rounded-full bg-[#FF4B3E] hover:bg-[#e34033] shadow-lg w-10 h-10"
        onClick={() => {
          toast({
            title: "Added to cart",
            description: `${item.name} has been added to your cart`,
          });
        }}
      >
        <Plus className="h-5 w-5 text-white" />
      </Button>
    )}
  </div>
))}
      </div>
    </div>
  );
};

export default RestaurantDetailsClient;
