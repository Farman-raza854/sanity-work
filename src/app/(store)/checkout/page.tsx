"use client";

import React, { useState } from "react";
import { useCart } from "@/components/cart-components/CartContext";
import Header from "@/components/productList-components/header";
import Footer from "@/components/team-components/footer";
import { ClerkProvider } from "@clerk/nextjs";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CustomerInfo {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: "",
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    // Validate required fields
    const requiredFields = ['email', 'name', 'phone', 'address', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !customerInfo[field as keyof CustomerInfo]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems,
          customerInfo,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to process checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <Header />
        </ClerkProvider>
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#252B42] mb-4">Your cart is empty</h1>
            <p className="text-[#737373] mb-8">Add some items to your cart to proceed with checkout.</p>
            <a
              href="/productList"
              className="bg-[#23A6F0] text-white px-6 py-3 rounded-lg hover:bg-blue-400 transition-all"
            >
              Continue Shopping
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
        <Header />
      </ClerkProvider>
      
      <div className="min-h-screen bg-[#FAFAFA] py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold text-[#252B42] mb-8 text-center">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Information Form */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-[#252B42] mb-6">Shipping Information</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#252B42] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#23A6F0]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#252B42] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#23A6F0]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#252B42] mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#23A6F0]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#252B42] mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#23A6F0]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#252B42] mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={customerInfo.city}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#23A6F0]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#252B42] mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={customerInfo.state}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#23A6F0]"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#252B42] mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={customerInfo.zipCode}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#23A6F0]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#252B42] mb-2">
                    Country *
                  </label>
                  <select
                    name="country"
                    value={customerInfo.country}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#23A6F0]"
                    required
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="IT">Italy</option>
                    <option value="ES">Spain</option>
                    <option value="NL">Netherlands</option>
                    <option value="BE">Belgium</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-[#252B42] mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                    <div className="w-16 h-16 relative">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[#252B42]">{item.name}</h3>
                      <p className="text-sm text-[#737373]">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#252B42]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#737373]">Subtotal</span>
                  <span className="text-[#252B42]">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737373]">Shipping</span>
                  <span className="text-[#252B42]">Calculated at next step</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span className="text-[#252B42]">Total</span>
                  <span className="text-[#252B42]">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full mt-6 bg-[#23A6F0] text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Proceed to Payment"}
              </button>

              <p className="text-xs text-[#737373] mt-4 text-center">
                You will be redirected to Stripe for secure payment processing.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default CheckoutPage;