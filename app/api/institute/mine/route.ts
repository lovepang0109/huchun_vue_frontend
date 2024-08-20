import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return await getData(`/institute/mine`, req);
}
