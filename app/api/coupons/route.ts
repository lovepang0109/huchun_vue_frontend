import { postData, getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return await postData(`/coupons`, await request.json(), request);
}

export async function GET(req: NextRequest) {
  return await getData(`/coupons`, req);
}