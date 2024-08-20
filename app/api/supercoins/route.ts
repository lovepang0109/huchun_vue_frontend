import { postData, getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return await postData(`/supercoins`, await request.json(), request);
}

export async function GET(request: NextRequest) {
  return await getData(`/supercoins`, request);
}
