import { deleteData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  const { classId, testId } = params;
  return await deleteData(`/classRooms/${classId}/removeTest/${testId}`, req);
}
