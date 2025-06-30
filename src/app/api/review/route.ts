import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

interface Review {
  name: string;
  rating: number;
  comment: string;
}

export async function POST(request: Request) {
  try {
    const { productId, review } = (await request.json()) as {
      productId: string;
      review: Review;
    };

    // Validate input
    if (!productId || !review || !review.name || !review.comment || !review.rating) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (review.rating < 1 || review.rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const newReview = {
      ...review,
      date: new Date().toISOString(),
    };

    // Check if the document exists first
    const existingProduct = await client.fetch(
      `*[_type in ["product", "productList"] && _id == $productId][0]`,
      { productId }
    );

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Update the product with the new review
    const result = await client
      .patch(productId)
      .setIfMissing({ reviews: [] })
      .append("reviews", [newReview])
      .commit({
        token: process.env.SANITY_API_TOKEN,
        autoGenerateArrayKeys: true,
      });

    console.log("Review added successfully:", result);

    return NextResponse.json(
      { message: "Review submitted successfully!", review: newReview },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting review:", error);
    
    // More specific error handling
    if (error instanceof Error) {
      return NextResponse.json(
        { message: `Failed to submit review: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to submit review due to an unknown error." },
      { status: 500 }
    );
  }
}