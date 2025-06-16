import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'ГНБ-Эксперт | Мини установка ГНБ | Проколы до 100м диаметром до 400мм',
  description: 'Профессиональные услуги ГНБ мини установкой до 100 метров. Проколы под дорогами, прокладка канализации, газа, кабеля диаметром 20-400мм. Работаем там, где не проедет большая техника!',
  keywords: 'ГНБ мини установка, горизонтальное направленное бурение, проколы под дорогой, прокладка канализации, прокладка газа, прокладка кабеля, санация труб, установка колодцев, бестраншейная прокладка, ГНБ до 100 метров, ГНБ диаметр до 400мм, мини ГНБ, локальные проколы, труднодоступные места',
  authors: [{ name: 'ГНБ-Эксперт' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://gnb-expert.ru',
    siteName: 'ГНБ-Эксперт',
    title: 'ГНБ-Эксперт | Мини установка ГНБ | Проколы до 100м',
    description: 'Профессиональные услуги ГНБ мини установкой до 100 метров. Работаем там, где не проедет большая техника!',
    images: [
      {
        url: '/images/gnb-mini-installation.jpg',
        width: 1200,
        height: 630,
        alt: 'ГНБ мини установка для локальных проколов',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ГНБ-Эксперт | Мини установка ГНБ',
    description: 'Профессиональные услуги ГНБ мини установкой до 100 метров',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
