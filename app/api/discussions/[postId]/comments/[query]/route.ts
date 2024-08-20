import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { postId, query } = params;
  return await getData(`/discussions${postId}/comments${query}`, request);
}
