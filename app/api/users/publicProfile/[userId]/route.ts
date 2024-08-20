import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { userId } = params;
  return await getData(`/users/publicProfile/${userId}`, req);
}
