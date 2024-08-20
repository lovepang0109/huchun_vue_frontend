import { getData, postData } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: any }) {
  const formData = await req.formData();
  const param = Object.fromEntries(formData.entries());
  return await postData(`/contents`, param , req);
}

export async function GET(req: NextRequest) {
  return await getData(`/contents`, req);
}

