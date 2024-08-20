import { getData, getQueryString } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { id } = params;
  const query = getQueryString(req);
  return await getData(`/testSeries/practiceHoursTestSeries/${id}${query}`, req)
}