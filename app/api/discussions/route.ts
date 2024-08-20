import { getData, postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return await getData("/discussions", request);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  if (data.header) {
    return await postData(`/discussions`, data, req, data.header);
  } else {
    return await postData(`/discussions`, data, req);
  }
}
