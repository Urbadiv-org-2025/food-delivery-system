
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, AlertCircle, CheckCircle2, ChefHat, Package, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PaymentForm } from './PaymentForm';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface OrderStatusProps {
  orderId: string;
  onPlaceNewOrder: () => void;
}

interface Order {
  id: string;
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
  paymentId?: string;
}

export const OrderStatus = ({ orderId, onPlaceNewOrder }: OrderStatusProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const socketRef = useRef<Socket | null>(null);
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
        
        // Show payment form if order is pending
        if (response.data.status === 'pending' && !response.data.paymentId) {
          setShowPayment(true);
        } else {
          setShowPayment(false);
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  const cancelOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/api/orders/${orderId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      toast({
        title: "Order Canceled",
        description: "Your order has been canceled"
      });
      
      fetchOrder();
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

  useEffect(() => {
    fetchOrder();
    
    // Setup WebSocket connection
    const socket = io('http://localhost:3003', {
      transports: ['websocket'],
      upgrade: false,
    });
    
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('Socket.io connected');
      socket.emit('join', `order:${orderId}`);
    });
    
    socket.on('orderUpdate', (data) => {
      console.log('Order update received:', data);
      if (data.orderId === orderId) {
        // Update order status in real-time
        fetchOrder();
        
        // Show toast notification
        toast({
          title: "Order Status Updated",
          description: data.message
        });
      }
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      // Fallback to polling
      fetchOrder();
      const interval = setInterval(fetchOrder, 10000);
      return () => clearInterval(interval);
    });
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [orderId]);

  if (!order) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF4B3E]"></div>
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(order.status);
  
  const getProgressValue = () => {
    const statusToProgress = {
      'pending': 0,
      'confirmed': 25,
      'preparing': 50,
      'ready': 75,
      'delivered': 100,
      'canceled': 0
    };
    return statusToProgress[order.status] || 0;
  };

  const getStatusIcon = () => {
    switch(order.status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle2 className="h-6 w-6 text-blue-500" />;
      case 'preparing':
        return <ChefHat className="h-6 w-6 text-purple-500 animate-pulse" />;
      case 'ready':
        return <Package className="h-6 w-6 text-orange-500" />;
      case 'delivered':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'canceled':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const statusColors = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-blue-500',
    preparing: 'bg-purple-500',
    ready: 'bg-orange-500',
    delivered: 'bg-green-500',
    canceled: 'bg-red-500',
  };

  return (
    <>
      <Card className="p-6 space-y-4">
        {order.status === 'canceled' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">
                This order has been canceled.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Order Status</h2>
          <span className={`px-3 py-1 rounded-full text-white text-sm ${statusColors[order.status]}`}>
            {order.status.toUpperCase()}
          </span>
        </div>

        {order.status !== 'canceled' && (
          <div className="space-y-2">
            <Progress value={getProgressValue()} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Placed</span>
              <span>Confirmed</span>
              <span>Preparing</span>
              <span>Ready</span>
              <span>Delivered</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center py-4">
          <div className="text-center">
            {getStatusIcon()}
            <p className="mt-2 font-medium">
              {order.status === 'preparing' && "Your food is being prepared..."}
              {order.status === 'ready' && "Your food is ready for pickup!"}
              {order.status === 'delivered' && "Your food has been delivered!"}
              {order.status === 'confirmed' && "Your order has been confirmed!"}
              {order.status === 'pending' && "Waiting for confirmation..."}
              {order.status === 'canceled' && "Your order has been canceled."}
            </p>
          </div>
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

        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={onPlaceNewOrder}
          >
            Place New Order
          </Button>
          {canCancel && (
            <Button 
              variant="destructive" 
              onClick={() => setCancelDialog(true)}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </Card>

      {showPayment && (
        <div className="mt-4">
          <PaymentForm order={order} onPaymentComplete={fetchOrder} />
        </div>
      )}

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
