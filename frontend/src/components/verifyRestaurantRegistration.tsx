import React, { useEffect, useState } from "react";
import AdminNavigation from "./adminNavigation";

interface Restaurant {
    id: string;
    name: string;
    isApproved: boolean;
    address: string;
    cuisine: string;
    rating: number;
    openingHours: string;
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
                const response = await fetch("http://localhost:3000/api/restaurants");
                if (!response.ok) {
                    throw new Error("Failed to fetch restaurants.");
                }
                const data = await response.json();
                const restaurants = data.data.map((restaurant: any) => ({
                    id: restaurant.id,
                    name: restaurant.name,
                    isApproved: restaurant.adminAccept,
                    address: restaurant.location.address,
                    cuisine: restaurant.cuisine,
                    rating: restaurant.rating,
                    openingHours: restaurant.openingHours,
                }));
                setRestaurants(restaurants);
            } catch (err) {
                setError("Failed to fetch restaurants.");
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    const handleToggleApproval = async (restaurantId: string, currentStatus: boolean) => {
        try {
            const response = await new Promise<{ success: boolean }>((resolve) =>
                setTimeout(() => resolve({ success: true }), 1000)
            );

            if (response.success) {
                setRestaurants((prev) =>
                    prev.map((restaurant) =>
                        restaurant.id === restaurantId
                            ? { ...restaurant, isApproved: !currentStatus }
                            : restaurant
                    )
                );
                alert(
                    `Restaurant has been ${
                        currentStatus ? "rejected" : "approved"
                    } successfully.`
                );
            } else {
                alert("Failed to update approval status.");
            }
        } catch (error) {
            alert("Error updating approval status.");
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
                    <div className="w-full max-w-5xl mx-auto">
                        {restaurants.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                No restaurants found.
                            </div>
                        ) : (
                            <ul className="space-y-4">
                                {restaurants.map((restaurant) => (
                                    <li
                                        key={restaurant.id}
                                        className="p-4 md:p-6 bg-white rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start gap-4 md:items-center transition duration-150 hover:shadow-lg"
                                    >
                                        <div className="flex-1 space-y-1">
                                            <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                                                {restaurant.name}
                                            </h2>
                                            <p className="text-sm text-gray-500">
                                                ID: {restaurant.id}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Address: {restaurant.address}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Cuisine: {restaurant.cuisine}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Rating: {restaurant.rating} / 5
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Opening Hours: {restaurant.openingHours}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleToggleApproval(
                                                    restaurant.id,
                                                    restaurant.isApproved
                                                )
                                            }
                                            className={`w-full md:w-auto py-2 px-4 md:px-6 rounded-md text-sm font-medium text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                                restaurant.isApproved
                                                    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                                                    : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                            }`}
                                        >
                                            {restaurant.isApproved ? "Reject" : "Approve"}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyRestaurantRegistration;