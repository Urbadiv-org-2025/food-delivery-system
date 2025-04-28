import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const RestaurantDashboard = () => {
  const { user } = useAuth();

  // Protect the route
  if (!user || user.role !== 'restaurant_admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Restaurant Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add your dashboard components here */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Menu Management</h2>
            {/* Add menu management functionality */}
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Orders</h2>
            {/* Add order management functionality */}
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Restaurant Settings</h2>
            {/* Add restaurant settings functionality */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;