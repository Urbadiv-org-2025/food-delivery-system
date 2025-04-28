
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';
import { MapSelector } from './MapSelector';
import axios from 'axios';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderFormProps {
  items: OrderItem[];
  restaurantId: string;
  onOrderComplete: (orderId: string) => void;
}

export const OrderForm = ({ items, restaurantId, onOrderComplete }: OrderFormProps) => {
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLocationSelect = (selectedLocation: { latitude: number, longitude: number }) => {
    setLocation(selectedLocation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.latitude || !location.longitude) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please set your delivery location"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/orders', {
        restaurantId,
        items,
        email: user?.email,
        latitude: location.latitude,
        longitude: location.longitude,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Success",
        description: "Order created successfully"
      });
      onOrderComplete(response.data.orderId);
    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create order"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Your Order</h2>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span>{item.name} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <MapSelector onLocationSelect={handleLocationSelect} />

      <Button 
        onClick={handleSubmit}
        className="w-full bg-[#FF4B3E] hover:bg-[#FF6B5E]"
        disabled={isSubmitting}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {isSubmitting ? 'Creating Order...' : 'Place Order'}
      </Button>
    </Card>
  );
};
