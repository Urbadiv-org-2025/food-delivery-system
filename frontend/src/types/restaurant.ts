export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;        
  region?: string;
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
  openingHours?: string;
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