import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest) {
  let req = await request.json();
  return await postData(`/classRooms/removeStudent`, req, request);
}
