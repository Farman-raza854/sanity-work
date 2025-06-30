"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Truck } from "lucide-react";
import { useCart } from "@/components/cart-components/CartContext";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("session_id");
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();
        
        if (data.success) {
          setPaymentVerified(true);
          // Clear the cart after successful payment
          clearCart();
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-400 to-pink-500">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Verification Failed</h1>
            <p className="text-gray-600 mb-8">
              We couldn't verify your payment. Please contact support if you believe this is an error.
            </p>
            <Link
              href="/cart"
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition duration-300"
            >
              Return to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your payment has been processed successfully and your order is being prepared.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Package className="w-4 h-4" />
              <span>Order confirmation sent to your email</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Truck className="w-4 h-4" />
              <span>Shipping details will be provided soon</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/generate-tracking"
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            >
              Generate Tracking Number
            </Link>
            
            <Link
              href="/productList"
              className="block w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}