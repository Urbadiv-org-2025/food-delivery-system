import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, AlertCircle, CheckCircle2, ChefHat, Package, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Lottie from 'lottie-react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { useNavigate, useLocation } from 'react-router-dom'; // Add useNavigate and useLocation
import pendingAnimation from '@/animations/pending.json';
import confirmedAnimation from '@/animations/confirmed.json';
import preparingAnimation from '@/animations/preparing.json';
import readyAnimation from '@/animations/ready.json';
import deliveredAnimation from '@/animations/delivered.json';
import canceledAnimation from '@/animations/canceled.json';
import { PaymentForm } from '@/components/PaymentForm.tsx';

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
  const [address, setAddress] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Hook to get current path
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for timeout

  // Reverse geocode coordinates to address
  const getAddress = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`
      );
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

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
        if (response.data.status === 'pending' && !response.data.paymentId) {
          setShowPayment(true);
        } else {
          setShowPayment(false);
        }
        const [longitude, latitude] = response.data.location.coordinates;
        const addr = await getAddress(latitude, longitude);
        setAddress(addr || response.data.location.coordinates.join(', '));
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch order details',
      });
    }
  };

  const cancelOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { email: user?.email },
      });

      toast({
        title: 'Order Canceled',
        description: 'Your order has been canceled',
      });

      fetchOrder();
      setCancelDialog(false);
    } catch (error) {
      console.error('Error canceling order:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to cancel order',
      });
    }
  };

  useEffect(() => {
    fetchOrder();

    const socket = io('http://localhost:3003', {
      transports: ['websocket'],
      upgrade: false,
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
      socket.emit('joinOrderRoom', orderId);
      console.log(`Emitted joinOrderRoom for order:${orderId}`);
    });

    socket.on('orderUpdate', (data) => {
      console.log('Received orderUpdate:', data);
      if (data.orderId === orderId) {
        fetchOrder();
        toast({
          title: 'Order Status Updated',
          description: data.message,
        });

        // Handle navigation based on status
        if (data.status === 'ready') {
          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          // Navigate to tracking page after 5 seconds
          timeoutRef.current = setTimeout(() => {
            navigate(`/customer-tracking/${orderId}`, {
              state: { returnPath: location.pathname }, // Store return path
            });
          }, 5000);
        } else {
          // If status changes from 'ready' to another state, navigate back
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current); // Cancel any pending navigation
          }
          if (location.pathname.includes('/customer-tracking')) {
            const returnPath = location.state?.returnPath || '/app';
            navigate(returnPath);
          }
        }
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: 'Failed to connect to real-time updates. Using polling.',
      });
      fetchOrder();
      const interval = setInterval(fetchOrder, 10000);
      return () => clearInterval(interval);
    });

    socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });

    return () => {
      socket.disconnect();
      console.log('Socket.IO disconnected');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [orderId, toast, user?.email, navigate, location.pathname, location.state]);

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
      pending: 0,
      confirmed: 25,
      preparing: 50,
      ready: 75,
      delivered: 100,
      canceled: 0,
    };
    return statusToProgress[order.status] || 0;
  };

  const getStatusAnimation = () => {
    const animations = {
      pending: pendingAnimation,
      confirmed: confirmedAnimation,
      preparing: preparingAnimation,
      ready: readyAnimation,
      delivered: deliveredAnimation,
      canceled: canceledAnimation,
    };
    return (
      <Lottie
        animationData={animations[order.status] || pendingAnimation}
        loop={true}
        className="h-28 w-28 sm:h-32 sm:w-32 mx-auto"
      />
    );
  };

  const statusMessages = {
    pending: 'Waiting for confirmation...',
    confirmed: 'Your order has been confirmed!',
    preparing: 'Your food is being prepared...',
    ready: 'Your food is ready for pickup!',
    delivered: 'Your food has been delivered!',
    canceled: 'Your order has been canceled.',
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
              <p className="text-red-700">This order has been canceled.</p>
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

        <div className="flex items-center justify-center py-6 w-full">
          <div className="text-center">
            {getStatusAnimation()}
            <p className="mt-2 font-medium text-sm sm:text-base">
              {statusMessages[order.status]}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>{item.name} x {item.quantity}</span>
              <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>Rs. {order.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="mr-2 h-4 w-4" />
            <span>Delivery Location: {address || order.location.coordinates.join(', ')}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between pt-4 gap-2">
          <Button
            variant="outline"
            onClick={onPlaceNewOrder}
            className="w-full sm:w-auto"
          >
            Place New Order
          </Button>
          {canCancel && (
            <Button
              variant="destructive"
              onClick={() => setCancelDialog(true)}
              className="w-full sm:w-auto"
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