import { getData } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: any }) {
  const {subjectId} = params;
  return await getData(`/analysis/strengthAndWeekness/${subjectId}`, req)
}
