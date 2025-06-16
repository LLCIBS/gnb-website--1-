import { NextRequest, NextResponse } from 'next/server'
import { dataStorage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const { name, phone, message, type = 'callback' } = await request.json()
    
    if (!name || !phone) {
      return NextResponse.json({ error: 'Имя и телефон обязательны' }, { status: 400 })
    }
    
    const callbackRequest = dataStorage.addCallbackRequest({
      name,
      phone,
      message: message || '',
      type
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Заявка отправлена! Мы свяжемся с вами в ближайшее время.',
      id: callbackRequest.id
    })
  } catch (error) {
    console.error('Ошибка создания заявки:', error)
    return NextResponse.json({ error: 'Ошибка отправки заявки' }, { status: 500 })
  }
} 