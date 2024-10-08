import {NextRequest} from "next/server";
import {putData} from "@/lib/api";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { postId } = params;
  return await putData(`/discussions/unflag/${postId}`, await req.json(), req);
}
