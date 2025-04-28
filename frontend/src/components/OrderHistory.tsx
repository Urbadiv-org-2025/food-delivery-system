
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import axios from 'axios';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Location {
  address?: string;
  coordinates: [number, number];
}

interface Order {
  id: string;
  status: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  location: Location;
  canceledBy?: string;
}

interface OrderHistoryProps {
  onViewOrder: (orderId: string) => void;
}

export const OrderHistory = ({ onViewOrder }: OrderHistoryProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
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

  const cancelOrder = async () => {
    if (!selectedOrderId) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/orders/${selectedOrderId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      toast({
        title: "Order Canceled",
        description: "Your order has been canceled"
      });
      
      fetchOrderHistory();
      setCancelDialog(false);
    } catch (error) {
      console.error('Error canceling order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel order"
      });
    }
  };

  const handleCancelOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCancelDialog(true);
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4B3E]"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Order History</h2>
        <div className="py-12">
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[#FF4B3E] hover:bg-[#FF6B5E]"
          >
            Start Ordering
          </Button>
        </div>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const canCancelOrder = (status: string) => ['pending', 'confirmed'].includes(status);

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
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
                  }[order.status] || 'bg-gray-500'
                }`}>
                  {order.status.toUpperCase()}
                </div>
              </div>
              
              {order.status === 'canceled' && order.canceledBy === 'restaurant' && (
                <div className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>Canceled by restaurant</span>
                </div>
              )}
              
              <div className="mt-2 text-sm">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                  <span>Delivered to: {order.location?.address || "Location coordinates"}</span>
                </div>
                <div className="mt-1 flex items-start">
                  <Clock className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                  <span>Items: {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <div className="font-medium">Total: ${order.total.toFixed(2)}</div>
                <div className="space-x-2">
                  {canCancelOrder(order.status) && (
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button 
                    size="sm"
                    className="bg-[#FF4B3E] hover:bg-[#FF6B5E]" 
                    onClick={() => onViewOrder(order.id)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? If payment was made, you will receive a refund.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>No, Keep Order</Button>
            <Button variant="destructive" onClick={cancelOrder}>Yes, Cancel Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
