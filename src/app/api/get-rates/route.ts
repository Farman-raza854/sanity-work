import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { shipeToAddress, packages } = await request.json();

    // Validate required fields
    if (!shipeToAddress || !packages) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    const shipmentData = {
      rate_options: {
        carrier_ids: [
          "se-123890", // UPS
          "se-123891", // FedEx
          "se-123892", // USPS
        ],
      },
      shipment: {
        ship_to: {
          name: shipeToAddress.name,
          phone: shipeToAddress.phone,
          address_line1: shipeToAddress.addressLine1,
          city_locality: shipeToAddress.cityLocality,
          state_province: shipeToAddress.stateProvince,
          postal_code: shipeToAddress.postalCode,
          country_code: shipeToAddress.countryCode,
          address_residential_indicator: shipeToAddress.addressResidentialIndicator,
        },
        ship_from: {
          name: "Your Store",
          phone: "555-123-4567",
          address_line1: "123 Store Street",
          city_locality: "Store City",
          state_province: "CA",
          postal_code: "90210",
          country_code: "US",
          address_residential_indicator: "no",
        },
        packages: packages.map((pkg: any) => ({
          weight: {
            value: pkg.weight.value,
            unit: pkg.weight.unit,
          },
          dimensions: {
            height: pkg.dimensions.height,
            width: pkg.dimensions.width,
            length: pkg.dimensions.length,
            unit: pkg.dimensions.unit,
          },
        })),
      },
    };

    const response = await fetch("https://api.shipengine.com/v1/rates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": shipEngineApiKey,
      },
      body: JSON.stringify(shipmentData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("ShipEngine API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch shipping rates" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ shipmentDetails: data });
  } catch (error) {
    console.error("Error fetching shipping rates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}