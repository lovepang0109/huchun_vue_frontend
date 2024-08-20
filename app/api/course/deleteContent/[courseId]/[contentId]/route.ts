import { deleteData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  const { courseId, contentId } = params;
  return await deleteData(
    `/course/deleteContent/${courseId}/${contentId}`,
    req
  );
}
