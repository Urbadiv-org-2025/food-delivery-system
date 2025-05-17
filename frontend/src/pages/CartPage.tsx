import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import ExploreHeader from "@/components/ExploreHeader";
import { Trash2 } from "lucide-react";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <ExploreHeader />

      <div className="min-h-screen bg-gray-50 p-6">
        <main className="max-w-5xl mx-auto px-6 pt-24 pb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>

          {cart.length > 0 && (
            <h2 className="text-xl font-semibold text-gray-600 mb-6">
              {cart[0].restaurantName}
            </h2>
          )}

          {cart.length === 0 ? (
            <div className="text-center text-gray-500 text-lg mt-10">
              Your cart is empty. Add some items to begin your order.
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={`http://localhost:3000${item.image}`}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">{item.price} LKR</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.id, parseInt(e.target.value))
                      }
                      className="border rounded-md px-3 py-1 w-20 text-center text-sm shadow-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-gray-300 hover:border-red-500 text-gray-500 hover:text-red-600"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xl font-semibold text-gray-800">
                Total: <span className="text-[#FF4B3E]">{total} LKR</span>
              </p>
              <Button className="bg-[#FF4B3E] hover:bg-[#e34033] text-white px-6 py-2 text-lg">
                Checkout
              </Button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default CartPage;
