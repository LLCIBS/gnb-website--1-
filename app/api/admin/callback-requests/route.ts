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

    const requests = dataStorage.getCallbackRequests()
    return NextResponse.json(requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения заявок' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!await checkAuth()) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const requests = await request.json()
    dataStorage.setCallbackRequests(requests)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сохранения заявок' }, { status: 500 })
  }
} 