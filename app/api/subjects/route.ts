import { getData, postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
  return await getData(`/subjects`, request);
}

export async function POST(request: NextRequest) {
  return await postData(`/subjects`, await request.json(), request);
}
