import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MapPin } from 'lucide-react';
import axios from 'axios';

interface OrderStatusProps {
  orderId: string;
}

interface Order {
  status: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  location: {
    coordinates: [number, number];
  };
}

export const OrderStatus = ({ orderId }: OrderStatusProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  if (!order) {
    return <div>Loading...</div>;
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-blue-500',
    preparing: 'bg-purple-500',
    ready: 'bg-orange-500',
    delivered: 'bg-green-500',
    canceled: 'bg-red-500',
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Order Status</h2>
        <span className={`px-3 py-1 rounded-full text-white text-sm ${statusColors[order.status]}`}>
          {order.status.toUpperCase()}
        </span>
      </div>
      <div className="space-y-4">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span>{item.name} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t pt-2">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="mr-2 h-4 w-4" />
          <span>Delivery Location: {order.location.coordinates.join(', ')}</span>
        </div>
      </div>
    </Card>
  );
};
