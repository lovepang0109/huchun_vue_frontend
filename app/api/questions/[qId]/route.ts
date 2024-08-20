import {  deleteData, putData } from '@/lib/api'
import { NextRequest } from 'next/server'


export async function DELETE(req: NextRequest, { params }: { params: any }) {
  const { query } = params;
  return await deleteData(`/questions/${query}`, req);
}

export async function PUT(req: NextRequest, { params }: { params: any }) {
  const { qid } = params;
  return await putData(`/questions/${qid}`, await req.json(), req);
}
