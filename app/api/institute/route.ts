import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return await postData(`/institute`, await req.json(), req);
}
