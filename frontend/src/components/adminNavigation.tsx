import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminNavigation: React.FC = () => {
    const { logout } = useAuth();

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    const user = localStorage.getItem('user');
    const userEmail = user ? JSON.parse(user).email : "Guest";
    return (
        <nav className="bg-gray-800 text-white h-screen w-64 flex flex-col">
            <div className="p-4 text-lg font-bold border-b border-gray-700">
                Admin Dashboard
            </div>
            <ul className="flex-1">
                <li>
                    <NavLink
                        to="/admin/profiles"
                        className={({ isActive }) =>
                            `block px-4 py-2 hover:bg-gray-700 ${
                                isActive ? "bg-gray-700" : ""
                            }`
                        }
                    >
                        Profiles
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/admin/restaurants"
                        className={({ isActive }) =>
                            `block px-4 py-2 hover:bg-gray-700 ${
                                isActive ? "bg-gray-700" : ""
                            }`
                        }
                    >
                        Restaurants
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/admin/financial"
                        className={({ isActive }) =>
                            `block px-4 py-2 hover:bg-gray-700 ${
                                isActive ? "bg-gray-700" : ""
                            }`
                        }
                    >
                        Financial
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) =>
                            `block px-4 py-2 hover:bg-gray-700 ${
                                isActive ? "bg-gray-700" : ""
                            }`
                        }
                    >
                        Orders
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/admin/settings"
                        className={({ isActive }) =>
                            `block px-4 py-2 hover:bg-gray-700 ${
                                isActive ? "bg-gray-700" : ""
                            }`
                        }
                    >
                        Settings
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

export default AdminNavigation;