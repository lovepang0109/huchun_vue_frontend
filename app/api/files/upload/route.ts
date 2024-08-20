import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return await postData(`/files/upload`, await req.json(), req);
}
