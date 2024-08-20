import { getData, deleteData, putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { id } = params;
  return await getData(`/contents/${id}`, req);
}

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  const { id } = params;
  return await deleteData(`/contents/${id}`, req);
}

export async function PUT(request: NextRequest, { params }: { params: any }) {
  const { id } = params;
  const formData = await request.formData();
  const param = Object.fromEntries(formData.entries());
  return await putData(`/contents/${id}`, param , request);
}