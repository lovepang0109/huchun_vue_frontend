import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return await postData(`/users/deductEducoins`, await request.json(), request);
}
