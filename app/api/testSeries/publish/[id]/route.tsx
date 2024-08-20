import { getQueryString, putData } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const {id} = params;
  const series = getQueryString(req);
  return await putData(`/testSeries/publish/${id}`, series, req);
}