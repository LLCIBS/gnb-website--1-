import { NextRequest, NextResponse } from 'next/server'
import { dataStorage } from '@/lib/storage'

export async function GET() {
  try {
    const faq = dataStorage.getFAQ()
    return NextResponse.json(faq)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения FAQ' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const faq = await request.json()
    dataStorage.updateFAQ(faq)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления FAQ' }, { status: 500 })
  }
} 