import { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { SignupForm } from '@/components/SignupForm';
import { OrderForm } from '@/components/OrderForm';
import { OrderStatus } from '@/components/OrderStatus';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Mock data - replace with actual restaurant menu data
const mockItems = [
  { name: "Margherita Pizza", price: 12.99, quantity: 2 },
  { name: "Garlic Bread", price: 4.99, quantity: 1 }
];

const Index = () => {
  const { user } = useAuth();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          {isLogin ? <LoginForm /> : <SignupForm />}
          <div className="text-center mt-4">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If user is not a customer, redirect them to their appropriate dashboard
  if (user.role !== 'customer') {
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">Food Delivery</h1>
        {!orderId ? (
          <OrderForm 
            items={mockItems}
            restaurantId="restaurant_456"
            onOrderComplete={(id) => setOrderId(id)}
          />
        ) : (
          <OrderStatus orderId={orderId} />
        )}
      </div>
    </div>
  );
};

export default Index;
