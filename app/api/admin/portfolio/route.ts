import { NextRequest, NextResponse } from 'next/server'
import { dataStorage } from '@/lib/storage'

export async function GET() {
  try {
    const portfolio = dataStorage.getPortfolio()
    return NextResponse.json(portfolio)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения портфолио' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const portfolio = await request.json()
    dataStorage.updatePortfolio(portfolio)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления портфолио' }, { status: 500 })
  }
} 