import { NextResponse } from 'next/server'
import { dataStorage } from '@/lib/storage'

export async function GET() {
  try {
    const data = dataStorage.getData()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения данных' }, { status: 500 })
  }
} 