import { getData, putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { id } = params;
  return await getData(`/institute/getInstituteInvitees/${id}`, req);
}
