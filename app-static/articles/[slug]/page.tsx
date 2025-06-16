"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Clock, 
  Calendar,
  ArrowLeft,
  BookOpen,
  Settings,
  Share2,
  Phone
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import type { Article, ContactInfo } from "@/lib/data"

export default function ArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [params.slug])

  const loadData = async () => {
    try {
      const [articleResponse, contactsResponse] = await Promise.all([
        fetch(`/api/articles/${params.slug}`),
        fetch('/api/contacts')
      ])
      
      if (articleResponse.ok) {
        const articleData = await articleResponse.json()
        const contacts = await contactsResponse.json()
        setArticle(articleData)
        setContactInfo(contacts)
      } else {
        setError('Статья не найдена')
      }
    } catch (error) {
      console.error('Ошибка загрузки статьи:', error)
      setError('Ошибка загрузки статьи')
    } finally {
      setLoading(false)
    }
  }

  const formatContent = (content: string) => {
    // Простая обработка Markdown-подобного контента
    return content
      .split('\n')
      .map((paragraph, index) => {
        if (paragraph.trim() === '') return null
        
        // Заголовки
        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
          return (
            <h3 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              {paragraph.slice(2, -2)}
            </h3>
          )
        }
        
        // Подзаголовки
        if (paragraph.startsWith('###')) {
          return (
            <h4 key={index} className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {paragraph.slice(3).trim()}
            </h4>
          )
        }
        
        // Списки
        if (paragraph.startsWith('- ')) {
          return (
            <li key={index} className="ml-4 mb-2 text-gray-700">
              {paragraph.slice(2)}
            </li>
          )
        }
        
        // Нумерованные списки
        if (/^\d+\./.test(paragraph)) {
          return (
            <li key={index} className="ml-4 mb-2 text-gray-700 list-decimal">
              {paragraph.replace(/^\d+\.\s*/, '')}
            </li>
          )
        }
        
        // Обычные параграфы
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-4">
            {paragraph}
          </p>
        )
      })
      .filter(Boolean)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Загрузка статьи...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Статья не найдена</h1>
          <p className="text-gray-600 mb-6">{error || 'Запрашиваемая статья не существует'}</p>
          <Link href="/articles">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться к статьям
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{contactInfo?.companyName || 'ГНБ-Эксперт'}</h1>
                <p className="text-sm text-gray-600">Статьи о мини ГНБ</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/#services" className="text-gray-700 hover:text-blue-600 transition-colors">
                Услуги
              </Link>
              <Link href="/#about" className="text-gray-700 hover:text-blue-600 transition-colors">
                О компании
              </Link>
              <Link href="/articles" className="text-blue-600 font-medium">
                Статьи
              </Link>
              <Link href="/#contacts" className="text-gray-700 hover:text-blue-600 transition-colors">
                Контакты
              </Link>
            </nav>

            <Button className="bg-orange-500 hover:bg-orange-600">
              <Phone className="w-4 h-4 mr-2" />
              Заказать звонок
            </Button>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Главная</Link>
            <span className="mx-2">/</span>
            <Link href="/articles" className="hover:text-blue-600">Статьи</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{article.title}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/articles">
              <Button variant="outline" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к статьям
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge className="bg-blue-600 text-white px-3 py-1">{article.category}</Badge>
              <div className="flex items-center text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>{article.readTime}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{new Date(article.publishedAt).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {article.description}
            </p>

            {/* Article Image */}
            <div className="relative aspect-video w-full mb-8 rounded-xl overflow-hidden">
              <Image 
                src={article.image} 
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-lg leading-relaxed">
              {formatContent(article.content)}
            </div>
          </div>

          {/* Share and CTA */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Поделиться:</span>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Поделиться
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  <Phone className="w-4 h-4 mr-2" />
                  Заказать консультацию
                </Button>
                <Button size="lg" variant="outline">
                  Рассчитать стоимость
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles CTA */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Полезно? Читайте больше статей о ГНБ
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Изучите другие материалы о мини установках ГНБ, технологиях и процессах работы в частном секторе
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/articles">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
                <BookOpen className="w-4 h-4 mr-2" />
                Все статьи
              </Button>
            </Link>
            <Link href="/#services">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
                Наши услуги
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">{contactInfo?.companyName || 'ГНБ-Эксперт'}</span>
              </Link>
              <p className="text-gray-400 mb-4">
                Профессиональные услуги горизонтального направленного бурения мини установкой. 
                Проколы до 100 метров в частном секторе.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Полезные статьи</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/articles" className="hover:text-white transition-colors">
                    Все статьи о ГНБ
                  </Link>
                </li>
                <li>
                  <Link href="/articles" className="hover:text-white transition-colors">
                    Технологии бурения
                  </Link>
                </li>
                <li>
                  <Link href="/articles" className="hover:text-white transition-colors">
                    Цены и расценки
                  </Link>
                </li>
                <li>
                  <Link href="/articles" className="hover:text-white transition-colors">
                    Документы и разрешения
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Услуги</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/#services" className="hover:text-white transition-colors">
                    Проколы под дорогами
                  </Link>
                </li>
                <li>
                  <Link href="/#services" className="hover:text-white transition-colors">
                    Прокладка канализации
                  </Link>
                </li>
                <li>
                  <Link href="/#services" className="hover:text-white transition-colors">
                    Прокладка газопровода
                  </Link>
                </li>
                <li>
                  <Link href="/#services" className="hover:text-white transition-colors">
                    Санация труб
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Контакты</h3>
              <div className="space-y-2 text-gray-400">
                <a href="tel:+74951234567" className="font-medium text-white hover:text-blue-300 transition-colors block">
                  +7 (495) 123-45-67
                </a>
                <p>info@gnb-expert.ru</p>
                <p>Москва и Московская область</p>
                <p className="text-sm">Работаем: Пн-Вс 8:00-20:00</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
              <p>&copy; 2024 {contactInfo?.companyName || 'ГНБ-Эксперт'}. Все права защищены.</p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <Link href="/" className="hover:text-white transition-colors">Главная</Link>
                <Link href="/articles" className="hover:text-white transition-colors">Статьи</Link>
                <Link href="/#contacts" className="hover:text-white transition-colors">Контакты</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 