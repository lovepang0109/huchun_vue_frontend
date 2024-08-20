import { getData } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { param } = params
  return await getData(`/settings/find-one/${param}`, req)
}
