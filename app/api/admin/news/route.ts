import { getData, postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  return await getData(`/admin/news`, req);
}

export async function POST(request: NextRequest) {
  return await postData(`/admin/news`, await request.json(), request);
}
