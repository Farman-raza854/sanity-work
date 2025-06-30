import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { labelId: string } }
) {
  try {
    const { labelId } = params;

    if (!labelId) {
      return NextResponse.json(
        { error: "Label ID is required" },
        { status: 400 }
      );
    }

    const shipEngineApiKey = process.env.SHIPENGINE_API_KEY;
    
    if (!shipEngineApiKey) {
      return NextResponse.json(
        { error: "ShipEngine API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.shipengine.com/v1/labels/${labelId}/track`,
      {
        method: "GET",
        headers: {
          "API-Key": shipEngineApiKey,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("ShipEngine tracking API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch tracking information" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching tracking information:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}