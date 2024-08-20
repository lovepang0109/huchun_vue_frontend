import { getData, putData, deleteData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { query } = params;
  console.log("api course request ..........++++++++++++++");
  return await getData(`/course/${query}`, req);
}

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { query } = params;
  const requrestData = await req.json();
  return await putData(`/course/${query}`, requrestData, req);
}

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  const { query } = params;
  return await deleteData(`/course/${query}`, req);
}
