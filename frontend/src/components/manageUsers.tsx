import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<{ id: number; name: string; role: string; email: string }[]>([]);

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const response = await axios.get("/api/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        axios.defaults.baseURL = "http://localhost:3000/api";
        fetchUsers();
    }, []);

    // Handle edit user
    const handleEdit = async (id: number) => {
        const updatedName = prompt("Enter the new name:");
        if (updatedName) {
            try {
                const response = await axios.put("/api/users", { id, name: updatedName });
                setUsers((prevUsers) =>
                    prevUsers.map((user) => (user.id === id ? { ...user, name: response.data.name } : user))
                );
            } catch (error) {
                console.error("Error editing user:", error);
            }
        }
    };

    // Handle delete user
    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete("/api/users", { data: { id } });
                setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
            <div className="overflow-x-auto">
                <table className="table-auto w-full bg-white shadow-md rounded-lg">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Role</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-t">
                                <td className="px-4 py-2">{user.name}</td>
                                <td className="px-4 py-2">{user.role}</td>
                                <td className="px-4 py-2">{user.email}</td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => handleEdit(user.id)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;