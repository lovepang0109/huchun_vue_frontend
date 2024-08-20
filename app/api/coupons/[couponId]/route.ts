import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { couponId } = params;
  return await putData(`/coupons/${couponId}`, await request.json(), request);
}
