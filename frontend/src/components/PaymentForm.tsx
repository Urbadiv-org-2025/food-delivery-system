import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51Qe7HeA97EM7XCbcUIwrluRAjLN0fcIo74r7nIyv2b8hu6cN6AS6gOrE2P5OL5ZERvw4mrSQRgnfsI5xTXDdmxnC00wTQJE4bu');

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderProps {
  id: string;
  total: number;
  restaurantId: string;
  items: OrderItem[];
}

interface PaymentFormProps {
  order: OrderProps;
  onPaymentComplete: () => void;
}

const CheckoutForm = ({ order, onPaymentComplete }: PaymentFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setPaymentError('Stripe.js not loaded');
      return;
    }

    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');

      // Create payment intent
      const paymentResponse = await axios.post(
          'http://localhost:3000/api/payments',
          {
            amount: Math.round(order.total * 100), // Convert to cents
            currency: 'usd',
            orderId: order.id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setPaymentError('Card element not found');
        setIsProcessing(false);
        return;
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
          paymentResponse.data.clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                email: user?.email,
              },
            },
          }
      );

      if (error) {
        setPaymentError(error.message || 'Payment failed');
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: error.message || 'An error occurred during payment',
        });
        setIsProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm order
        await confirmOrder(paymentResponse.data.paymentId);
      } else {
        setPaymentError('Payment not completed');
        toast({
          variant: 'destructive',
          title: 'Payment Incomplete',
          description: 'Payment was not fully processed',
        });
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(error.response?.data?.error || 'An unexpected error occurred');
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: error.response?.data?.error || 'Unable to process payment',
      });
      setIsProcessing(false);
    }
  };

  const confirmOrder = async (paymentId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
          `http://localhost:3000/api/orders/${order.id}/confirm`,
          {
            paymentId,
            restaurantId: order.restaurantId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      toast({
        title: 'Payment Complete',
        description: 'Your order has been confirmed',
      });

      onPaymentComplete();
    } catch (error: any) {
      console.error('Order confirmation error:', error);
      setPaymentError('Payment was processed but order confirmation failed');
      toast({
        variant: 'destructive',
        title: 'Confirmation Error',
        description: 'Payment was processed but order confirmation failed',
      });
      throw error; // Allow caller to handle partial failure
    } finally {
      setIsProcessing(false);
    }
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border p-4 rounded-md space-y-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium">Total Amount:</span>
            <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
          </div>

          <div className="p-4 rounded-md bg-gray-50">
            <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
            />
          </div>

          {paymentError && (
              <div className="text-red-500 text-sm">{paymentError}</div>
          )}

          {/* <div className="text-sm text-gray-500">
            <p className="mb-2">Test with Stripe test cards:</p>
            <ul className="list-disc pl-4">
              <li>Success: 4242 4242 4242 4242</li>
              <li>Requires Auth: 4000 0025 0000 3155</li>
              <li>Decline: 4000 0000 0000 9995</li>
            </ul>
            <p className="mt-2">Use any future date, any 3 digits for CVC, and any postal code.</p>
          </div> */}

          <Button
              type="submit"
              disabled={isProcessing || !stripe}
              className="w-full bg-[#5469d4] hover:bg-[#4257b5]"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Pay Now'}
          </Button>
        </div>
      </form>
  );
};

export const PaymentForm = ({ order, onPaymentComplete }: PaymentFormProps) => {
  return (
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Payment Details</h2>
          <div className="flex items-center text-green-600">
            <ShieldCheck className="h-5 w-5 mr-1" />
            <span className="text-sm">Secure Payment</span>
          </div>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm order={order} onPaymentComplete={onPaymentComplete} />
        </Elements>
      </Card>
  );
};