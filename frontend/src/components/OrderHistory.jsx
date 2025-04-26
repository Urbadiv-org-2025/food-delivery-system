
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, Calendar } from 'lucide-react';
import axios from 'axios';

export const OrderHistory = ({ onViewOrder }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrderHistory = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/orders/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load order history",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  if (isLoading) {
    return <div className="text-center p-4">Loading order history...</div>;
  }

  if (orders.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Order History</h2>
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      </Card>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Order History</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Order #{order.id.slice(-6)}</div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-white text-xs ${
                {
                  pending: 'bg-yellow-500',
                  confirmed: 'bg-blue-500',
                  preparing: 'bg-purple-500',
                  ready: 'bg-orange-500',
                  delivered: 'bg-green-500',
                  canceled: 'bg-red-500',
                }[order.status]
              }`}>
                {order.status.toUpperCase()}
              </div>
            </div>
            <div className="mt-2 text-sm">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                <span>Delivered to: {order.location.address || "Location coordinates"}</span>
              </div>
              <div className="mt-1 flex items-start">
                <Clock className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                <span>Items: {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="font-medium">Total: ${order.total.toFixed(2)}</div>
              <Button size="sm" onClick={() => onViewOrder(order.id)}>
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};
