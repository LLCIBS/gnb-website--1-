import { NextRequest, NextResponse } from 'next/server'
import { dataStorage } from '@/lib/storage'
import { cookies } from 'next/headers'

async function checkAuth() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('admin-auth')
    return authToken?.value === 'authenticated'
  } catch {
    return false
  }
}

export async function GET() {
  try {
    if (!await checkAuth()) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const contactInfo = dataStorage.getContactInfo()
    return NextResponse.json(contactInfo)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения контактов' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!await checkAuth()) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const contactInfo = await request.json()
    dataStorage.setContactInfo(contactInfo)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сохранения контактов' }, { status: 500 })
  }
} 