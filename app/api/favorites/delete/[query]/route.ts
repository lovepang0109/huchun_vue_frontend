import { deleteData } from "@/lib/api";
import { NextRequest } from "next/server";


export async function DELETE(req: NextRequest, { params }: { params: any }) {
  const { query } = params;
  console.log(query, "deleteparam>>>>>>")
  return await deleteData(`/favorites/delete/${query}`, req);
}