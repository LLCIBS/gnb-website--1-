"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Clock, 
  ArrowRight, 
  Search, 
  Filter,
  BookOpen,
  Settings
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Article, ContactInfo } from "@/lib/data"

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Все")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [dataResponse, contactsResponse] = await Promise.all([
        fetch('/api/data'),
        fetch('/api/contacts')
      ])
      
      const data = await dataResponse.json()
      const contacts = await contactsResponse.json()
      
      setArticles(data.articles || [])
      setContactInfo(contacts)
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  // Получаем уникальные категории
  const categories = ["Все", ...Array.from(new Set(articles.map(article => article.category)))]

  // Фильтруем статьи
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Все" || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Загрузка статей...</p>
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
              Заказать звонок
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Статьи о горизонтальном направленном бурении
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Полезные материалы о мини установках ГНБ, технологиях прокладки коммуникаций и особенностях работ в частном секторе
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Поиск по статьям..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? "bg-blue-600" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Статьи не найдены</h3>
              <p className="text-gray-600">Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="aspect-video relative">
                    <Image 
                      src={article.image} 
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-blue-600 text-white">{article.category}</Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.readTime}
                      </div>
                      <span>{new Date(article.publishedAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <CardTitle className="text-xl text-gray-900 line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 line-clamp-3">
                      {article.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Link href={`/articles/${article.slug}`}>
                      <Button variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white">
                        Читать статью
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Нужна консультация по мини установке ГНБ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Получите профессиональную консультацию по проколам до 100 метров и прокладке коммуникаций в частном секторе
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              Заказать консультацию
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
              Рассчитать стоимость
            </Button>
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