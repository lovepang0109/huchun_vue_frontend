import { getData, postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  return await getData(`/codesnippet`, req);
}

export async function POST(request: NextRequest) {
  let req = await request.json();
  return await postData(`/codesnippet`, req, request);
}
