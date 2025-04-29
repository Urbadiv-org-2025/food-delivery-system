import { Check, Navigation } from "lucide-react";
import DeliveryStatusBadge from "./DeliveryStatusBadge";

interface DeliveryInfoProps {
  delivery: {
    id: string;
    orderId: string;
    status: string;
    customerName?: string;
    customerAddress?: string;
    items?: string[];
  };
}

const DeliveryInfoCard = ({ delivery }: DeliveryInfoProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-800">Order #{delivery.orderId}</h3>
          <DeliveryStatusBadge status={delivery.status} />
        </div>
        <div className="mt-2 md:mt-0 text-sm text-gray-500">
          Delivery #{delivery.id}
        </div>
      </div>
      
      {delivery.customerName && (
        <div className="pt-2">
          <div className="text-sm text-gray-500">Customer</div>
          <div className="font-medium text-gray-800">{delivery.customerName}</div>
        </div>
      )}
      
      {delivery.customerAddress && (
        <div className="pt-2">
          <div className="text-sm text-gray-500">Delivery Address</div>
          <div className="font-medium text-gray-800 flex items-start">
            <Navigation className="h-4 w-4 mr-1 mt-1 flex-shrink-0 text-gray-400" />
            <span>{delivery.customerAddress}</span>
          </div>
        </div>
      )}
      
      {delivery.items && delivery.items.length > 0 && (
        <div className="pt-2">
          <div className="text-sm text-gray-500">Items</div>
          <ul className="space-y-1 mt-1">
            {delivery.items.map((item, index) => (
              <li key={index} className="flex items-start text-gray-700">
                <Check className="h-4 w-4 mr-2 mt-1 text-green-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DeliveryInfoCard;
