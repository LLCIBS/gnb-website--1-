"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Phone, User, MessageSquare, Clock, CheckCircle } from "lucide-react"

interface CallbackFormProps {
  trigger?: React.ReactNode
}

export function CallbackForm({ trigger }: CallbackFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Пожалуйста, заполните имя и телефон')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          type: 'callback'
        })
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({ name: '', phone: '', message: '' })
        setTimeout(() => {
          setSuccess(false)
          setOpen(false)
        }, 3000)
      } else {
        const error = await response.json()
        alert(error.error || 'Ошибка отправки заявки')
      }
    } catch (error) {
      console.error('Ошибка отправки заявки:', error)
      alert('Ошибка отправки заявки')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatPhoneNumber = (value: string) => {
    // Убираем все кроме цифр
    const numbers = value.replace(/\D/g, '')
    
    // Форматируем номер телефона
    if (numbers.length === 0) return ''
    if (numbers.length <= 1) return `+7`
    if (numbers.length <= 4) return `+7 (${numbers.slice(1)}`
    if (numbers.length <= 7) return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4)}`
    if (numbers.length <= 9) return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7)}`
    return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9, 11)}`
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    handleChange('phone', formatted)
  }

  const defaultTrigger = (
    <Button className="bg-orange-500 hover:bg-orange-600">
      <Phone className="w-4 h-4 mr-2" />
      Заказать звонок
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-orange-500" />
            Заказать обратный звонок
          </DialogTitle>
          <DialogDescription>
            Оставьте свои контакты и мы перезвоним вам в течение 15 минут
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Заявка отправлена!
            </h3>
            <p className="text-gray-600">
              Мы свяжемся с вами в ближайшее время
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Ваше имя *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Введите ваше имя"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Телефон *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+7 (___) ___-__-__"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="message" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Комментарий
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Опишите вашу задачу (необязательно)"
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 text-sm">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Время ответа: до 15 минут</span>
              </div>
              <p className="text-blue-600 text-sm mt-1">
                Работаем ежедневно с 8:00 до 20:00
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1 bg-orange-500 hover:bg-orange-600" 
                disabled={loading}
              >
                {loading ? 'Отправляем...' : 'Заказать звонок'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Отмена
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 