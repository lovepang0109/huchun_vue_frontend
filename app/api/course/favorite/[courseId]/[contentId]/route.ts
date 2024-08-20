import { deleteData, putData } from "@/lib/api";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { courseId, contentId } = params;
  let data = {}; // Default to empty object
  try {
    data = await req.json();
  } catch (error) {
    console.error("Error parsing JSON:", error);
    // Handle error here, e.g., return a 400 Bad Request response
  }

  return await putData(
    `/course/${courseId}/favorite/${contentId}`,
    data,
    req
  );
}

export async function DELETE(req: NextRequest, { params }: { params: any }) {
  const { courseId, contentId } = params;
  return await deleteData(`/course/${courseId}/favorite/${contentId}`, req);
}
