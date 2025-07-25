"use client";
import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import { FiChevronRight, FiHeart, FiShoppingCart, FiEye } from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";
import { CartItem, useCart } from "@/components/cart-components/CartContext";
import { useParams } from "next/navigation";
import Footer from "@/components/team-components/footer";
import Header from "@/components/productList-components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import Loader from "@/components/home-components/loader";

// Define types
interface SanityImage {
  _type: string;
  asset: {
    _ref: string;
    _type: string;
  };
}

interface SanitySlug {
  _type: string;
  current: string;
}

interface Review {
  _key?: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

interface SanityProduct {
  _id: string;
  _type: string;
  name: string;
  slug: SanitySlug;
  inStock: boolean;
  image: SanityImage;
  description: string;
  price: number;
  discountPrice?: number;
  colors?: string[];
  department?: string;
  rating?: number;
  stock?: number;
  reviews?: Review[];
}

interface Product {
  _id: string;
  _type: string;
  name: string;
  slug: SanitySlug;
  inStock: boolean;
  image: SanityImage;
  description: string;
  price: number;
  discountPrice?: number;
  colors: string[];
  department: string;
  rating: number;
  stock: number;
  reviews: Review[];
}

interface PageParams {
  id: string;
}

const transformToProduct = (sanityProduct: SanityProduct | null): Product | null => {
  if (!sanityProduct) return null;

  return {
    _id: sanityProduct._id,
    _type: sanityProduct._type,
    name: sanityProduct.name || "",
    slug: sanityProduct.slug,
    inStock: sanityProduct.inStock || false,
    image: sanityProduct.image,
    description: sanityProduct.description || "",
    price: sanityProduct.price || 0,
    discountPrice: sanityProduct.discountPrice,
    colors: sanityProduct.colors || [],
    department: sanityProduct.department || "",
    rating: sanityProduct.rating || 0,
    stock: sanityProduct.stock || 0,
    reviews: Array.isArray(sanityProduct.reviews) ? sanityProduct.reviews : [],
  };
};

const ProductPage = () => {
  const { id } = useParams<PageParams>();
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [review, setReview] = useState<Omit<Review, '_key'>>({
    name: "",
    rating: 0,
    comment: "",
    date: "",
  });

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const query = `*[_type == "productList" && slug.current == $id][0]{
        _id,
        _type,
        name,
        slug,
        inStock,
        image,
        description,
        price,
        discountPrice,
        colors,
        department,
        rating,
        stock,
        reviews
      }`;
      const sanityProduct: SanityProduct | null = await client.fetch(query, { id });

      if (!sanityProduct) {
        throw new Error("Product not found");
      }

      const transformedProduct = transformToProduct(sanityProduct);
      setProduct(transformedProduct);

      if (transformedProduct?.image) {
        setCurrentImage(urlFor(transformedProduct.image).url());
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load product");
      console.error("Error fetching product:", error);
      setError(error.message);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  const handleReviewChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReview(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating: number) => {
    setReview(prev => ({ ...prev, rating }));
  };

  const handleSubmitReview = async () => {
    if (!product || !review.name.trim() || !review.comment.trim() || review.rating === 0) {
      toast.error("Please fill out all fields and provide a rating.");
      return;
    }

    setSubmittingReview(true);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          review: {
            name: review.name.trim(),
            rating: review.rating,
            comment: review.comment.trim(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review.");
      }

      // Refresh product data
      await fetchProduct();
      toast.success("Review submitted successfully!");
      setReview({ name: "", rating: 0, comment: "", date: "" });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to submit review");
      console.error("Error submitting review:", error);
      toast.error(error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!product.inStock || product.stock <= 0) {
      toast.error("This product is out of stock and cannot be added to the cart.", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    const item: CartItem = {
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.discountPrice || product.price,
      quantity: 1,
      imageUrl: urlFor(product.image).url(),
      inStock: product.inStock,
      stock: product.stock,
    };

    addToCart(item);
    toast.success(`${product.name} added to cart!`, {
      position: "bottom-right",
      autoClose: 3000,
    });
  };

  const handleAddToWishlist = () => {
    if (!product) return;

    if (isInWishlist(product._id)) {
      toast.info("This product is already in your wishlist!", {
        position: "bottom-right",
        autoClose: 3000,
      });
      return;
    }

    const item: CartItem = {
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.discountPrice || product.price,
      quantity: 1,
      imageUrl: urlFor(product.image).url(),
      inStock: product.inStock,
      stock: product.stock,
    };

    addToWishlist(item);
    toast.success(`${product.name} added to wishlist!`, {
      position: "bottom-right",
      autoClose: 3000,
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">Product not found</h1>
          <p className="text-gray-500">The product you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const averageRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
        <Header />
      </ClerkProvider>
      
      {/* Breadcrumb */}
      <div>
        <p className="text-[#252B42] mt-5 font-bold text-[14px] flex py-8 px-4 sm:px-16 gap-1">
          Home <FiChevronRight className="text-[#BDBDBD] text-[25px]" />{" "}
          <span className="text-[#737373]">Shop</span>
        </p>
      </div>

      {/* Product Content */}
      <div className="px-4 sm:px-14 flex flex-col sm:flex-row gap-8">
        {/* Product Image */}
        <div className="w-full sm:w-[506px] h-[650px] relative">
          <div className="w-full h-full rounded-lg overflow-hidden shadow-lg border border-[#E8E8E8]">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 ml-0 sm:ml-10 text-center sm:text-left">
          <h2 className="text-[#252B42] text-3xl font-bold mt-12 md:mt-0">
            {product.name}
          </h2>
          
          {/* Rating */}
          <div className="flex justify-center sm:justify-start items-center mt-4">
            <div className="flex text-[#F3CD03] gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                star <= Math.round(averageRating) ? (
                  <FaStar key={star} size={24} />
                ) : (
                  <FaRegStar key={star} size={24} />
                )
              ))}
            </div>
            <span className="ml-2 text-[#737373] font-bold text-[14px]">
              {product.reviews.length} Reviews
            </span>
          </div>

          {/* Price */}
          <div className="mt-8">
            <p className="text-[#252B42] font-bold text-3xl">
              {product.discountPrice && (
                <span className="line-through text-[#BDBDBD] mr-2 text-xl">
                  ${product.price}
                </span>
              )}
              ${product.discountPrice || product.price}
            </p>
            <p className="text-[#737373] font-bold text-[14px] mt-2">
              Availability:{" "}
              <span className={`font-bold text-[14px] ${
                product.inStock && product.stock > 0 ? "text-[#23A6F0]" : "text-[#E74040]"
              }`}>
                {product.inStock && product.stock > 0
                  ? `In Stock (${product.stock} available)`
                  : "Out of Stock"}
              </span>
            </p>
          </div>

          {/* Description */}
          <div className="mt-8">
            <p className="text-[#858585] text-[16px] leading-relaxed">
              {product.description}
            </p>
            <div className="border-b-2 border-[#BDBDBD] mt-8"></div>
          </div>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="flex justify-center sm:justify-start mt-8 gap-4">
              {product.colors.map((color, index) => (
                <div
                  key={index}
                  className="w-10 h-10 rounded-full border-2 border-[#E8E8E8] hover:border-[#23A6F0] transition-all"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center sm:justify-start gap-4 mt-14">
            <button className="px-5 py-1 md:px-8 md:py-3 bg-[#23A6F0] hover:bg-[#1E90FF] text-white rounded-lg text-[16px] font-bold transition-all shadow-lg hover:shadow-xl">
              Select Options
            </button>
            
            <div className="relative group">
              <button
                className={`w-12 h-12 bg-white hover:bg-[#F1F1F1] text-[#252B42] border border-[#E8E8E8] rounded-full flex items-center justify-center text-[24px] font-bold transition-all shadow-lg hover:shadow-xl ${
                  isInWishlist(product._id) ? "bg-red-100 text-red-500" : ""
                }`}
                onClick={handleAddToWishlist}
              >
                <FiHeart />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-[#23A6F0] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {isInWishlist(product._id) ? "In Wishlist" : "Add to Wishlist"}
              </div>
            </div>
            
            <div className="relative group">
              <button
                className="w-12 h-12 bg-white hover:bg-[#F1F1F1] text-[#252B42] border border-[#E8E8E8] rounded-full flex items-center justify-center text-[24px] font-bold transition-all shadow-lg hover:shadow-xl"
                onClick={handleAddToCart}
              >
                <FiShoppingCart />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-[#23A6F0] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Add to Cart
              </div>
            </div>
            
            <button className="w-12 h-12 bg-white hover:bg-[#F1F1F1] text-[#252B42] border border-[#E8E8E8] rounded-full flex items-center justify-center text-[24px] font-bold transition-all shadow-lg hover:shadow-xl">
              <FiEye />
            </button>
          </div>

          {/* Review Form */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-[#252B42] mb-4">
              Leave a Review
            </h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={review.name}
                onChange={handleReviewChange}
                className="p-2 border border-[#E8E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23A6F0]"
                disabled={submittingReview}
              />
              <textarea
                name="comment"
                placeholder="Your Review"
                value={review.comment}
                onChange={handleReviewChange}
                className="p-2 border border-[#E8E8E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23A6F0]"
                rows={4}
                disabled={submittingReview}
              />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingChange(star)}
                    className={`text-2xl ${
                      star <= review.rating ? "text-[#F3CD03]" : "text-[#BDBDBD]"
                    }`}
                    disabled={submittingReview}
                  >
                    ★
                  </button>
                ))}
              </div>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="px-6 py-2 bg-[#23A6F0] text-white rounded-lg hover:bg-[#1E90FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-[#252B42] mb-4">
              Customer Reviews
            </h3>
            {product.reviews.length > 0 ? (
              product.reviews.map((review, index) => (
                <div key={index} className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#252B42]">{review.name}</span>
                    <div className="flex text-[#F3CD03]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        star <= review.rating ? (
                          <FaStar key={star} size={16} />
                        ) : (
                          <FaRegStar key={star} size={16} />
                        )
                      ))}
                    </div>
                    <span className="text-[#737373] text-sm">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[#858585] mt-2">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-[#737373]">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <ToastContainer />
    </div>
  );
};

export default ProductPage;