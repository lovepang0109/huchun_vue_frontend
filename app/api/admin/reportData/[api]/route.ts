import { getFile } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { api } = params;
  return await getFile(`/admin/reportData/${api}`, req);
}
