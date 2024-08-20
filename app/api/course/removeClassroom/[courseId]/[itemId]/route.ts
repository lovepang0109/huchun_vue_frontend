import { deleteData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  const { courseId, itemId } = params;
  return await deleteData(`/course/ratingsCount/${courseId}/${itemId}`, req);
}
