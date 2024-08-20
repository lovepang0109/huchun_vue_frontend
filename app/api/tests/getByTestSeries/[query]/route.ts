import { getData } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: any }) {
  console.log(params, "params>>>>>")
  const { query } = params
  return await getData(`/tests/getByTestseries/${query}`, req)
}
