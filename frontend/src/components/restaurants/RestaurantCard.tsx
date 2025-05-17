import { Restaurant } from "@/types/restaurant";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { useRestaurantAvailability } from "@/hooks/use-restaurant-availability";
import { MouseEvent } from "react";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  onAvailabilityChange?: (available: boolean) => void;
}

export const RestaurantCard = ({
  restaurant,
  onClick,
  onAvailabilityChange,
}: RestaurantCardProps) => {
  const { user } = useAuth();
  const { updateAvailability, isUpdating } = useRestaurantAvailability();

  const handleAvailabilityToggle = async (checked: boolean) => {
    try {
      await updateAvailability(restaurant.id, checked);
      // Update parent component state immediately after successful API call
      onAvailabilityChange?.(checked);
    } catch (error) {
      console.error("Failed to update availability:", error);
      // Optionally show an error toast here
    }
  };

  const handleSwitchClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img
          src={`http://localhost:3000${restaurant.image}`}
          alt={restaurant.name}
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{restaurant.name}</h3>
          <div className="flex items-center gap-2">
            <Badge variant={restaurant.available ? "default" : "secondary"}>
              {restaurant.available ? "Open" : "Closed"}
            </Badge>
            {user?.role === "restaurant_admin" && (
              <div onClick={handleSwitchClick}>
                <Switch
                  checked={restaurant.available}
                  onCheckedChange={handleAvailabilityToggle}
                  disabled={isUpdating}
                  className="ml-2"
                />
              </div>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-2">
          {restaurant.cuisine}
        </p>
        <p className="text-sm line-clamp-2">{restaurant.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
        {restaurant.location.address}
      </CardFooter>
    </Card>
  );
};
