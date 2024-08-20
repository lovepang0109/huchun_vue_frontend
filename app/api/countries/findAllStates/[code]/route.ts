import { getData } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { code } = params
  return await getData(`/countries/findAllStates/${code}`, req)
}
