import { getData, getQueryString } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const query = getQueryString(req);
  return await getData(`/testSeries/boughtTestSeriesByOthers${query}`, req)
}