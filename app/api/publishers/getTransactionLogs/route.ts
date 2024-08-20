import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  return await getData(`/publishers/getTransactionLogs`, req);
}
