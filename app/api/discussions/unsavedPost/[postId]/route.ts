import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { postId } = params;
  return await putData(`/discussions/unsavedPost/${postId}`, await req.json(), req);
}
