import { postData } from "@/lib/api";
import { NextRequest } from "next/server";
export async function POST(request: NextRequest, { params }: { params: any }) {
  const { id } = params;

  return await postData(
    `/institute/inviteToJoin/${id}`,
    await request.json(),
    request
  );
}
