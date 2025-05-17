
import { useState } from "react";
import { LoginForm } from "@/components/LoginForm";
import { SignupForm } from "@/components/SignupForm";
import { OrderForm } from "@/components/OrderForm";
import { OrderStatus } from "@/components/OrderStatus";
import { OrderHistory } from "@/components/OrderHistory";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext"; // Import useCart
import { Navigate, Link, useLocation } from "react-router-dom"; // Import useLocation
import { Button } from "@/components/ui/button";
import { History, ShoppingCart, X } from "lucide-react";

const Index = () => {
  const { user, logout } = useAuth();
  const { clearCart } = useCart(); // Get clearCart from useCart
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const location = useLocation(); // Get location to access state

  // Get cart items and restaurantId from navigation state, or use defaults
  const cartItems = location.state?.cartItems || [];
  const restaurantId = location.state?.restaurantId || null;

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

  
  const handleViewOrder = (id: string) => {
    setOrderId(id);
    setShowHistory(false);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // Handle order completion and clear cart
  const handleOrderComplete = (id: string) => {
    setOrderId(id);
    clearCart(); // Clear the cart after order is placed
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
                logout();
                window.location.href = "/";
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
              <Button variant="ghost" size="sm" onClick={toggleHistory}>
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
                items={cartItems} // Pass cart items
                restaurantId={restaurantId} // Pass restaurantId
                onOrderComplete={handleOrderComplete} // Updated handler
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

      <div className="fixed bottom-6 right-6">
        <Button
          onClick={toggleHistory}
          className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center ${
            showHistory
              ? "bg-gray-700 hover:bg-gray-800"
              : "bg-[#FF4B3E] hover:bg-[#FF6B5E]"
          } transition-colors`}
        >
          {showHistory ? (
            <X className="h-6 w-6" />
          ) : (
            <History className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default Index;

// import { useState, useEffect } from "react"; // Add useEffect
// import { LoginForm } from "@/components/LoginForm";
// import { SignupForm } from "@/components/SignupForm";
// import { OrderForm } from "@/components/OrderForm";
// import { OrderStatus } from "@/components/OrderStatus";
// import { useAuth } from "@/context/AuthContext";
// import { useCart } from "@/context/CartContext";
// import { Navigate, Link, useLocation, useNavigate } from "react-router-dom"; // Add useNavigate
// import { Button } from "@/components/ui/button";
// import { History } from "lucide-react";

// const Index = () => {
//   const { user, logout } = useAuth();
//   const { clearCart } = useCart();
//   const [orderId, setOrderId] = useState<string | null>(null);
//   const [isLogin, setIsLogin] = useState(true);
//   const location = useLocation();
//   const navigate = useNavigate(); // Add navigate

//   // Get cart items, restaurantId, and orderId from navigation state
//   const cartItems = location.state?.cartItems || [];
//   const restaurantId = location.state?.restaurantId || null;
//   const navigatedOrderId = location.state?.orderId || null;

//   // Set orderId from navigation state when component mounts or state changes
//   useEffect(() => {
//     if (navigatedOrderId) {
//       setOrderId(navigatedOrderId);
//     }
//   }, [navigatedOrderId]);

//   if (!user) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
//         <div className="w-full max-w-md">
//           <h2 className="text-2xl font-bold text-center mb-6">Welcome to Foodie Pal</h2>
//           {isLogin ? <LoginForm /> : <SignupForm />}
//           <div className="text-center mt-4">
//             <Button
//               variant="link"
//               onClick={() => setIsLogin(!isLogin)}
//               className="text-sm"
//             >
//               {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
//             </Button>
//           </div>
//           <div className="text-center mt-6">
//             <Link to="/">
//               <Button variant="outline">Back to Homepage</Button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (user.role !== "customer") {
//     return <Navigate to={`/${user.role}-dashboard`} replace />;
//   }

//   // Handle order completion and clear cart
//   const handleOrderComplete = (id: string) => {
//     setOrderId(id);
//     clearCart();
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="max-w-3xl mx-auto space-y-6">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold">Foodie Pal</h1>
//           <div className="flex items-center space-x-3">
//             <Link to="/">
//               <Button variant="ghost" size="sm">Home</Button>
//             </Link>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => {
//                 logout();
//                 window.location.href = "/";
//               }}
//             >
//               Sign Out
//             </Button>
//           </div>
//         </div>

//         {!orderId ? (
//           <OrderForm
//             items={cartItems}
//             restaurantId={restaurantId}
//             onOrderComplete={handleOrderComplete}
//           />
//         ) : (
//           <OrderStatus
//             orderId={orderId}
//             onPlaceNewOrder={() => {
//               setOrderId(null);
//               navigate("/", { state: {} }); // Clear navigation state
//             }}
//           />
//         )}
//       </div>

//       <div className="fixed bottom-6 right-6">
//         <Button
//           onClick={() => navigate("/history")} // Navigate to history page
//           className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center bg-[#FF4B3E] hover:bg-[#FF6B5E] transition-colors"
//         >
//           <History className="h-6 w-6" />
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default Index;