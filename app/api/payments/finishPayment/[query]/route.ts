import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: any }) {
  const { query } = params;
  let req = await request.json()
  return await postData(`/payments/paymentFinish/${query}`, req ? req : {}, request)
}
