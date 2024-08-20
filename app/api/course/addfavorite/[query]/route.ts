import { putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { query } = params;
  return await putData(`/course/addfavorite/${query}`, await req.json(), req);
}