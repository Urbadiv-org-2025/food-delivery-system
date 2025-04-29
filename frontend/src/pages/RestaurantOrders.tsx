import React from 'react';
import RestaurantAdminNavigation from "@/components/RestaurantAdminNavigation";

const RestaurantOrders: React.FC = () => {
    return (
        <div className="flex min-h-screen">
            <RestaurantAdminNavigation />
            <div className="flex-1 p-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Restaurant Orders</h1>
                    </div>
                    <p className="text-gray-600">Manage your restaurant's orders here.</p>
                </div>
            </div>
        </div>
    );
};

export default RestaurantOrders;