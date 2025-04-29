import React from 'react';
import RestaurantAdminNavigation from "@/components/RestaurantAdminNavigation";

const RestaurantOrders: React.FC = () => {
    return (
        <div className="flex">
            <RestaurantAdminNavigation />
            <div className="flex-1 p-8">
                <h1 className="text-2xl font-bold mb-4">Restaurant Orders</h1>
                <p className="text-gray-600">Manage your restaurant's orders here.</p>
            </div>
        </div>
    );
};

export default RestaurantOrders;