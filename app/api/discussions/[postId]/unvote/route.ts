import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { postId } = params;
  return await putData(`/discussions/${postId}/unvote`, await req.json(), req);
}
