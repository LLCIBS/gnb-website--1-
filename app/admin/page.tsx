"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import { 
  Lock, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Settings,
  FileText,
  Images,
  HelpCircle,
  Briefcase,
  BookOpen,
  Phone
} from 'lucide-react'
import type { Service, WorkStep, PortfolioProject, FAQItem, Article, ContactInfo, CallbackRequest } from '@/lib/data'

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Данные для управления
  const [services, setServices] = useState<Service[]>([])
  const [workSteps, setWorkSteps] = useState<WorkStep[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([])
  const [faq, setFaq] = useState<FAQItem[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [callbackRequests, setCallbackRequests] = useState<CallbackRequest[]>([])
  
  // Состояния диалогов
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [editingWorkStep, setEditingWorkStep] = useState<WorkStep | null>(null)
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioProject | null>(null)
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [editingContacts, setEditingContacts] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (authenticated) {
      loadData()
    }
  }, [authenticated])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth')
      const data = await response.json()
      setAuthenticated(data.authenticated)
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error)
    }
    setLoading(false)
  }

  const login = async () => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      if (response.ok) {
        setAuthenticated(true)
        setPassword('')
      } else {
        alert('Неверный пароль')
      }
    } catch (error) {
      console.error('Ошибка авторизации:', error)
      alert('Ошибка авторизации')
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE'
      })
      setAuthenticated(false)
    } catch (error) {
      console.error('Ошибка выхода:', error)
    }
  }

  const loadData = async () => {
    try {
      const [servicesRes, workStepsRes, portfolioRes, faqRes, articlesRes, contactsRes, callbackRes] = await Promise.all([
        fetch('/api/admin/services'),
        fetch('/api/admin/work-steps'),
        fetch('/api/admin/portfolio'),
        fetch('/api/admin/faq'),
        fetch('/api/admin/articles'),
        fetch('/api/admin/contacts'),
        fetch('/api/admin/callback-requests')
      ])

      setServices(await servicesRes.json())
      setWorkSteps(await workStepsRes.json())
      setPortfolio(await portfolioRes.json())
      setFaq(await faqRes.json())
      setArticles(await articlesRes.json())
      setContactInfo(await contactsRes.json())
      setCallbackRequests(await callbackRes.json())
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    }
  }

  const saveServices = async () => {
    try {
      await fetch('/api/admin/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(services)
      })
      alert('Услуги сохранены!')
    } catch (error) {
      console.error('Ошибка сохранения услуг:', error)
      alert('Ошибка сохранения')
    }
  }

  const saveWorkSteps = async () => {
    try {
      await fetch('/api/admin/work-steps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workSteps)
      })
      alert('Этапы работ сохранены!')
    } catch (error) {
      console.error('Ошибка сохранения этапов работ:', error)
      alert('Ошибка сохранения')
    }
  }

  const savePortfolio = async () => {
    try {
      await fetch('/api/admin/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portfolio)
      })
      alert('Портфолио сохранено!')
    } catch (error) {
      console.error('Ошибка сохранения портфолио:', error)
      alert('Ошибка сохранения')
    }
  }

  const saveFAQ = async () => {
    try {
      await fetch('/api/admin/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faq)
      })
      alert('FAQ сохранены!')
    } catch (error) {
      console.error('Ошибка сохранения FAQ:', error)
      alert('Ошибка сохранения')
    }
  }

  const saveArticles = async () => {
    try {
      await fetch('/api/admin/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articles)
      })
      alert('Статьи сохранены!')
    } catch (error) {
      console.error('Ошибка сохранения статей:', error)
      alert('Ошибка сохранения')
    }
  }

  const saveContacts = async () => {
    if (!contactInfo) return
    
    try {
      await fetch('/api/admin/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactInfo)
      })
      alert('Контакты сохранены!')
      setEditingContacts(false)
    } catch (error) {
      console.error('Ошибка сохранения контактов:', error)
      alert('Ошибка сохранения')
    }
  }

  const saveCallbackRequests = async () => {
    try {
      await fetch('/api/admin/callback-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callbackRequests)
      })
      alert('Заявки сохранены!')
    } catch (error) {
      console.error('Ошибка сохранения заявок:', error)
      alert('Ошибка сохранения')
    }
  }

  // Функции для управления услугами
  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      title: '',
      description: '',
      image: '',
      price: '',
      diameter: '',
      features: []
    }
    setEditingService(newService)
  }

  const saveService = () => {
    if (!editingService) return
    
    if (services.find(s => s.id === editingService.id)) {
      setServices(services.map(s => s.id === editingService.id ? editingService : s))
    } else {
      setServices([...services, editingService])
    }
    setEditingService(null)
  }

  const deleteService = (id: string) => {
    if (confirm('Удалить услугу?')) {
      setServices(services.filter(s => s.id !== id))
    }
  }

  // Функции для управления этапами работ
  const addWorkStep = () => {
    const newWorkStep: WorkStep = {
      id: Date.now().toString(),
      step: (workSteps.length + 1).toString().padStart(2, '0'),
      title: '',
      description: ''
    }
    setEditingWorkStep(newWorkStep)
  }

  const saveWorkStep = () => {
    if (!editingWorkStep) return
    
    if (workSteps.find(s => s.id === editingWorkStep.id)) {
      setWorkSteps(workSteps.map(s => s.id === editingWorkStep.id ? editingWorkStep : s))
    } else {
      setWorkSteps([...workSteps, editingWorkStep])
    }
    setEditingWorkStep(null)
  }

  const deleteWorkStep = (id: string) => {
    if (confirm('Удалить этап работы?')) {
      setWorkSteps(workSteps.filter(s => s.id !== id))
    }
  }

  // Функции для управления портфолио
  const addPortfolioProject = () => {
    const newProject: PortfolioProject = {
      id: Date.now().toString(),
      title: '',
      description: '',
      image: '',
      specs: ''
    }
    setEditingPortfolio(newProject)
  }

  const savePortfolioProject = () => {
    if (!editingPortfolio) return
    
    if (portfolio.find(p => p.id === editingPortfolio.id)) {
      setPortfolio(portfolio.map(p => p.id === editingPortfolio.id ? editingPortfolio : p))
    } else {
      setPortfolio([...portfolio, editingPortfolio])
    }
    setEditingPortfolio(null)
  }

  const deletePortfolioProject = (id: string) => {
    if (confirm('Удалить проект из портфолио?')) {
      setPortfolio(portfolio.filter(p => p.id !== id))
    }
  }

  // Функции для управления FAQ
  const addFAQItem = () => {
    const newFAQ: FAQItem = {
      id: Date.now().toString(),
      question: '',
      answer: ''
    }
    setEditingFAQ(newFAQ)
  }

  const saveFAQItem = () => {
    if (!editingFAQ) return
    
    if (faq.find(f => f.id === editingFAQ.id)) {
      setFaq(faq.map(f => f.id === editingFAQ.id ? editingFAQ : f))
    } else {
      setFaq([...faq, editingFAQ])
    }
    setEditingFAQ(null)
  }

  const deleteFAQItem = (id: string) => {
    if (confirm('Удалить вопрос из FAQ?')) {
      setFaq(faq.filter(f => f.id !== id))
    }
  }

  // Функции для управления статьями
  const addArticle = () => {
    const newArticle: Article = {
      id: Date.now().toString(),
      title: '',
      description: '',
      content: '',
      image: '',
      category: '',
      readTime: '',
      publishedAt: new Date().toISOString().split('T')[0],
      slug: ''
    }
    setEditingArticle(newArticle)
  }

  const saveArticle = () => {
    if (!editingArticle) return
    
    // Генерируем slug из заголовка если не указан
    if (!editingArticle.slug && editingArticle.title) {
      editingArticle.slug = editingArticle.title
        .toLowerCase()
        .replace(/[^a-zа-я0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    }
    
    if (articles.find(a => a.id === editingArticle.id)) {
      setArticles(articles.map(a => a.id === editingArticle.id ? editingArticle : a))
    } else {
      setArticles([...articles, editingArticle])
    }
    setEditingArticle(null)
  }

  const deleteArticle = (id: string) => {
    if (confirm('Удалить статью?')) {
      setArticles(articles.filter(a => a.id !== id))
    }
  }

  // Функции для управления заявками на звонки
  const updateCallbackStatus = (id: string, status: 'new' | 'contacted' | 'completed') => {
    setCallbackRequests(callbackRequests.map(req => 
      req.id === id ? { ...req, status } : req
    ))
  }

  const deleteCallbackRequest = (id: string) => {
    if (confirm('Удалить заявку?')) {
      setCallbackRequests(callbackRequests.filter(req => req.id !== id))
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-600'
      case 'contacted': return 'bg-yellow-600'
      case 'completed': return 'bg-green-600'
      default: return 'bg-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Новая'
      case 'contacted': return 'Связались'
      case 'completed': return 'Завершена'
      default: return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'callback': return 'Обратный звонок'
      case 'calculation': return 'Расчет стоимости'
      default: return type
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'callback': return 'bg-blue-600'
      case 'calculation': return 'bg-purple-600'
      default: return 'bg-gray-600'
    }
  }

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

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <CardTitle>Админ-панель ГНБ-Эксперт</CardTitle>
            <CardDescription>Введите пароль для доступа</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && login()}
              />
              <Button onClick={login} className="w-full">
                Войти
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Админ-панель</h1>
              <p className="text-gray-600">Управление контентом сайта</p>
            </div>
            <Button onClick={logout} variant="outline" className="flex items-center gap-2 self-start sm:self-auto">
              <Lock className="w-4 h-4" />
              Выйти
            </Button>
          </div>
        </div>

        <Tabs defaultValue="services" className="w-full">
          <div className="overflow-x-auto mb-6">
            <TabsList className="grid w-full grid-cols-7 min-w-[700px] md:min-w-0">
              <TabsTrigger value="services" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Briefcase className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Услуги</span>
              </TabsTrigger>
              <TabsTrigger value="work-steps" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <FileText className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Этапы</span>
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Images className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Портфолио</span>
              </TabsTrigger>
              <TabsTrigger value="faq" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <HelpCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">FAQ</span>
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Статьи</span>
              </TabsTrigger>
              <TabsTrigger value="contacts" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Phone className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Контакты</span>
              </TabsTrigger>
              <TabsTrigger value="callback-requests" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Settings className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Заявки</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Услуги */}
          <TabsContent value="services">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Услуги мини установки ГНБ</CardTitle>
                  <CardDescription>Управление услугами компании</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                  <Button onClick={addService} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить
                  </Button>
                  <Button onClick={saveServices} variant="outline" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {services.map((service) => (
                    <Card key={service.id} className="p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold">{service.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge>{service.diameter}</Badge>
                            <Badge variant="outline">{service.price}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 self-end md:self-start">
                          <Button size="sm" variant="outline" onClick={() => setEditingService(service)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteService(service.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Этапы работ */}
          <TabsContent value="work-steps">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Этапы работ мини установкой ГНБ</CardTitle>
                  <CardDescription>Управление этапами выполнения работ</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addWorkStep}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить этап
                  </Button>
                  <Button onClick={saveWorkSteps} variant="outline">
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить изменения
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {workSteps.map((step) => (
                    <Card key={step.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 flex gap-4">
                          <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {step.step}
                          </div>
                          <div>
                            <h3 className="font-semibold">{step.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingWorkStep(step)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteWorkStep(step.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Портфолио */}
          <TabsContent value="portfolio">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Примеры проколов мини установкой ГНБ</CardTitle>
                  <CardDescription>Управление проектами в портфолио</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addPortfolioProject}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить проект
                  </Button>
                  <Button onClick={savePortfolio} variant="outline">
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить изменения
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {portfolio.map((project) => (
                    <Card key={project.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                          <Badge className="mt-2">{project.specs}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingPortfolio(project)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deletePortfolioProject(project.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Вопросы о мини установке ГНБ</CardTitle>
                  <CardDescription>Управление часто задаваемыми вопросами</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addFAQItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить вопрос
                  </Button>
                  <Button onClick={saveFAQ} variant="outline">
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить изменения
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {faq.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.question}</h3>
                          <p className="text-sm text-gray-600 mt-1">{item.answer}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingFAQ(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteFAQItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Статьи */}
          <TabsContent value="articles">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Статьи о ГНБ технологиях</CardTitle>
                  <CardDescription>Управление статьями и материалами сайта</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addArticle}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить статью
                  </Button>
                  <Button onClick={saveArticles} variant="outline">
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить изменения
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {articles.map((article) => (
                    <Card key={article.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{article.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{article.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge>{article.category}</Badge>
                            <Badge variant="outline">{article.readTime}</Badge>
                            <Badge variant="secondary">{new Date(article.publishedAt).toLocaleDateString('ru-RU')}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingArticle(article)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteArticle(article.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Контакты */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Контакты и информация о компании</CardTitle>
                  <CardDescription>Управление контактной информацией на сайте</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setEditingContacts(true)} disabled={!contactInfo}>
                    <Edit className="w-4 h-4 mr-2" />
                    Редактировать
                  </Button>
                  <Button onClick={saveContacts} variant="outline" disabled={!contactInfo}>
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить изменения
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {contactInfo && (
                  <div className="space-y-6">
                    <Card className="p-4">
                      <h3 className="font-semibold text-lg mb-4">Основная информация</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Название компании:</strong>
                          <p className="text-gray-600">{contactInfo.companyName}</p>
                        </div>
                        <div>
                          <strong>Телефон:</strong>
                          <p className="text-gray-600">{contactInfo.phone}</p>
                        </div>
                        <div>
                          <strong>Email:</strong>
                          <p className="text-gray-600">{contactInfo.email}</p>
                        </div>
                        <div>
                          <strong>Режим работы:</strong>
                          <p className="text-gray-600">{contactInfo.workingHours}</p>
                        </div>
                        <div className="md:col-span-2">
                          <strong>Адрес:</strong>
                          <p className="text-gray-600">{contactInfo.address}</p>
                        </div>
                        <div className="md:col-span-2">
                          <strong>Описание:</strong>
                          <p className="text-gray-600">{contactInfo.companyDescription}</p>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <h3 className="font-semibold text-lg mb-4">Социальные сети</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Telegram:</strong>
                          <p className="text-gray-600">{contactInfo.socialMedia.telegram || 'Не указан'}</p>
                        </div>
                        <div>
                          <strong>WhatsApp:</strong>
                          <p className="text-gray-600">{contactInfo.socialMedia.whatsapp || 'Не указан'}</p>
                        </div>
                        <div>
                          <strong>ВКонтакте:</strong>
                          <p className="text-gray-600">{contactInfo.socialMedia.vk || 'Не указан'}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Заявки на звонки */}
          <TabsContent value="callback-requests">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Заявки на обратный звонок</CardTitle>
                  <CardDescription>Управление заявками от клиентов</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveCallbackRequests} variant="outline">
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить изменения
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {callbackRequests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Phone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Заявок пока нет</p>
                    </div>
                  ) : (
                    callbackRequests.map((request) => (
                      <Card key={request.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{request.name}</h3>
                              <Badge className={`${getTypeBadgeColor(request.type)} text-white`}>
                                {getTypeText(request.type)}
                              </Badge>
                              <Badge className={`${getStatusBadgeColor(request.status)} text-white`}>
                                {getStatusText(request.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              <Phone className="w-4 h-4 inline mr-1" />
                              {request.phone}
                            </p>
                            {request.message && (
                              <p className="text-sm text-gray-700 mb-2">
                                <strong>Комментарий:</strong> {request.message}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {new Date(request.createdAt).toLocaleString('ru-RU')}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <select
                              value={request.status}
                              onChange={(e) => updateCallbackStatus(request.id, e.target.value as any)}
                              className="text-sm border rounded px-2 py-1"
                            >
                              <option value="new">Новая</option>
                              <option value="contacted">Связались</option>
                              <option value="completed">Завершена</option>
                            </select>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deleteCallbackRequest(request.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Диалоги редактирования */}
        {/* Диалог редактирования услуги */}
        <Dialog open={editingService !== null} onOpenChange={() => setEditingService(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>
                {editingService?.title ? 'Редактировать услугу' : 'Добавить услугу'}
              </DialogTitle>
            </DialogHeader>
            {editingService && (
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="service-title">Название услуги</Label>
                  <Input
                    id="service-title"
                    value={editingService.title}
                    onChange={(e) => setEditingService({...editingService, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="service-description">Описание</Label>
                  <Textarea
                    id="service-description"
                    value={editingService.description}
                    onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service-price">Цена</Label>
                    <Input
                      id="service-price"
                      value={editingService.price}
                      onChange={(e) => setEditingService({...editingService, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="service-diameter">Диаметр</Label>
                    <Input
                      id="service-diameter"
                      value={editingService.diameter}
                      onChange={(e) => setEditingService({...editingService, diameter: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <ImageUpload
                    label="Изображение услуги"
                    value={editingService.image}
                    onChange={(value) => setEditingService({...editingService, image: value})}
                    placeholder="Путь к изображению или загрузите файл"
                  />
                </div>
                <div>
                  <Label htmlFor="service-features">Особенности (по одной на строку)</Label>
                  <Textarea
                    id="service-features"
                    value={editingService.features.join('\n')}
                    onChange={(e) => setEditingService({
                      ...editingService, 
                      features: e.target.value.split('\n').filter(f => f.trim())
                    })}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={saveService} className="flex-1">Сохранить</Button>
                  <Button variant="outline" onClick={() => setEditingService(null)} className="flex-1">Отмена</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Остальные диалоги... */}
        
        {/* Диалог редактирования контактов */}
        <Dialog open={editingContacts} onOpenChange={setEditingContacts}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>Редактировать контактную информацию</DialogTitle>
            </DialogHeader>
            {contactInfo && (
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="company-name">Название компании</Label>
                  <Input
                    id="company-name"
                    value={contactInfo.companyName}
                    onChange={(e) => setContactInfo({...contactInfo, companyName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="company-description">Описание компании</Label>
                  <Textarea
                    id="company-description"
                    value={contactInfo.companyDescription}
                    onChange={(e) => setContactInfo({...contactInfo, companyDescription: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Адрес</Label>
                  <Input
                    id="address"
                    value={contactInfo.address}
                    onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="working-hours">Режим работы</Label>
                  <Input
                    id="working-hours"
                    value={contactInfo.workingHours}
                    onChange={(e) => setContactInfo({...contactInfo, workingHours: e.target.value})}
                  />
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Социальные сети</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telegram">Telegram</Label>
                      <Input
                        id="telegram"
                        value={contactInfo.socialMedia.telegram || ''}
                        onChange={(e) => setContactInfo({
                          ...contactInfo, 
                          socialMedia: {...contactInfo.socialMedia, telegram: e.target.value}
                        })}
                        placeholder="@username или ссылка"
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={contactInfo.socialMedia.whatsapp || ''}
                        onChange={(e) => setContactInfo({
                          ...contactInfo, 
                          socialMedia: {...contactInfo.socialMedia, whatsapp: e.target.value}
                        })}
                        placeholder="+7 (xxx) xxx-xx-xx"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vk">ВКонтакте</Label>
                    <Input
                      id="vk"
                      value={contactInfo.socialMedia.vk || ''}
                      onChange={(e) => setContactInfo({
                        ...contactInfo, 
                        socialMedia: {...contactInfo.socialMedia, vk: e.target.value}
                      })}
                      placeholder="Ссылка на группу или профиль"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={saveContacts} className="flex-1">Сохранить</Button>
                  <Button variant="outline" onClick={() => setEditingContacts(false)} className="flex-1">Отмена</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 