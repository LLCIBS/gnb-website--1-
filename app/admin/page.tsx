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
import { useToast } from "@/hooks/use-toast"
import type { Service, WorkStep, PortfolioProject, FAQItem, Article, ContactInfo, CallbackRequest } from '@/lib/data'

export default function AdminPage() {
  const { toast } = useToast()
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
        toast({
          title: "Ошибка",
          description: "Неверный пароль",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Ошибка авторизации:', error)
      toast({
        title: "Ошибка",
        description: "Ошибка авторизации",
        variant: "destructive"
      })
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
      toast({
        title: "Успех",
        description: "Все услуги сохранены!",
        variant: "default"
      })
    } catch (error) {
      console.error('Ошибка сохранения услуг:', error)
      toast({
        title: "Ошибка",
        description: "Ошибка сохранения услуг",
        variant: "destructive"
      })
    }
  }

  const saveWorkSteps = async () => {
    try {
      await fetch('/api/admin/work-steps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workSteps)
      })
      toast({
        title: "Успех",
        description: "Все этапы работ сохранены!",
        variant: "default"
      })
    } catch (error) {
      console.error('Ошибка сохранения этапов работ:', error)
      toast({
        title: "Ошибка",
        description: "Ошибка сохранения этапов работ",
        variant: "destructive"
      })
    }
  }

  const savePortfolio = async () => {
    try {
      await fetch('/api/admin/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portfolio)
      })
      toast({
        title: "Успех",
        description: "Все портфолио сохранено!",
        variant: "default"
      })
    } catch (error) {
      console.error('Ошибка сохранения портфолио:', error)
      toast({
        title: "Ошибка",
        description: "Ошибка сохранения портфолио",
        variant: "destructive"
      })
    }
  }

  const saveFAQ = async () => {
    try {
      await fetch('/api/admin/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faq)
      })
      toast({
        title: "Успех",
        description: "Все FAQ сохранены!",
        variant: "default"
      })
    } catch (error) {
      console.error('Ошибка сохранения FAQ:', error)
      toast({
        title: "Ошибка",
        description: "Ошибка сохранения FAQ",
        variant: "destructive"
      })
    }
  }

  const saveArticles = async () => {
    try {
      await fetch('/api/admin/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articles)
      })
      toast({
        title: "Успех",
        description: "Все статьи сохранены!",
        variant: "default"
      })
    } catch (error) {
      console.error('Ошибка сохранения статей:', error)
      toast({
        title: "Ошибка",
        description: "Ошибка сохранения статей",
        variant: "destructive"
      })
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
      toast({
        title: "Успех",
        description: "Контакты сохранены!",
        variant: "default"
      })
      setEditingContacts(false)
    } catch (error) {
      console.error('Ошибка сохранения контактов:', error)
      toast({
        title: "Ошибка",
        description: "Ошибка сохранения контактов",
        variant: "destructive"
      })
    }
  }

  const saveCallbackRequests = async () => {
    try {
      await fetch('/api/admin/callback-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callbackRequests)
      })
      toast({
        title: "Успех",
        description: "Все заявки сохранены!",
        variant: "default"
      })
    } catch (error) {
      console.error('Ошибка сохранения заявок:', error)
      toast({
        title: "Ошибка",
        description: "Ошибка сохранения заявок",
        variant: "destructive"
      })
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

  const saveService = async () => {
    if (!editingService) return
    
    if (services.find(s => s.id === editingService.id)) {
      const updatedServices = services.map(s => s.id === editingService.id ? editingService : s)
      setServices(updatedServices)
      
      // Автосохранение на сервер
      try {
        await fetch('/api/admin/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedServices)
        })
        toast({
          title: "Успех",
          description: "Услуга успешно обновлена!",
          variant: "default"
        })
      } catch (error) {
        console.error('Ошибка сохранения услуги:', error)
        toast({
          title: "Ошибка",
          description: "Ошибка сохранения услуги",
          variant: "destructive"
        })
      }
    } else {
      const updatedServices = [...services, editingService]
      setServices(updatedServices)
      
      // Автосохранение на сервер
      try {
        await fetch('/api/admin/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedServices)
        })
        toast({
          title: "Успех",
          description: "Услуга успешно добавлена!",
          variant: "default"
        })
      } catch (error) {
        console.error('Ошибка сохранения услуги:', error)
        toast({
          title: "Ошибка",
          description: "Ошибка сохранения услуги",
          variant: "destructive"
        })
      }
    }
    setEditingService(null)
  }

  const deleteService = async (id: string) => {
    if (confirm('Удалить услугу?')) {
      const updatedServices = services.filter(s => s.id !== id)
      setServices(updatedServices)
      
      // Автосохранение на сервер
      try {
        await fetch('/api/admin/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedServices)
        })
        toast({
          title: "Успех",
          description: "Услуга успешно удалена!",
          variant: "default"
        })
      } catch (error) {
        console.error('Ошибка сохранения услуг:', error)
        toast({
          title: "Ошибка",
          description: "Ошибка удаления услуги",
          variant: "destructive"
        })
      }
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

  const saveWorkStep = async () => {
    if (!editingWorkStep) return
    
    if (workSteps.find(s => s.id === editingWorkStep.id)) {
      const updatedWorkSteps = workSteps.map(s => s.id === editingWorkStep.id ? editingWorkStep : s)
      setWorkSteps(updatedWorkSteps)
      
      // Автосохранение на сервер
      try {
        await fetch('/api/admin/work-steps', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedWorkSteps)
        })
        toast({
          title: "Успех",
          description: "Этап работы успешно обновлен!",
          variant: "default"
        })
      } catch (error) {
        console.error('Ошибка сохранения этапа работы:', error)
        toast({
          title: "Ошибка",
          description: "Ошибка сохранения этапа работы",
          variant: "destructive"
        })
      }
    } else {
      const updatedWorkSteps = [...workSteps, editingWorkStep]
      setWorkSteps(updatedWorkSteps)
      
      // Автосохранение на сервер
      try {
        await fetch('/api/admin/work-steps', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedWorkSteps)
        })
        toast({
          title: "Успех",
          description: "Этап работы успешно добавлен!",
          variant: "default"
        })
      } catch (error) {
        console.error('Ошибка сохранения этапа работы:', error)
        toast({
          title: "Ошибка",
          description: "Ошибка сохранения этапа работы",
          variant: "destructive"
        })
      }
    }
    setEditingWorkStep(null)
  }

  const deleteWorkStep = async (id: string) => {
    if (confirm('Удалить этап работы?')) {
      const updatedWorkSteps = workSteps.filter(s => s.id !== id)
      setWorkSteps(updatedWorkSteps)
      
      // Автосохранение на сервер
      try {
        await fetch('/api/admin/work-steps', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedWorkSteps)
        })
        toast({
          title: "Успех",
          description: "Этап работы успешно удален!",
          variant: "default"
        })
      } catch (error) {
        console.error('Ошибка сохранения этапов работ:', error)
        toast({
          title: "Ошибка",
          description: "Ошибка удаления этапа работы",
          variant: "destructive"
        })
      }
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

  const savePortfolioProject = async () => {
    if (!editingPortfolio) return
    
    if (portfolio.find(p => p.id === editingPortfolio.id)) {
      const updatedPortfolio = portfolio.map(p => p.id === editingPortfolio.id ? editingPortfolio : p)
      setPortfolio(updatedPortfolio)
      
      // Автосохранение на сервер
      try {
        await fetch('/api/admin/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPortfolio)
        })
        toast({
          title: "Успех",
          description: "Проект портфолио успешно обновлен!",
          variant: "default"
        })
      } catch (error) {
        console.error('Ошибка сохранения проекта портфолио:', error)
        toast({
          title: "Ошибка",
          description: "Ошибка сохранения проекта портфолио",
          variant: "destructive"
        })
      }
    } else {
      const updatedPortfolio = [...portfolio, editingPortfolio]
      setPortfolio(updatedPortfolio)
      
      // Автосохранение на сервер
      try {
        await fetch('/api/admin/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPortfolio)
        })
        toast({
          title: "Успех",
          description: "Проект портфолио успешно добавлен!",
          variant: "default"
        })
      } catch (error) {
        console.error('Ошибка сохранения проекта портфолио:', error)
        toast({
          title: "Ошибка",
          description: "Ошибка сохранения проекта портфолио",
          variant: "destructive"
        })
      }
    }
    setEditingPortfolio(null)
  }

  const deletePortfolioProject = async (id: string) => {
    if (confirm('Удалить проект из портфолио?')) {
      const updatedPortfolio = portfolio.filter(p => p.id !== id)
      setPortfolio(updatedPortfolio)
      
      // Автосохранение на сервер
      try {
        await fetch('/api/admin/portfolio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPortfolio)
        })
        toast({
          title: "Успех",
          description: "Проект портфолио успешно удален!",
          variant: "default"
        })
      } catch (error) {
        console.error('Ошибка сохранения портфолио:', error)
        toast({
          title: "Ошибка",
          description: "Ошибка удаления проекта портфолио",
          variant: "destructive"
        })
      }
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

  const saveFAQItem = async () => {
    if (!editingFAQ) return
    
    if (faq.find(f => f.id === editingFAQ.id)) {
      const updatedFAQ = faq.map(f => f.id === editingFAQ.id ? editingFAQ : f)
      setFaq(updatedFAQ)
      
      // Автосохранение на сервер
      try {
        await fetch('/api/admin/faq', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFAQ)
        })
        toast({
          title: "Успех",
          description: "Вопрос FAQ успешно обновлен!",
          variant: "default"
        })
      } catch (error) {
        console.error('Ошибка сохранения FAQ:', error)
        toast({
          title: "Ошибка",
          description: "Ошибка сохранения вопроса FAQ",
          variant: "destructive"
        })
      }
    } else {
      const updatedFAQ = [...faq, editingFAQ]
      setFaq(updatedFAQ)
      
      // Автосохранение на сервер
      try {
        await fetch('/api/admin/faq', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFAQ)
        })
        toast({
          title: "Успех",
          description: "Вопрос FAQ успешно добавлен!",
          variant: "default"
        })
      } catch (error) {
        console.error('Ошибка сохранения FAQ:', error)
        toast({
          title: "Ошибка",
          description: "Ошибка сохранения вопроса FAQ",
          variant: "destructive"
        })
      }
    }
    setEditingFAQ(null)
  }

  const deleteFAQItem = async (id: string) => {
    if (confirm('Удалить вопрос из FAQ?')) {
      const updatedFAQ = faq.filter(f => f.id !== id)
      setFaq(updatedFAQ)
      
      // Автосохранение на сервер
      try {
        await fetch('/api/admin/faq', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFAQ)
        })
        toast({
          title: "Успех",
          description: "Вопрос FAQ успешно удален!",
          variant: "default"
        })
      } catch (error) {
        console.error('Ошибка сохранения FAQ:', error)
        toast({
          title: "Ошибка",
          description: "Ошибка удаления вопроса FAQ",
          variant: "destructive"
        })
      }
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

  const saveArticle = async () => {
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
      const updatedArticles = articles.map(a => a.id === editingArticle.id ? editingArticle : a)
      setArticles(updatedArticles)
      
      // Автосохранение на сервер
      try {
        await fetch('/api/admin/articles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedArticles)
        })
        toast({
          title: "Успех",
          description: "Статья успешно обновлена!",
          variant: "default"
        })
      } catch (error) {
        console.error('Ошибка сохранения статьи:', error)
        toast({
          title: "Ошибка",
          description: "Ошибка сохранения статьи",
          variant: "destructive"
        })
      }
    } else {
      const updatedArticles = [...articles, editingArticle]
      setArticles(updatedArticles)
      
      // Автосохранение на сервер
      try {
        await fetch('/api/admin/articles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedArticles)
        })
        toast({
          title: "Успех",
          description: "Статья успешно добавлена!",
          variant: "default"
        })
      } catch (error) {
        console.error('Ошибка сохранения статьи:', error)
        toast({
          title: "Ошибка",
          description: "Ошибка сохранения статьи",
          variant: "destructive"
        })
      }
    }
    setEditingArticle(null)
  }

  const deleteArticle = async (id: string) => {
    if (confirm('Удалить статью?')) {
      const updatedArticles = articles.filter(a => a.id !== id)
      setArticles(updatedArticles)
      
      // Автосохранение на сервер
      try {
        await fetch('/api/admin/articles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedArticles)
        })
        toast({
          title: "Успех",
          description: "Статья успешно удалена!",
          variant: "default"
        })
      } catch (error) {
        console.error('Ошибка сохранения статей:', error)
        toast({
          title: "Ошибка",
          description: "Ошибка удаления статьи",
          variant: "destructive"
        })
      }
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

        {/* Диалог редактирования этапа работы */}
        <Dialog open={editingWorkStep !== null} onOpenChange={() => setEditingWorkStep(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>
                {editingWorkStep?.title ? 'Редактировать этап работы' : 'Добавить этап работы'}
              </DialogTitle>
            </DialogHeader>
            {editingWorkStep && (
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="workstep-step">Номер этапа</Label>
                  <Input
                    id="workstep-step"
                    value={editingWorkStep.step}
                    onChange={(e) => setEditingWorkStep({...editingWorkStep, step: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="workstep-title">Название этапа</Label>
                  <Input
                    id="workstep-title"
                    value={editingWorkStep.title}
                    onChange={(e) => setEditingWorkStep({...editingWorkStep, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="workstep-description">Описание этапа</Label>
                  <Textarea
                    id="workstep-description"
                    value={editingWorkStep.description}
                    onChange={(e) => setEditingWorkStep({...editingWorkStep, description: e.target.value})}
                    rows={4}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={saveWorkStep} className="flex-1">Сохранить</Button>
                  <Button variant="outline" onClick={() => setEditingWorkStep(null)} className="flex-1">Отмена</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Диалог редактирования проекта портфолио */}
        <Dialog open={editingPortfolio !== null} onOpenChange={() => setEditingPortfolio(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>
                {editingPortfolio?.title ? 'Редактировать проект' : 'Добавить проект'}
              </DialogTitle>
            </DialogHeader>
            {editingPortfolio && (
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="portfolio-title">Название проекта</Label>
                  <Input
                    id="portfolio-title"
                    value={editingPortfolio.title}
                    onChange={(e) => setEditingPortfolio({...editingPortfolio, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="portfolio-description">Описание проекта</Label>
                  <Textarea
                    id="portfolio-description"
                    value={editingPortfolio.description}
                    onChange={(e) => setEditingPortfolio({...editingPortfolio, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="portfolio-specs">Технические характеристики</Label>
                  <Input
                    id="portfolio-specs"
                    value={editingPortfolio.specs}
                    onChange={(e) => setEditingPortfolio({...editingPortfolio, specs: e.target.value})}
                    placeholder="Например: Диаметр 200мм, длина 80м"
                  />
                </div>
                <div>
                  <ImageUpload
                    label="Изображение проекта"
                    value={editingPortfolio.image}
                    onChange={(value) => setEditingPortfolio({...editingPortfolio, image: value})}
                    placeholder="Путь к изображению или загрузите файл"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={savePortfolioProject} className="flex-1">Сохранить</Button>
                  <Button variant="outline" onClick={() => setEditingPortfolio(null)} className="flex-1">Отмена</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Диалог редактирования FAQ */}
        <Dialog open={editingFAQ !== null} onOpenChange={() => setEditingFAQ(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>
                {editingFAQ?.question ? 'Редактировать вопрос' : 'Добавить вопрос'}
              </DialogTitle>
            </DialogHeader>
            {editingFAQ && (
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="faq-question">Вопрос</Label>
                  <Input
                    id="faq-question"
                    value={editingFAQ.question}
                    onChange={(e) => setEditingFAQ({...editingFAQ, question: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="faq-answer">Ответ</Label>
                  <Textarea
                    id="faq-answer"
                    value={editingFAQ.answer}
                    onChange={(e) => setEditingFAQ({...editingFAQ, answer: e.target.value})}
                    rows={4}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={saveFAQItem} className="flex-1">Сохранить</Button>
                  <Button variant="outline" onClick={() => setEditingFAQ(null)} className="flex-1">Отмена</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Диалог редактирования статьи */}
        <Dialog open={editingArticle !== null} onOpenChange={() => setEditingArticle(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>
                {editingArticle?.title ? 'Редактировать статью' : 'Добавить статью'}
              </DialogTitle>
            </DialogHeader>
            {editingArticle && (
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="article-title">Заголовок статьи</Label>
                  <Input
                    id="article-title"
                    value={editingArticle.title}
                    onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="article-description">Краткое описание</Label>
                  <Textarea
                    id="article-description"
                    value={editingArticle.description}
                    onChange={(e) => setEditingArticle({...editingArticle, description: e.target.value})}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="article-category">Категория</Label>
                    <Input
                      id="article-category"
                      value={editingArticle.category}
                      onChange={(e) => setEditingArticle({...editingArticle, category: e.target.value})}
                      placeholder="Например: ГНБ технологии"
                    />
                  </div>
                  <div>
                    <Label htmlFor="article-readtime">Время чтения</Label>
                    <Input
                      id="article-readtime"
                      value={editingArticle.readTime}
                      onChange={(e) => setEditingArticle({...editingArticle, readTime: e.target.value})}
                      placeholder="5 мин"
                    />
                  </div>
                  <div>
                    <Label htmlFor="article-date">Дата публикации</Label>
                    <Input
                      id="article-date"
                      type="date"
                      value={editingArticle.publishedAt}
                      onChange={(e) => setEditingArticle({...editingArticle, publishedAt: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="article-slug">URL slug (оставьте пустым для автогенерации)</Label>
                  <Input
                    id="article-slug"
                    value={editingArticle.slug}
                    onChange={(e) => setEditingArticle({...editingArticle, slug: e.target.value})}
                    placeholder="Будет сгенерирован автоматически из заголовка"
                  />
                </div>
                <div>
                  <ImageUpload
                    label="Изображение статьи"
                    value={editingArticle.image}
                    onChange={(value) => setEditingArticle({...editingArticle, image: value})}
                    placeholder="Путь к изображению или загрузите файл"
                  />
                </div>
                <div>
                  <Label htmlFor="article-content">Содержание статьи</Label>
                  <Textarea
                    id="article-content"
                    value={editingArticle.content}
                    onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})}
                    rows={10}
                    placeholder="Полный текст статьи..."
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={saveArticle} className="flex-1">Сохранить</Button>
                  <Button variant="outline" onClick={() => setEditingArticle(null)} className="flex-1">Отмена</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
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