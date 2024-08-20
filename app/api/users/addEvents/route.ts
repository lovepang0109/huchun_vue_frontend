import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: any }) {
  return await postData(`/users/addEvents`, await request.json(), request);
}
