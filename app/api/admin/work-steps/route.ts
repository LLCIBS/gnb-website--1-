import { NextRequest, NextResponse } from 'next/server'
import { dataStorage } from '@/lib/storage'

export async function GET() {
  try {
    const workSteps = dataStorage.getWorkSteps()
    return NextResponse.json(workSteps)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения этапов работ' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const workSteps = await request.json()
    dataStorage.updateWorkSteps(workSteps)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления этапов работ' }, { status: 500 })
  }
} 