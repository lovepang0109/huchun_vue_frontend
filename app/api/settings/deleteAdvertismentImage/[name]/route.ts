import { deleteData, getQueryString } from "@/lib/api";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  const { name } = params;
  return await deleteData(`/settings/deleteAdvertismentImage/${name}`, req);
}
