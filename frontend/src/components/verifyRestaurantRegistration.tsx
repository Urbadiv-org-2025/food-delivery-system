import React, { useEffect, useState } from "react";
import AdminNavigation from "./adminNavigation";
import { log } from "console";

interface Restaurant {
  id: string;
  name: string;
  isApproved: boolean;
  address: string;
  cuisine: string;
  rating: number;
  openingHours: string;
  available: boolean;
}

const VerifyRestaurantRegistration: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (!token) {
          throw new Error("No authentication token found");
        }

        // Choose endpoint based on user role
        const endpoint =
          user.role === "admin"
            ? "http://localhost:3000/api/admin/restaurants/all"
            : "http://localhost:3000/api/admin/restaurants";

        const response = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 403) {
          throw new Error("Access denied - Insufficient permissions");
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch restaurants");
        }

        const data = await response.json();

        if (!data.success || !data.data) {
          throw new Error("Invalid response format");
        }

        const restaurants = data.data.map((restaurant: any) => ({
          id: restaurant._id || restaurant.id || "",
          name: restaurant.name || "",
          isApproved: restaurant.adminAccept || false,
          address: restaurant.location?.address || "No address provided",
          cuisine: restaurant.cuisine || "",
          rating: restaurant.rating || 0,
          openingHours: restaurant.openingHours || "",
          available: restaurant.available || false,
        }));

        setRestaurants(restaurants);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch restaurants";
        setError(errorMessage);
        console.error("Error fetching restaurants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleToggleApproval = async (
    restaurantId: string,
    currentStatus: boolean
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `http://localhost:3000/api/restaurants/${restaurantId}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            adminAccept: !currentStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update approval status");
      }

      if (data.success) {
        // Update the local state
        setRestaurants((prevRestaurants) =>
          prevRestaurants.map((restaurant) =>
            restaurant.id === restaurantId
              ? { ...restaurant, isApproved: !currentStatus }
              : restaurant
          )
        );
      } else {
        throw new Error("Failed to update approval status");
      }
    } catch (error) {
      console.error("Error updating approval status:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update approval status"
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="sticky top-0 h-screen w-16 md:w-64 bg-white shadow-lg z-10">
        <AdminNavigation />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-6 text-gray-800 tracking-tight text-center md:text-left">
          Manage Restaurant Registrations
        </h1>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Restaurant List */}
        {!loading && !error && (
          <div className="p-4">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="mb-4 p-4 border rounded">
                <h3 className="text-lg font-bold">{restaurant.name}</h3>
                <p>Address: {restaurant.address}</p>
                <p>Cuisine: {restaurant.cuisine}</p>
                <p>Status: {restaurant.isApproved ? "Approved" : "Pending"}</p>
                <button
                  onClick={() =>
                    handleToggleApproval(restaurant.id, restaurant.isApproved)
                  }
                  className={`mt-2 px-4 py-2 rounded ${
                    restaurant.isApproved
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white`}
                >
                  {restaurant.isApproved ? "Reject" : "Approve"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyRestaurantRegistration;
