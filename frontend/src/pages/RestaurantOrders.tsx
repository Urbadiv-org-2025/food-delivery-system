import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import RestaurantAdminNavigation from "@/components/RestaurantAdminNavigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'canceled';

type Order = {
  orderId: string;
  customerId: string;
  items: { name: string; price: number; quantity: number }[];
  status: OrderStatus;
  total: number;
  customerEmail?: string; // Optional, assuming it's available from backend
};

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-200 text-yellow-800",
  confirmed: "bg-blue-200 text-blue-800",
  preparing: "bg-purple-200 text-purple-800",
  ready: "bg-green-200 text-green-800",
  delivered: "bg-green-500 text-white",
  canceled: "bg-red-400 text-white",
};

const RestaurantOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const restaurantId = "restaurant_123"; // Replace with dynamic restaurant ID if needed
  const apiBaseUrl = 'http://localhost:3000/api'; // Adjust if your API base URL is different
  // Assume these are available (e.g., from restaurant data or context)
  const restaurantLocation = { longitude: 79.8612, latitude: 6.9271 }; // Example coordinates (Colombo, Sri Lanka)

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:3003', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    // Join restaurant room
    newSocket.emit('joinRestaurantRoom', restaurantId);

    // Handle orderUpdate event
    newSocket.on('orderUpdate', (data: { restaurantId: string; orders: Order[]; message: string }) => {
      if (data.restaurantId === restaurantId && data.orders) {
        setOrders(data.orders);
        toast({
          title: "Orders Updated",
          description: data.message,
        });
      }
    });

    // Handle newOrder event
    newSocket.on('newOrder', (data: Order & { message: string }) => {
      setOrders((prev) => [
        { ...data, orderId: data.orderId },
        ...prev.filter((order) => order.orderId !== data.orderId),
      ]);
      toast({
        title: "New Order Received",
        description: `Order ${data.orderId}: ${data.message}`,
      });
    });

    // Handle socket errors
    newSocket.on('error', (data: { message: string }) => {
      toast({
        title: "Error",
        description: data.message,
        variant: "destructive",
      });
    });

    // Clean up on component unmount
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [restaurantId]);

  const handleAcceptOrder = async (orderId: string, customerEmail: string) => {
    try {
      const response = await axios.post(
          `${apiBaseUrl}/orders/${orderId}/prepare`,
          { customerEmail },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } } // Adjust based on your auth method
      );
      toast({
        title: "Order Accepted",
        description: response.data.message,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to accept order",
        variant: "destructive",
      });
    }
  };

  const handleDeclineOrder = async (orderId: string, customerEmail: string) => {
    try {
      const response = await axios.post(
          `${apiBaseUrl}/orders/${orderId}/cancel`,
          { customerEmail },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } } // Adjust based on your auth method
      );
      toast({
        title: "Order Declined",
        description: response.data.message,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to decline order",
        variant: "destructive",
      });
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      const response = await axios.post(
          `${apiBaseUrl}/orders/${orderId}/ready`,
          { longitude: restaurantLocation.longitude, latitude: restaurantLocation.latitude },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } } // Adjust based on your auth method
      );
      toast({
        title: "Order Marked as Ready",
        description: response.data.message,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to mark order as ready",
        variant: "destructive",
      });
    }
  };

  return (
      <div className="flex min-h-screen">
        <RestaurantAdminNavigation />
        <div className="flex-1 p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Restaurant Orders</h1>

            <table className="w-full table-auto border bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-left">
              <tr className="text-sm text-gray-700">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total (LKR)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
              </thead>
              <tbody>
              {orders.map((order) => (
                  <tr key={order.orderId} className="border-t text-sm">
                    <td className="p-3 font-medium">{order.orderId}</td>
                    <td className="p-3">{order.customerId}</td>
                    <td className="p-3">
                      <ul className="space-y-1">
                        {order.items.map((item, idx) => (
                            <li key={idx}>
                              {item.name} x {item.quantity}
                            </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-3">{order.total}</td>
                    <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    </td>
                    <td className="p-3 space-x-2">
                      {order.status === 'confirmed' && (
                          <>
                            <Button
                                size="sm"
                                onClick={() => handleAcceptOrder(order.orderId, order.customerEmail || '')}
                                className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              Accept
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleDeclineOrder(order.orderId, order.customerEmail || '')}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              Decline
                            </Button>
                          </>
                      )}
                      {order.status === 'preparing' && (
                          <Button
                              size="sm"
                              onClick={() => handleMarkReady(order.orderId)}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            Mark as Ready
                          </Button>
                      )}
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>

            {orders.length === 0 && (
                <p className="text-center text-gray-500 mt-8">No orders found.</p>
            )}
          </div>
        </div>
      </div>
  );
};

export default RestaurantOrders;