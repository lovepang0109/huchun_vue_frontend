import { getData, getQueryString } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: any }) {
  const querystring = getQueryString(req);
  // const {query} = params;
  return await getData(`/questions/testSeriesSummaryBySubject/`, req)
}
