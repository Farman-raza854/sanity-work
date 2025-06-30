import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { rateId } = await request.json();

    if (!rateId) {
      return NextResponse.json(
        { error: "Rate ID is required" },
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

    const labelData = {
      rate_id: rateId,
      label_layout: "4x6",
      label_format: "pdf",
    };

    const response = await fetch("https://api.shipengine.com/v1/labels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": shipEngineApiKey,
      },
      body: JSON.stringify(labelData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("ShipEngine label API error:", errorData);
      return NextResponse.json(
        { error: "Failed to create shipping label" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating shipping label:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}