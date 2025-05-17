import { Link, NavLink } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const ExploreHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const { logout } = useAuth();
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="text-xl font-bold text-[#FF4B3E]">Foodie Pal</div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <NavLink to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-[#FF4B3E]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs px-1 rounded-full">
                  {totalItems}
                </span>
              )}
            </NavLink>

            <Button
              variant="outline"
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
            >
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 hover:text-[#FF4B3E]"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-5py-3 bg-white shadow-lg space-y-2">
          <NavLink
            to="/cart"
            className="flex items-center gap-2 text-gray-700 hover:text-[#FF4B3E]"
          >
            <ShoppingCart className="w-5 h-5" />
            Cart ({totalItems})
          </NavLink>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
          >
            Sign Out
          </Button>
        </div>
      )}
    </nav>
  );
};

export default ExploreHeader;
