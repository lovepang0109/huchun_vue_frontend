import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  let req = await request.json();
  return await postData(`/users/marketingUtm/visitor`, req, request);
}
