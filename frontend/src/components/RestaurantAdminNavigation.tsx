// src/components/RestaurantAdminNavigation.tsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const RestaurantAdminNavigation: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const userEmail = user ? JSON.parse(user).email : "Guest";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-gray-800 text-white h-screen w-64 flex flex-col">
      <div className="p-4 text-lg font-bold border-b border-gray-700">
        Restaurant Admin
      </div>
      <ul className="flex-1">
        <li>
          <NavLink
            to="/restaurant_admin-dashboard"
            className={({ isActive }) =>
              `block px-4 py-2 hover:bg-gray-700 ${
                isActive ? "bg-gray-700" : ""
              }`
            }
          >
            My Restaurants
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/restaurant/menus"
            className={({ isActive }) =>
              `block px-4 py-2 hover:bg-gray-700 ${
                isActive ? "bg-gray-700" : ""
              }`
            }
          >
            Menus
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/restaurant/orders"
            className={({ isActive }) =>
              `block px-4 py-2 hover:bg-gray-700 ${
                isActive ? "bg-gray-700" : ""
              }`
            }
          >
            Orders
          </NavLink>
        </li>
      </ul>
      <div className="p-4 border-t border-gray-700">
        <div className="mb-2 text-sm text-gray-400">
          Logged in as: <span className="font-medium">{userEmail}</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default RestaurantAdminNavigation;
