import { postData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: any }) {
  const { id, sectionId } = params;
  return await postData(
    `/course/editContentInSection/${id}/${sectionId}`,
    await req.json(),
    req
  );
}
