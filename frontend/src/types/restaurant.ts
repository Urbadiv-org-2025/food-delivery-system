export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  image: string;
  location: Location;
  available: boolean;
  restaurantAdminId: string;
  rating: number;
}

export interface MenuItem {
    id: string;
    restaurantId: string;
    name: string;
    price: number;
    description: string;
    image: string;
    available: boolean;
    category: "appetizer" | "main-course" | "dessert" | "beverage";
    ingredients: string[];
    dietaryRestrictions: ("vegetarian" | "vegan" | "Non-Veg" | "nut-free")[];
}