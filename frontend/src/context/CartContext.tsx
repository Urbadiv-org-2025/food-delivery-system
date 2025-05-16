import React, { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}


interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  restaurantId: string | null;
}


const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const addToCart = (item: CartItem) => {
    if (restaurantId && restaurantId !== item.restaurantId) {
      // Block adding if it's a different restaurant
      throw new Error("DIFFERENT_RESTAURANT");
    }

    if (!restaurantId) setRestaurantId(item.restaurantId);

    setCart((prev) => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const newCart = prev.filter(i => i.id !== id);
      if (newCart.length === 0) setRestaurantId(null);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setRestaurantId(null);
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart(prev => prev.map(i => (i.id === id ? { ...i, quantity } : i)));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, restaurantId }}>
      {children}
    </CartContext.Provider>
  );
};
