import { NextRequest, NextResponse } from 'next/server'
import { dataStorage } from '@/lib/storage'

export async function GET() {
  try {
    const services = dataStorage.getServices()
    return NextResponse.json(services)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения услуг' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const services = await request.json()
    dataStorage.updateServices(services)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления услуг' }, { status: 500 })
  }
} 