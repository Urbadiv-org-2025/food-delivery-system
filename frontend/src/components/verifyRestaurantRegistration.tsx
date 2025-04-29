import React, { useEffect, useState } from "react";

interface Restaurant {
    id: string;
    name: string;
    isApproved: boolean;
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
                // Simulate API call to fetch restaurants
                const response = await new Promise<Restaurant[]>((resolve) =>
                    setTimeout(
                        () =>
                            resolve([
                                { id: "1", name: "Restaurant A", isApproved: false },
                                { id: "2", name: "Restaurant B", isApproved: true },
                            ]),
                        1000
                    )
                );
                setRestaurants(response);
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
            // Simulate API call to update approval status
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

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
                <h1 className="text-2xl font-bold mb-4 text-center">
                    Manage Restaurant Registrations
                </h1>
                {restaurants.length === 0 ? (
                    <div className="text-center text-gray-500">No restaurants found.</div>
                ) : (
                    <ul className="space-y-4">
                        {restaurants.map((restaurant) => (
                            <li
                                key={restaurant.id}
                                className="flex justify-between items-center p-4 bg-gray-50 rounded-md shadow-sm"
                            >
                                <div>
                                    <h2 className="text-lg font-semibold">{restaurant.name}</h2>
                                    <p className="text-sm text-gray-500">ID: {restaurant.id}</p>
                                </div>
                                <button
                                    onClick={() =>
                                        handleToggleApproval(restaurant.id, restaurant.isApproved)
                                    }
                                    className={`py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                        restaurant.isApproved
                                            ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                                            : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                                    }`}
                                >
                                    {restaurant.isApproved ? "Reject" : "Approve"}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default VerifyRestaurantRegistration;