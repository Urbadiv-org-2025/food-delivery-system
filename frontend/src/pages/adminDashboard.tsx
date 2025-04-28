import React from "react";
import AdminNavigation from "../components/adminNavigation";

const AdminDashboard: React.FC = () => {
    return (
        <div className="flex">
            <AdminNavigation />
            <div className="flex-1 p-6">
                <h1 className="text-2xl font-bold mb-4">Welcome to Admin Dashboard</h1>
                <p>Select an option from the navigation menu to manage the system.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;