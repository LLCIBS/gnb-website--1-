import { NextRequest, NextResponse } from 'next/server'
import { dataStorage } from '@/lib/storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const articles = dataStorage.getArticles()
    const article = articles.find(a => a.slug === slug)
    
    if (!article) {
      return NextResponse.json({ error: 'Статья не найдена' }, { status: 404 })
    }
    
    return NextResponse.json(article)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения статьи' }, { status: 500 })
  }
} 