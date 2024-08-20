
import { deleteData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  const { query } = params;
  return await deleteData(`/testSeries/removefavorite/${query}`, req);
}