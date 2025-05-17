import { useAuth } from "@/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { useRestaurants } from "@/hooks/use-restaurants";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { RestaurantCard } from "./restaurants/RestaurantCard";
import RestaurantAdminNavigation from "@/components/RestaurantAdminNavigation";
import { useState, useEffect } from "react";

const RestaurantDashboard = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const {
    restaurants: initialRestaurants,
    isLoading,
    error,
  } = useRestaurants();
  const [restaurants, setRestaurants] = useState(initialRestaurants || []);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialRestaurants) {
      setRestaurants(initialRestaurants);
    }
  }, [initialRestaurants]);

  // Show loading state
  if (authLoading) {
    return <div>Loading...</div>;
  }

  // Protect the route
  if (!user || user.role !== "restaurant_admin") {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAvailabilityChange = (
    restaurantId: string,
    available: boolean
  ) => {
    setRestaurants((prevRestaurants) =>
      prevRestaurants.map((restaurant) =>
        restaurant.id === restaurantId
          ? { ...restaurant, available }
          : restaurant
      )
    );
  };

  return (
    <div className="flex min-h-screen">
      <RestaurantAdminNavigation />
      <div className="flex-1 p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Restaurants</h1>
            <div className="flex gap-4">
              <Button
                onClick={() => navigate("/restaurants/new")}
                className="bg-[#FF4B3E] hover:bg-[#FF6B5E]"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                New Restaurant
              </Button>
            </div>
          </div>

          {isLoading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                onAvailabilityChange={(available) =>
                  handleAvailabilityChange(restaurant.id, available)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
