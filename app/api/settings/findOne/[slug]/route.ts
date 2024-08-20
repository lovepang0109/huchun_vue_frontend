import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
  const { slug } = params;
  return await getData(`/settings/findOne/${slug}`, request);
}
