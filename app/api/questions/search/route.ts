import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: any }) {
  return await postData(`/questions/search`, await req.json(), req);
}
