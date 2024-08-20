import { getQueryString, putData } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  try {
    const { id } = params;
    const series = getQueryString(req);

    // Your logic for handling the withdrawal request...

    // Assuming putData returns the response from the server
    const response = await putData(`/testSeries/revoke/${id}`, series, req);

    // Return a JSON response
    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Withdrawal error:", error);

    // Handle errors and return an appropriate response
    return new NextResponse(JSON.stringify({ error: "Withdrawal failed" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
