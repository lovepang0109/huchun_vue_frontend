import { getData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function Get(request: NextRequest, { params }: { params: any }) {
  const { id } = params;
  return await getData(`/userFollow/amIFollow/${id}`, request);
}
