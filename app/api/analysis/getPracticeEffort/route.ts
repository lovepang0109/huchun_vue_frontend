import { getData, getQueryString } from '@/lib/api'
import { NextRequest } from 'next/server'

// export async function GET(req: NextRequest) {
//   const que = await getQueryString(req)
//   console.log(que, "now000000000")
//   return await getData(`/analysis/get-practice-effort${que}`, req)
// }

export async function GET(req: NextRequest, { params }: { params: any }) {
  return await getData(`/analysis/getPracticeEffort`, req)
}
