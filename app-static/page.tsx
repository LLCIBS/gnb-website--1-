"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CallbackForm } from "@/components/ui/callback-form"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Award,
  Wrench,
  Zap,
  Star,
  ArrowRight,
  Calculator,
  MessageCircle,
  Target,
  Ruler,
  Settings,
  Truck,
  Home,
  CheckCircle,
  Users,
  Calendar,
  ArrowUp,
  Menu,
  X
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Service, WorkStep, PortfolioProject, FAQItem, ContactInfo } from "@/lib/data"

export default function GNBLandingPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    comment: "",
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Состояния для динамических данных
  const [services, setServices] = useState<Service[]>([])
  const [workSteps, setWorkSteps] = useState<WorkStep[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([])
  const [faq, setFaq] = useState<FAQItem[]>([])
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // Функция прокрутки наверх
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

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
      
      setServices(data.services || [])
      setWorkSteps(data.workSteps || [])
      setPortfolio(data.portfolio || [])
      setFaq(data.faq || [])
      setContactInfo(contacts)
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Пожалуйста, заполните имя и телефон')
      return
    }

    setFormLoading(true)
    
    try {
      const response = await fetch('/api/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          message: formData.comment,
          type: 'calculation'
        })
      })

      if (response.ok) {
        setFormSuccess(true)
        setFormData({ name: '', phone: '', comment: '' })
        setTimeout(() => {
          setFormSuccess(false)
        }, 5000)
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка отправки заявки')
      }
    } catch (error) {
      console.error('Ошибка отправки заявки:', error)
      alert('Ошибка отправки заявки')
    } finally {
      setFormLoading(false)
    }
  }

  // Статические данные для testimonials - можно позже вынести в админку
  const testimonials = [
    {
      name: "Сергей Михайлов",
      company: "Частный дом, Подмосковье",
      text: "Нужно было подключить газ к дому через соседский участок. Мини установка ГНБ прошла там, где большая техника никогда бы не проехала. Прокол 40 метров сделали за день!",
      rating: 5,
    },
    {
      name: "Елена Федорова", 
      company: "Коттеджный поселок 'Рублевка'",
      text: "Прокладывали канализацию диаметром 200мм на 65 метров. Очень довольны - никаких траншей, газон остался целым. Работают аккуратно и быстро.",
      rating: 5,
    },
    {
      name: "Александр Petrov",
      company: "Дачный участок, СНТ 'Березка'",
      text: "Сделали прокол под дорогой для водопровода. 55 метров, диаметр 63мм. Мини ГНБ - это то что нужно для дачи. Никого не беспокоили, все чисто.",
      rating: 5,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Загрузка...</p>
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
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{contactInfo?.companyName || 'ГНБ-Эксперт'}</h1>
                <p className="text-sm text-gray-600">Мини установка ГНБ до 100м</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#services" className="text-gray-700 hover:text-blue-600 transition-colors">
                Услуги
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">
                О компании
              </Link>
              <Link href="/articles" className="text-gray-700 hover:text-blue-600 transition-colors">
                Статьи
              </Link>
              <Link href="#contacts" className="text-gray-700 hover:text-blue-600 transition-colors">
                Контакты
              </Link>
            </nav>

            {/* Desktop Contact Info and CTA */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Звоните прямо сейчас</p>
                <a 
                  href={`tel:${contactInfo?.phone?.replace(/[^\d+]/g, '') || '+74951234567'}`} 
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {contactInfo?.phone || '+7 (495) 123-45-67'}
                </a>
              </div>
              <CallbackForm 
                trigger={
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Phone className="w-4 h-4 mr-2" />
                Заказать звонок
                  </Button>
                }
              />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <CallbackForm 
                trigger={
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                    <Phone className="w-4 h-4" />
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="mt-4 pb-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-3 pt-4">
                <Link 
                  href="#services" 
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Услуги ГНБ
                </Link>
                <Link 
                  href="#about" 
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  О компании
                </Link>
                <Link 
                  href="/articles" 
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Статьи
                </Link>
                <Link 
                  href="#contacts" 
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Контакты
                </Link>
                
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <a 
                      href={`tel:${contactInfo?.phone?.replace(/[^\d+]/g, '') || '+74951234567'}`} 
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {contactInfo?.phone || '+7 (495) 123-45-67'}
                    </a>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        scrollToTop()
                        setMobileMenuOpen(false)
                      }}
                      className="flex items-center gap-1"
                    >
                      <ArrowUp className="w-4 h-4" />
                      Наверх
                    </Button>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-6 bg-orange-500 hover:bg-orange-600">
              Мини установка ГНБ • Проколы до 100м • Диаметр до 400мм
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Проколы и прокладка коммуникаций <span className="text-orange-400">там, где не проедет большая техника</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto">
              Мини установка ГНБ для локальных проколов до 100 метров. Работаем в труднодоступных местах, 
              узких проездах, частном секторе. Прокладка труб диаметром 20-400мм методом горизонтального направленного бурения.
            </p>
            
            {/* Технические характеристики */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-2">
                  <Ruler className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-sm text-blue-100">Длина прокола</p>
                <p className="font-bold text-lg">до 100м</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-sm text-blue-100">Диаметр труб</p>
                <p className="font-bold text-lg">20-400мм</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-2">
                  <Home className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-sm text-blue-100">Локальные работы</p>
                <p className="font-bold text-lg">Частный сектор</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-2">
                  <Settings className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-sm text-blue-100">Компактность</p>
                <p className="font-bold text-lg">Мини установка</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CallbackForm 
                trigger={
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-4">
                <Calculator className="w-5 h-5 mr-2" />
                    Рассчитать стоимость прокола
              </Button>
                }
              />
              <CallbackForm 
                trigger={
              <Button
                size="lg"
                variant="outline"
                className="border-white text-black hover:bg-white hover:text-blue-900 text-lg px-8 py-4"
              >
                <Phone className="w-5 h-5 mr-2" />
                    Консультация по ГНБ
              </Button>
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Positioning Section */}
      <section className="py-16 bg-gradient-to-r from-orange-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Мини установка ГНБ - альтернатива большой технике
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Когда большие буровые установки не могут подъехать или их использование экономически нецелесообразно
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <Card className="border-2 border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-700">
                    <Truck className="w-6 h-6 mr-2" />
                    Большие установки ГНБ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-red-600">
                    <li>• Проколы от 500+ метров</li>
                    <li>• Диаметр труб от 500мм</li>
                    <li>• Нужны широкие проезды</li>
                    <li>• Высокая стоимость</li>
                    <li>• Долгая мобилизация</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <Settings className="w-6 h-6 mr-2" />
                    Наша мини установка ГНБ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-green-600">
                    <li>✓ Проколы 10-100 метров</li>
                    <li>✓ Диаметр труб 20-400мм</li>
                    <li>✓ Проезд от 2.5 метров</li>
                    <li>✓ Доступная стоимость</li>
                    <li>✓ Быстрый выезд</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Преимущества мини установки ГНБ
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Специализируемся на локальных проколах и прокладке коммуникаций в труднодоступных местах
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Home className="w-8 h-8" />,
                title: "Работа в частном секторе",
                description: "Проезжаем там, где не пройдет большая техника. Узкие улицы, дворы, участки",
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Точность проколов",
                description: "Высокая точность позиционирования при проколах до 100 метров",
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Быстрая мобилизация",
                description: "Приезжаем и начинаем работы в тот же день. Минимум подготовки",
              },
              {
                icon: <Settings className="w-8 h-8" />,
                title: "Компактное оборудование",
                description: "Мини установка ГНБ занимает минимум места на участке",
              },
            ].map((advantage, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    {advantage.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{advantage.title}</h3>
                  <p className="text-gray-600">{advantage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services - Динамические данные */}
      <section id="services" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Услуги мини установки ГНБ
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Полный спектр работ по прокладке коммуникаций методом горизонтального направленного бурения 
              и открытым способом. Диаметр труб 20-400мм, длина проколов до 100 метров
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={service.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="aspect-video relative">
                  <Image 
                    src={service.image} 
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-600 text-white">{service.diameter}</Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-orange-500 text-white">{service.price}</Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">{service.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-1 mb-4">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full group-hover:bg-blue-600">
                    Заказать услугу
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Work Process - Динамические данные */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Этапы работ мини установкой ГНБ
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Пошаговый процесс выполнения проколов и прокладки коммуникаций 
              горизонтальным направленным бурением до 100 метров
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workSteps.map((step, index) => (
              <div key={step.id} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio - Динамические данные */}
      <section id="portfolio" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Примеры проколов мини установкой ГНБ
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Реализованные проекты в частном секторе и локальных объектах. 
              Работы в труднодоступных местах диаметром до 400мм на расстояние до 100 метров
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolio.map((project, index) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative h-48">
                  <Image 
                    src={project.image || "/placeholder.svg"} 
                    alt={project.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-600 text-white text-xs">{project.specs}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{project.title}</h3>
                  <p className="text-gray-600 text-sm">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Отзывы о работе мини установки ГНБ
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Что говорят владельцы частных домов и локальных объектов о наших проколах
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ - Динамические данные */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Вопросы о мини установке ГНБ
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ответы на популярные вопросы о горизонтальном направленном бурении мини установкой, 
              проколах до 100 метров и прокладке труб диаметром до 400мм
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible>
              {faq.map((item, index) => (
                <AccordionItem key={item.id} value={`item-${index + 1}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>
                    {item.answer}
                </AccordionContent>
              </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* About Company */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              О компании {contactInfo?.companyName || 'ГНБ-Эксперт'}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Специализируемся на горизонтальном направленном бурении мини установкой. 
              Решаем задачи прокладки коммуникаций там, где большая техника бессильна.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
                <p className="text-gray-600">Проколов выполнено</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">100м</div>
                <p className="text-gray-600">Максимальная длина прокола</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">400мм</div>
                <p className="text-gray-600">Максимальный диаметр</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Наша специализация</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Проколы мини установкой ГНБ до 100 метров</li>
                  <li>• Работа в частном секторе и труднодоступных местах</li>
                  <li>• Прокладка труб диаметром 20-400мм</li>
                  <li>• Санация старых трубопроводов</li>
                  <li>• Установка колодцев с подводкой коммуникаций</li>
                  <li>• Открытые траншейные работы экскаватором</li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Преимущества работы с нами</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Компактная техника для узких проездов</li>
                  <li>• Быстрая мобилизация мини установки</li>
                  <li>• Доступные цены на локальные проколы</li>
                  <li>• Работаем в Москве и Московской области</li>
                  <li>• Гарантия на все виды работ</li>
                  <li>• Помощь в оформлении разрешений</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contacts" className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Консультация по мини установке ГНБ
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Получите бесплатную консультацию по проколам до 100 метров и прокладке труб диаметром до 400мм. 
                Наш специалист ответит на все вопросы и рассчитает стоимость работ.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Phone className="w-6 h-6 text-orange-400" />
                  <div>
                    <a 
                      href={`tel:${contactInfo?.phone?.replace(/[^\d+]/g, '') || '+74951234567'}`} 
                      className="text-lg block text-white hover:text-blue-200 transition-colors"
                    >
                      {contactInfo?.phone || '+7 (495) 123-45-67'}
                    </a>
                    <span className="text-sm text-blue-200">Звонки принимаем с 8:00 до 20:00</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-orange-400" />
                  <div>
                    <a href={`mailto:${contactInfo?.email || 'info@gnb-expert.ru'}`} className="text-lg block text-white hover:text-blue-200 transition-colors">
                      {contactInfo?.email || 'info@gnb-expert.ru'}
                    </a>
                    <span className="text-sm text-blue-200">Ответим в течение часа</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-orange-400" />
                  <div>
                    <span className="text-lg block">{contactInfo?.address || 'Москва и Московская область'}</span>
                    <span className="text-sm text-blue-200">Выезд на объект в день обращения</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-800/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Работаем с мини установкой ГНБ:</h3>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>✓ Проколы от 10 до 100 метров</li>
                  <li>✓ Диаметр труб 20-400мм</li>
                  <li>✓ Частный сектор и труднодоступные места</li>
                  <li>✓ Узкие проезды от 2.5 метров</li>
                </ul>
              </div>
            </div>

            <Card className="bg-white text-gray-900">
              <CardHeader>
                <CardTitle>Заказать расчет стоимости прокола ГНБ</CardTitle>
                <CardDescription>
                  Укажите ваши контакты и детали проекта - рассчитаем стоимость прокола мини установкой
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formSuccess ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Заявка отправлена!
                      </h3>
                      <p className="text-gray-600">
                        Мы рассчитаем стоимость и свяжемся с вами в ближайшее время
                      </p>
                    </div>
                  ) : (
                    <>
                  <Input
                    placeholder="Ваше имя"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                        disabled={formLoading}
                  />
                  <Input
                        placeholder="Телефон для связи"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                        disabled={formLoading}
                  />
                  <Textarea
                        placeholder="Опишите задачу: что нужно проложить, диаметр, длина прокола, адрес объекта"
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        rows={4}
                        disabled={formLoading}
                  />
                      <Button 
                        type="submit" 
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        disabled={formLoading}
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        {formLoading ? 'Отправляем...' : 'Получить расчет стоимости ГНБ'}
                  </Button>
                      <p className="text-xs text-gray-500 text-center">
                        Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                      </p>
                    </>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">{contactInfo?.companyName || 'ГНБ-Эксперт'}</span>
              </div>
              <p className="text-gray-400 mb-4">
                Профессиональные услуги горизонтального направленного бурения мини установкой. 
                Проколы до 100 метров, диаметром до 400мм в частном секторе и труднодоступных местах.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Услуги мини ГНБ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#services" className="hover:text-white transition-colors">
                    Проколы под дорогами
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="hover:text-white transition-colors">
                    Прокладка канализации
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="hover:text-white transition-colors">
                    Прокладка газопровода
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="hover:text-white transition-colors">
                    Прокладка кабеля
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="hover:text-white transition-colors">
                    Санация труб
                  </Link>
                </li>
                <li>
                  <Link href="#services" className="hover:text-white transition-colors">
                    Установка колодцев
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Информация</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#about" className="hover:text-white transition-colors">
                    О компании
                  </Link>
                </li>
                <li>
                  <Link href="#portfolio" className="hover:text-white transition-colors">
                    Примеры работ
                  </Link>
                </li>
                <li>
                  <Link href="/articles" className="hover:text-white transition-colors">
                    Статьи о ГНБ
                  </Link>
                </li>
                <li>
                  <Link href="#contacts" className="hover:text-white transition-colors">
                    Контакты
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white transition-colors text-xs">
                    Админ-панель
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Контакты</h3>
              <div className="space-y-2 text-gray-400">
                <a 
                  href={`tel:${contactInfo?.phone?.replace(/[^\d+]/g, '') || '+74951234567'}`} 
                  className="font-medium text-white hover:text-blue-300 transition-colors block"
                >
                  {contactInfo?.phone || '+7 (495) 123-45-67'}
                </a>
                <a href={`mailto:${contactInfo?.email || 'info@gnb-expert.ru'}`} className="hover:text-white transition-colors">
                  {contactInfo?.email || 'info@gnb-expert.ru'}
                </a>
                <p>{contactInfo?.address || 'Москва и Московская область'}</p>
                <p className="text-sm">{contactInfo?.workingHours || 'Работаем: Пн-Вс 8:00-20:00'}</p>
              </div>
              
              <div className="mt-4 p-3 bg-blue-900 rounded-lg">
                <p className="text-sm text-blue-200 font-medium">Мини установка ГНБ</p>
                <p className="text-xs text-blue-300">Проколы 10-100м • Ø20-400мм</p>
                <p className="text-xs text-blue-300">Частный сектор • Узкие проезды</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
              <p>&copy; 2024 {contactInfo?.companyName || 'ГНБ-Эксперт'}. Все права защищены.</p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <span>Мини установка ГНБ</span>
                <span>•</span>
                <span>Проколы до 100м</span>
                <span>•</span>
                <span>Диаметр до 400мм</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Fixed Scroll to Top Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg" 
          className="bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg"
          onClick={scrollToTop}
          title="Подняться наверх"
        >
          <ArrowUp className="w-6 h-6" />
        </Button>
      </div>

      {/* JSON-LD Structured Data для SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": contactInfo?.companyName || "ГНБ-Эксперт",
            "description": contactInfo?.companyDescription || "Профессиональные услуги горизонтального направленного бурения мини установкой. Проколы до 100 метров, диаметр труб 20-400мм в частном секторе и труднодоступных местах.",
            "url": "https://gnb-expert.ru",
            "telephone": contactInfo?.phone || "+7-495-123-45-67",
            "email": contactInfo?.email || "info@gnb-expert.ru",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Москва",
              "addressRegion": "Московская область", 
              "addressCountry": "RU"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "55.7558",
              "longitude": "37.6176"
            },
            "openingHours": "Mo-Su 08:00-20:00",
            "priceRange": "от 900-2500 руб/м",
            "serviceArea": {
              "@type": "GeoCircle",
              "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": "55.7558",
                "longitude": "37.6176"
              },
              "geoRadius": "100000"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Услуги мини установки ГНБ",
              "itemListElement": [
                {
                  "@type": "OfferCatalog",
                  "name": "Проколы под дорогами",
                  "description": "Горизонтальное направленное бурение под дорогами диаметром 20-400мм, длина до 100м"
                },
                {
                  "@type": "OfferCatalog", 
                  "name": "Прокладка канализации ГНБ",
                  "description": "Бестраншейная прокладка канализационных труб диаметром 110-400мм мини установкой"
                },
                {
                  "@type": "OfferCatalog",
                  "name": "Прокладка газопровода",
                  "description": "Прокладка газовых труб ПНД диаметром 32-315мм методом ГНБ"
                },
                {
                  "@type": "OfferCatalog",
                  "name": "Санация труб",
                  "description": "Восстановление трубопроводов диаметром 50-400мм без демонтажа"
                }
              ]
            },
            "areaServed": ["Москва", "Московская область", "частный сектор", "коттеджные поселки", "дачные участки"],
            "keywords": ["ГНБ мини установка", "проколы под дорогой", "горизонтальное направленное бурение", "прокладка канализации", "прокладка газа", "бестраншейная прокладка", "частный сектор", "локальные проколы", "труднодоступные места"]
          })
        }}
      />
    </div>
  )
}
