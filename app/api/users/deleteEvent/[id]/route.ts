import { deleteData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  const { id } = params;
  return await deleteData(`/users/deleteEvent/${id}`, req);
}
