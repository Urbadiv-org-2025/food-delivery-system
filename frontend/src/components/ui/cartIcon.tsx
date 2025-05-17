import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export const CartIcon = () => {
  const { cart } = useCart();

  return (
    <div className="relative">
      <ShoppingCart className="w-6 h-6 text-gray-700" />
      {cart.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {cart.reduce((total, item) => total + item.quantity, 0)}
        </span>
      )}
    </div>
  );
};
