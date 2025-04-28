
import { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { SignupForm } from '@/components/SignupForm';
import { OrderForm } from '@/components/OrderForm';
import { OrderStatus } from '@/components/OrderStatus';
import { OrderHistory } from '@/components/OrderHistory';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { History, ShoppingCart, X } from 'lucide-react';

// Mock data - replace with actual restaurant menu data
const mockItems = [
  { name: "Margherita Pizza", price: 12.99, quantity: 2 },
  { name: "Garlic Bread", price: 4.99, quantity: 1 }
];

const Index = () => {
  const { user } = useAuth();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Welcome to Foodie Pal</h2>
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
          <div className="text-center mt-6">
            <Link to="/">
              <Button variant="outline">Back to Homepage</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If user is not a customer, redirect them to their appropriate dashboard
  if (user.role !== 'customer') {
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }

  const handleViewOrder = (id: string) => {
    setOrderId(id);
    setShowHistory(false);
  };
  
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Foodie Pal</h1>
          <div className="flex items-center space-x-3">
            <Link to="/">
              <Button variant="ghost" size="sm">Home</Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/';
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
        
        {showHistory ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Order History</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleHistory}
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
            <OrderHistory onViewOrder={handleViewOrder} />
          </>
        ) : (
          <>
            {!orderId ? (
              <OrderForm 
                items={mockItems}
                restaurantId="restaurant_123"
                onOrderComplete={(id) => setOrderId(id)}
              />
            ) : (
              <OrderStatus 
                orderId={orderId} 
                onPlaceNewOrder={() => setOrderId(null)}
              />
            )}
          </>
        )}
      </div>
      
      {/* Floating Action Button for Order History */}
      <div className="fixed bottom-6 right-6">
        <Button 
          onClick={toggleHistory}
          className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center ${
            showHistory 
              ? 'bg-gray-700 hover:bg-gray-800' 
              : 'bg-[#FF4B3E] hover:bg-[#FF6B5E]'
          } transition-colors`}
        >
          {showHistory 
            ? <X className="h-6 w-6" />
            : <History className="h-6 w-6" />
          }
        </Button>
      </div>
    </div>
  );
};

export default Index;
