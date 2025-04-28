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
}