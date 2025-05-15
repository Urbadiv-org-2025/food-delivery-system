import React, { useState } from 'react';
import RestaurantAdminNavigation from "@/components/RestaurantAdminNavigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'canceled';

type Order = {
  id: string;
  customerId: string;
  items: { name: string; price: number; quantity: number }[];
  status: OrderStatus;
  total: number;
};

const dummyOrders = [
    {
      id: "ORD001",
      customerId: "CUS001",
      restaurantId: "RES001",
      items: [
        
        { name: "Noodles", price: 800, quantity: 1 },
      ],
      total: 800,
      status: "pending",
    },
    {
      id: "ORD002",
      customerId: "CUS002",
      restaurantId: "RES001",
      items: [{ name: "Fried-Rice", price: 1000, quantity: 1 }],
      total: 1000,
      status: "confirmed",
    },
    {
      id: "ORD003",
      customerId: "CUS003",
      restaurantId: "RES001",
      items: [
        { name: "Noodles", price: 800, quantity: 2 },
        { name: "Fried-Rice", price: 1000, quantity: 1 },
      ],
      total: 2600,
      status: "preparing",
    },
    {
      id: "ORD004",
      customerId: "CUS004",
      restaurantId: "RES001",
      items: [
        { name: "Kottu", price: 1000, quantity: 1 },
        { name: "Fried-Rice", price: 1000, quantity: 1 },
      ],
      total: 2000,
      status: "ready",
    },
    {
      id: "ORD005",
      customerId: "CUS005",
      restaurantId: "RES001",
      items: [{ name: "Noodles", price: 800, quantity: 3 }],
      total: 2400,
      status: "delivered",
    },
    {
      id: "ORD006",
      customerId: "CUS006",
      restaurantId: "RES001",
      items: [
        { name: "Kottu", price: 1000, quantity: 1 },
        { name: "Noodles", price: 800, quantity: 2 },
      ],
      total: 2600,
      status: "delivered",
    },
    {
      id: "ORD007",
      customerId: "CUS007",
      restaurantId: "RES001",
      items: [
        { name: "Fried-Rice", price: 1000, quantity: 2 },
        { name: "Noodles", price: 800, quantity: 1 },
      ],
      total: 2800,
      status: "delivered",
    },
    {
      id: "ORD008",
      customerId: "CUS008",
      restaurantId: "RES001",
      items: [{ name: "Kottu", price: 1000, quantity: 2 }],
      total: 2000,
      status: "canceled",
    },
    {
      id: "ORD009",
      customerId: "CUS009",
      restaurantId: "RES001",
      items: [
        { name: "Noodles", price: 800, quantity: 1 },
        { name: "Kottu", price: 1000, quantity: 1 },
      ],
      total: 1800,
      status: "canceled",
    },
    {
      id: "ORD010",
      customerId: "CUS010",
      restaurantId: "RES001",
      items: [
        { name: "Fried-Rice", price: 1000, quantity: 1 },
        { name: "Kottu", price: 1000, quantity: 1 },
      ],
      total: 2000,
      status: "delivered",
    },
  ];
  

const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  delivered: null,
  canceled: null,
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
  const [orders, setOrders] = useState(dummyOrders);

  const updateStatus = (id: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
    toast({
      title: `Order ${newStatus}`,
      description: `Order ${id} marked as ${newStatus.toUpperCase()}`,
    });
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
              {orders.map((order) => {
                const nextStatus = nextStatusMap[order.status];
                return (
                  <tr key={order.id} className="border-t text-sm">
                    <td className="p-3 font-medium">{order.id}</td>
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
                      {nextStatus && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(order.id, nextStatus)}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Mark as {nextStatus}
                        </Button>
                      )}
                      {order.status !== "delivered" && order.status !== "canceled" && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(order.id, "canceled")}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
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
