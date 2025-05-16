import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, Calendar, AlertCircle, CheckCircle2, ChefHat, Package, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Toggle } from '@/components/ui/toggle';
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
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [addressCache, setAddressCache] = useState<{ [key: string]: string }>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { value: 'preparing', label: 'Preparing', icon: ChefHat },
    { value: 'ready', label: 'Ready', icon: Package },
    { value: 'delivered', label: 'Delivered', icon: CheckCircle2 },
    { value: 'canceled', label: 'Canceled', icon: XCircle }
  ];

  // Fetch order history
  const fetchOrderHistory = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const params: { customerId?: string; status?: string } = {};
      if (user?.id) params.customerId = user.id;
      if (selectedStatus) params.status = selectedStatus;

      const response = await axios.get('http://localhost:3000/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params
      });

      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load order history'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reverse geocode coordinates to address
  const getAddress = async (latitude: number, longitude: number): Promise<string | undefined> => {
    const cacheKey = `${latitude},${longitude}`;
    if (addressCache[cacheKey]) {
      return addressCache[cacheKey];
    }

    try {
      const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`
      );
      const data = await response.json();
      const address = data.display_name || undefined;
      if (address) {
        setAddressCache((prev) => ({ ...prev, [cacheKey]: address }));
      }
      return address;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return undefined;
    }
  };

  // Fetch addresses for all orders
  useEffect(() => {
    const fetchAddresses = async () => {
      for (const order of orders) {
        const [longitude, latitude] = order.location.coordinates;
        if (!addressCache[`${latitude},${longitude}`]) {
          const address = await getAddress(latitude, longitude);
          if (address) {
            setAddressCache((prev) => ({
              ...prev,
              [`${latitude},${longitude}`]: address
            }));
          }
          // Respect Nominatim rate limit (1 request/second)
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    };

    if (orders.length > 0) {
      fetchAddresses();
    }
  }, [orders]);

  // Fetch orders on mount and status change
  useEffect(() => {
    fetchOrderHistory();
  }, [selectedStatus]);

  const cancelOrder = async () => {
    if (!selectedOrderId) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/orders/${selectedOrderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { email: user?.email }
      });

      toast({
        title: 'Order Canceled',
        description: 'Your order has been canceled'
      });

      fetchOrderHistory();
      setCancelDialog(false);
    } catch (error) {
      console.error('Error canceling order:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to cancel order'
      });
    }
  };

  const handleCancelOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCancelDialog(true);
  };

  const selectStatus = (status: string) => {
    setSelectedStatus(status === selectedStatus ? null : status);
  };

  const clearFilters = () => {
    setSelectedStatus(null);
  };

  const formatDate = (id: string) => {
    const timestamp = parseInt(id);
    if (isNaN(timestamp)) return 'Invalid Date';
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusCounts = () => {
    const counts: { [key: string]: number } = {};
    statusOptions.forEach(opt => {
      counts[opt.value] = orders.filter(order => order.status === opt.value).length;
    });
    return counts;
  };

  const canCancelOrder = (status: string) => ['pending', 'confirmed'].includes(status);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FF4B3E]"></div>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Card className="p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Order History</h2>
            <Button
                variant="outline"
                onClick={clearFilters}
                className="border-[#FF4B3E] text-[#FF4B3E] hover:bg-[#FF4B3E] hover:text-white w-full sm:w-auto"
            >
              Clear Filter
            </Button>
          </div>

          {/* Status Toggle Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4 sm:mb-6">
            {statusOptions.map(({ value, label, icon: Icon }) => (
                <Toggle
                    key={value}
                    pressed={selectedStatus === value}
                    onPressedChange={() => selectStatus(value)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors text-sm sm:text-base ${
                        selectedStatus === value
                            ? 'bg-[#FF4B3E] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label} ({getStatusCounts()[value]})</span>
                </Toggle>
            ))}
          </div>

          {orders.length === 0 ? (
              <div className="py-8 sm:py-12 text-center">
                <p className="text-gray-500 mb-4 text-sm sm:text-base">
                  {selectedStatus ? `No ${selectedStatus} orders found.` : "You haven't placed any orders yet."}
                </p>
                <Button
                    onClick={() => window.location.reload()}
                    className="bg-[#FF4B3E] hover:bg-[#FF6B5E] w-full sm:w-auto"
                >
                  Start Ordering
                </Button>
              </div>
          ) : (
              <div className="space-y-3 sm:space-y-4">
                {orders.map((order) => (
                    <Card
                        key={order.id}
                        className="p-3 sm:p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-base sm:text-lg text-gray-800">
                            Order #{order.id.slice(-6)}
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span>{formatDate(order.id)}</span>
                          </div>
                        </div>
                        <div
                            className={`px-2 sm:px-3 py-1 rounded-full text-white text-xs font-medium ${
                                {
                                  pending: 'bg-yellow-500',
                                  confirmed: 'bg-blue-500',
                                  preparing: 'bg-purple-500',
                                  ready: 'bg-orange-500',
                                  delivered: 'bg-green-500',
                                  canceled: 'bg-red-500'
                                }[order.status] || 'bg-gray-500'
                            }`}
                        >
                          {order.status.toUpperCase()}
                        </div>
                      </div>

                      {order.status === 'canceled' && order.canceledBy === 'restaurant' && (
                          <div className="mt-2 text-xs sm:text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span>Canceled by restaurant</span>
                          </div>
                      )}

                      <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-start">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 mt-1 flex-shrink-0 text-[#FF4B3E]" />
                          <span>
                      Delivered to:{' '}
                            {addressCache[`${order.location.coordinates[1]},${order.location.coordinates[0]}`] ||
                                order.location.coordinates.join(', ')}
                    </span>
                        </div>
                        <div className="mt-1 flex items-start">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 mt-1 flex-shrink-0 text-[#FF4B3E]" />
                          <span>Items: {order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 sm:mt-4 gap-2">
                        <div className="font-semibold text-gray-800 text-sm sm:text-base">
                          Total: Rs.{order.total.toFixed(2)}
                        </div>
                        <div className="flex space-x-2 w-full sm:w-auto">
                          {canCancelOrder(order.status) && (
                              <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="hover:bg-red-600 w-full sm:w-auto"
                              >
                                Cancel
                              </Button>
                          )}
                          <Button
                              size="sm"
                              className="bg-[#FF4B3E] hover:bg-[#FF6B5E] w-full sm:w-auto"
                              onClick={() => onViewOrder(order.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                ))}
              </div>
          )}
        </Card>

        <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
          <DialogContent className="p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Cancel Order</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Are you sure you want to cancel this order? If payment was made, you will receive a refund.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                  variant="outline"
                  onClick={() => setCancelDialog(false)}
                  className="w-full sm:w-auto"
              >
                No, Keep Order
              </Button>
              <Button
                  variant="destructive"
                  onClick={cancelOrder}
                  className="w-full sm:w-auto"
              >
                Yes, Cancel Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

