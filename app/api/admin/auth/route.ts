import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('admin-auth')
    
    const authenticated = authToken?.value === 'authenticated'
    
    return NextResponse.json({ authenticated })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true })
      
      // Устанавливаем куки на 24 часа
      response.cookies.set('admin-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 часа
        path: '/'
      })
      
      return response
    } else {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка авторизации' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true })
    
    // Очищаем куки авторизации
    response.cookies.set('admin-auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Удаляем куки
      path: '/'
    })
    
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка выхода' }, { status: 500 })
  }
} 