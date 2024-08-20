import { getData, getQueryString } from "@/lib/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return await getData(
    `/institute/getAllInstitutes${getQueryString(request)}`,
    request
  );
}
