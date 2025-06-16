import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Можно загружать только изображения' }, { status: 400 })
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Размер файла не должен превышать 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Генерируем уникальное имя файла
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${originalName}`
    
    // Создаем путь к файлу
    const publicDir = path.join(process.cwd(), 'public', 'images')
    const filePath = path.join(publicDir, fileName)

    // Создаем папку images если её нет
    try {
      await mkdir(publicDir, { recursive: true })
    } catch (error) {
      // Папка уже существует
    }

    // Сохраняем файл
    await writeFile(filePath, buffer)

    // Возвращаем путь к файлу для использования в src
    const imagePath = `/images/${fileName}`

    return NextResponse.json({ 
      success: true, 
      path: imagePath,
      fileName: fileName 
    })

  } catch (error) {
    console.error('Ошибка загрузки файла:', error)
    return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 })
  }
} 