import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
  console.log(request);
  return await getData(`/coupons/referralUtmStats`, request);
}
