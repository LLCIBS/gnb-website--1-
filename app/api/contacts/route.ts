import { NextResponse } from 'next/server'
import { dataStorage } from '@/lib/storage'

export async function GET() {
  try {
    const contactInfo = dataStorage.getContactInfo()
    return NextResponse.json(contactInfo)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка получения контактов' }, { status: 500 })
  }
} 