import { NextRequest, NextResponse } from 'next/server'
import { dataStorage } from '@/lib/storage'

export async function GET() {
  try {
    const articles = dataStorage.getArticles()
    return NextResponse.json(articles)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения статей' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const articles = await request.json()
    dataStorage.setArticles(articles)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления статей' }, { status: 500 })
  }
} 