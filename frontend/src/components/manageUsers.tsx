import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavigation from "../components/adminNavigation";

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<{ id: number; name: string; role: string; email: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Added loading state
  const [error, setError] = useState<string | null>(null); // Added error state

  useEffect(() => {
    axios.defaults.baseURL = "http://localhost:3000";
    fetchUsers();
  }, []);

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  console.log(user);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Token:" + token);
      const response = await axios.get("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit user
  const handleEdit = async (id: number) => {
    const updatedEmail = prompt("Enter the new email:")?.trim();
    if (updatedEmail) {
      try {
        const response = await axios.put(
          `/api/users/${id}`,
          { email: updatedEmail },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === id ? { ...user, email: response.data.email } : user))
        );
        fetchUsers(); // Refresh the user list
      } catch (error) {
        console.error("Error editing user:", error);
        setError("Failed to update user. Please try again.");
      }
    }
  };

  // Handle delete user
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchUsers(); // Refresh the user list
      } catch (error) {
        console.error("Error deleting user:", error);
        setError("Failed to delete user. Please try again.");
      }
    }
  };

  // Parse user from localStorage
  const loggedInUser = user ? JSON.parse(user) : null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="sticky top-0 h-screen w-64 bg-white shadow-lg">
        <AdminNavigation />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800 tracking-tight">
          Manage Users
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
            <table className="table-auto w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-700">
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-t hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-6 py-4 text-gray-600">{user.id}</td>
                      <td className="px-6 py-4 text-gray-600">{user.role}</td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 flex space-x-3">
                        <button
                          onClick={() => handleEdit(user._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={loggedInUser && loggedInUser.id === user.id}
                          className={`px-4 py-2 rounded-lg text-white transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                            loggedInUser && loggedInUser.id === user.id
                              ? "bg-red-300 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;