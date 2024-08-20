import { putData } from "@/lib/api";
import { NextRequest } from "next/server";
import { IdleTimerContext } from "react-idle-timer";

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { id } = params;
  try {
    return await putData(`/manage/session/${id}`, await req.json(), req);
  } catch (error) {
    return error;
  }
}
