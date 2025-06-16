# gnb-expert-website - Универсальные статические сборки

## Обзор проекта

Этот проект был автоматически проанализирован и преобразован в статические сборки для различных типов хостингов.

## Доступные сборки

- **php**: готовая сборка в папке `php/`
- **static**: готовая сборка в папке `static/`

## Архитектура проекта

- **Клиент**: React SPA с Vite
- **Сервер**: Node.js/Express API
- **Стили**: Tailwind CSS
- **Сборщик**: Другой

## API Endpoints

API endpoints не обнаружены

## Рекомендации по хостингу

1. **Для простых сайтов**: используйте `static` сборку
2. **Для динамических функций**: используйте `php` сборку
3. **Для современного деплоя**: используйте `vercel` или `netlify`
4. **Для корпоративных серверов**: используйте `apache` или `nginx`

## Техническая информация

- Генератор: Universal Static Generator v1.0
- Дата генерации: 16.06.2025, 17:12:11
- Конфигурация проекта: {
  "projectRoot": "D:\\ООО ИБС\\Яндекс диск\\YandexDisk\\Проекты ИБС\\Прокладка труб\\gnb-website (1)",
  "clientDir": "app",
  "serverDir": "app/api",
  "distDir": ".next/static",
  "targets": [
    "php",
    "static"
  ],
  "projectName": "gnb-expert-website",
  "apiRoutes": [],
  "hasAuth": true,
  "hasAdmin": true,
  "hasUploads": false,
  "buildCommand": "npm run build",
  "outputDir": "static-bundles",
  "phpHostingConfig": {
    "useModRewrite": true,
    "createPhpApiStubs": true,
    "baseUrl": "/",
    "contactFormHandler": true,
    "security": {
      "disableServerInfo": true,
      "preventDirectoryListing": true,
      "blockSensitiveFiles": true
    }
  }
}

## Использование генератора

```javascript
const generator = new UniversalStaticGenerator({
  projectRoot: '/path/to/project',
  targets: ['static', 'php', 'vercel'],
  projectName: 'My Project',
  hasAuth: true,
  hasAdmin: true
});

await generator.generateStaticBundles();
```
