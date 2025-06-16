import { AdminData, initialData } from './data'
import type { Service, WorkStep, PortfolioProject, FAQItem, Article, ContactInfo, CallbackRequest } from './data'

class DataStorage {
  private data: AdminData

  constructor() {
    this.data = initialData
  }

  getData(): AdminData {
    return this.data
  }

  getServices() {
    return this.data.services
  }

  getWorkSteps() {
    return this.data.workSteps
  }

  getPortfolio() {
    return this.data.portfolio
  }

  getFAQ() {
    return this.data.faq
  }

  getArticles(): Article[] {
    return this.data.articles || []
  }

  updateServices(services: AdminData['services']) {
    this.data.services = services
  }

  updateWorkSteps(workSteps: AdminData['workSteps']) {
    this.data.workSteps = workSteps
  }

  updatePortfolio(portfolio: AdminData['portfolio']) {
    this.data.portfolio = portfolio
  }

  updateFAQ(faq: AdminData['faq']) {
    this.data.faq = faq
  }

  setArticles(articles: Article[]): void {
    this.data.articles = articles
  }

  // Контактная информация
  getContactInfo(): ContactInfo {
    return this.data.contactInfo || {
      id: "1",
      companyName: "ГНБ-Эксперт",
      companyDescription: "Профессиональные услуги горизонтального направленного бурения мини установкой",
      phone: "+7 (495) 123-45-67",
      email: "info@gnb-expert.ru",
      address: "Москва и Московская область",
      workingHours: "Пн-Вс 8:00-20:00",
      socialMedia: {}
    }
  }

  setContactInfo(contactInfo: ContactInfo): void {
    this.data.contactInfo = contactInfo
  }

  // Заявки на обратный звонок
  getCallbackRequests(): CallbackRequest[] {
    return this.data.callbackRequests || []
  }

  addCallbackRequest(request: Omit<CallbackRequest, 'id' | 'createdAt' | 'status'>): CallbackRequest {
    const newRequest: CallbackRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'new'
    }
    
    if (!this.data.callbackRequests) {
      this.data.callbackRequests = []
    }
    
    this.data.callbackRequests.push(newRequest)
    return newRequest
  }

  setCallbackRequests(requests: CallbackRequest[]): void {
    this.data.callbackRequests = requests
  }
}

export const dataStorage = new DataStorage() 