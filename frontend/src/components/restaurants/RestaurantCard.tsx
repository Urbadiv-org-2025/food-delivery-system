import { Restaurant } from "@/types/restaurant";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export const RestaurantCard = ({ restaurant, onClick }: RestaurantCardProps) => {
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
          <Badge variant={restaurant.available ? "default" : "secondary"}>
            {restaurant.available ? "Open" : "Closed"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm mb-2">{restaurant.cuisine}</p>
        <p className="text-sm line-clamp-2">{restaurant.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 text-sm text-muted-foreground">
        {restaurant.location.address}
      </CardFooter>
    </Card>
  );
};