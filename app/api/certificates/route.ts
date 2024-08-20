import { getData, postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  return await getData(`/certificates`, req);
}

export async function POST(req: NextRequest) {
  return await postData(`/certificates`, await req.json(), req);
}
