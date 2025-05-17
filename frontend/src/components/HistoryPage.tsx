import { useNavigate } from "react-router-dom";
import  ExploreHeader from "@/components/ExploreHeader";
import { OrderHistory } from "@/components/OrderHistory";

const HistoryPage = () => {
  const navigate = useNavigate();

  const handleViewOrder = (orderId: string) => {
    // Navigate to Index page with orderId to view order details
    navigate("/app", { state: { orderId } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ExploreHeader />
      <div className="pt-20">
        <OrderHistory onViewOrder={handleViewOrder} />
      </div>
    </div>
  );
};

export default HistoryPage;