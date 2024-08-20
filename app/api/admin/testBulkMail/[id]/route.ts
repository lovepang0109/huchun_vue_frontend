import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: any }) {
  const { id } = params;
  return await postData(`/admin/testBulkMail/${id}`, await req.json(), req);
}
