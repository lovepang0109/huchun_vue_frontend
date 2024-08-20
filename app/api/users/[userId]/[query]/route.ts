import { getData, getQueryString, putData } from '@/lib/api'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: any }) {
  const { query } = params
  return await getData(`/users/${query}`, req)
}

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { query } = params
  return await putData(`/users/${query}`, await req.json(), req)
}

