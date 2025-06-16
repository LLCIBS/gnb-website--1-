const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Универсальный генератор статических сборок
class UniversalStaticGenerator {
  constructor(projectConfig) {
    this.config = {
      // Пути проекта
      projectRoot: projectConfig.projectRoot || process.cwd(),
      clientDir: projectConfig.clientDir || 'client',
      serverDir: projectConfig.serverDir || 'server', 
      distDir: projectConfig.distDir || 'dist/public',
      
      // Типы целевых хостингов
      targets: projectConfig.targets || ['static', 'php', 'vercel', 'netlify'],
      
      // Конфигурация проекта
      projectName: projectConfig.projectName || 'static-site',
      apiRoutes: projectConfig.apiRoutes || [],
      hasAuth: projectConfig.hasAuth || false,
      hasAdmin: projectConfig.hasAdmin || false,
      hasUploads: projectConfig.hasUploads || false,
      
      // Настройки сборки
      buildCommand: projectConfig.buildCommand || 'npm run build',
      outputDir: projectConfig.outputDir || 'static-bundles',
      
      ...projectConfig
    };
    
    this.colors = {
      reset: '\x1b[0m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const color = {
      info: this.colors.cyan,
      success: this.colors.green,
      warning: this.colors.yellow,
      error: this.colors.red
    }[type] || this.colors.white;
    
    console.log(`${color}[${timestamp}] ${message}${this.colors.reset}`);
  }

  // Основной метод генерации
  async generateStaticBundles() {
    try {
      this.log('🚀 Запуск универсального генератора статических сборок', 'info');
      
      // Шаг 1: Анализ проекта
      await this.analyzeProject();
      
      // Шаг 2: Сборка проекта
      await this.buildProject();
      
      // Шаг 3: Генерация для каждого типа хостинга
      for (const target of this.config.targets) {
        await this.generateForTarget(target);
      }
      
      // Шаг 4: Создание документации
      await this.generateDocumentation();
      
      this.log('✅ Генерация завершена успешно!', 'success');
      
    } catch (error) {
      this.log(`❌ Ошибка: ${error.message}`, 'error');
      throw error;
    }
  }

  // Анализ структуры проекта
  async analyzeProject() {
    this.log('🔍 Анализ структуры проекта...', 'info');
    
    const projectStructure = {
      hasClient: fs.existsSync(path.join(this.config.projectRoot, this.config.clientDir)),
      hasServer: fs.existsSync(path.join(this.config.projectRoot, this.config.serverDir)),
      hasPackageJson: fs.existsSync(path.join(this.config.projectRoot, 'package.json')),
      hasViteConfig: fs.existsSync(path.join(this.config.projectRoot, 'vite.config.ts')) || 
                     fs.existsSync(path.join(this.config.projectRoot, 'vite.config.js')),
      hasTailwind: fs.existsSync(path.join(this.config.projectRoot, 'tailwind.config.ts')) ||
                   fs.existsSync(path.join(this.config.projectRoot, 'tailwind.config.js')),
    };
    
    // Автоопределение API маршрутов
    if (projectStructure.hasServer) {
      this.config.apiRoutes = await this.discoverApiRoutes();
    }
    
    this.log(`📊 Структура проекта проанализирована`, 'success');
    this.projectStructure = projectStructure;
  }

  // Автоопределение API маршрутов из серверного кода
  async discoverApiRoutes() {
    const routesFile = path.join(this.config.projectRoot, this.config.serverDir, 'routes.ts');
    const routes = [];
    
    if (fs.existsSync(routesFile)) {
      const content = fs.readFileSync(routesFile, 'utf8');
      
      // Простое парсинг маршрутов (можно улучшить)
      const routePatterns = [
        /app\.(get|post|put|delete)\(['"]\/api\/([^'"]+)['"]/g,
        /router\.(get|post|put|delete)\(['"]\/([^'"]+)['"]/g
      ];
      
      routePatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          routes.push({
            method: match[1].toUpperCase(),
            path: match[2],
            needsAuth: content.includes('requireAuth') || content.includes('isAuthenticated')
          });
        }
      });
    }
    
    return routes;
  }

  // Сборка проекта
  async buildProject() {
    this.log('🔨 Сборка проекта...', 'info');
    
    try {
      execSync(this.config.buildCommand, { 
        stdio: 'inherit',
        cwd: this.config.projectRoot 
      });
      this.log('✅ Сборка завершена', 'success');
    } catch (error) {
      throw new Error(`Ошибка сборки: ${error.message}`);
    }
  }

  // Генерация для конкретного типа хостинга
  async generateForTarget(target) {
    this.log(`📦 Генерация для ${target}...`, 'info');
    
    const targetDir = path.join(this.config.projectRoot, this.config.outputDir, target);
    
    // Очищаем и создаем директорию
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    fs.mkdirSync(targetDir, { recursive: true });
    
    // Копируем собранные файлы
    const distPath = path.join(this.config.projectRoot, this.config.distDir);
    if (fs.existsSync(distPath)) {
      this.copyDirectory(distPath, targetDir);
    }
    
    // Генерируем специфичные для хостинга файлы
    switch (target) {
      case 'static':
        await this.generateStaticHosting(targetDir);
        break;
      case 'php':
        await this.generatePhpHosting(targetDir);
        break;
      case 'vercel':
        await this.generateVercelHosting(targetDir);
        break;
      case 'netlify':
        await this.generateNetlifyHosting(targetDir);
        break;
      case 'apache':
        await this.generateApacheHosting(targetDir);
        break;
      case 'nginx':
        await this.generateNginxHosting(targetDir);
        break;
    }
    
    this.log(`✅ ${target} сборка готова в ${targetDir}`, 'success');
  }

  // Статический хостинг (Timeweb, обычный хостинг)
  async generateStaticHosting(targetDir) {
    // Простой .htaccess для Apache
    const htaccess = `RewriteEngine On
RewriteBase /
RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Кэширование статических ресурсов
<IfModule mod_expires.c>
  ExpiresActive on
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
</IfModule>`;

    fs.writeFileSync(path.join(targetDir, '.htaccess'), htaccess);
    
    // README для статического хостинга
    const readme = this.generateReadme('static');
    fs.writeFileSync(path.join(targetDir, 'README.md'), readme);
  }

  // PHP хостинг
  async generatePhpHosting(targetDir) {
    // Копируем готовую PHP реализацию, если она есть
    const phpSourceDir = path.join(this.config.projectRoot, 'php-hosting');
    if (fs.existsSync(phpSourceDir)) {
      this.copyDirectory(phpSourceDir, targetDir);
      return;
    }
    
    // Иначе создаем базовую PHP реализацию
    const phpIndex = `<?php
// Простой PHP роутер для SPA
header('Content-Type: text/html; charset=utf-8');

$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// API роутинг (заглушки)
if (strpos($request_uri, '/api/') === 0) {
    header('Content-Type: application/json');
    
    // Основные API endpoints
    switch ($request_uri) {
        case '/api/doctor':
            echo json_encode([
                'name' => 'Врач',
                'specialization' => 'Остеопат',
                'experience' => '10+ лет'
            ]);
            break;
            
        case '/api/services':
            echo json_encode([
                ['id' => 1, 'title' => 'Консультация', 'price' => 'По запросу'],
                ['id' => 2, 'title' => 'Лечение', 'price' => 'По запросу']
            ]);
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'API endpoint not found']);
    }
    exit;
}

// Для всех остальных запросов отдаем index.html
readfile(__DIR__ . '/index.html');
?>`;

    fs.writeFileSync(path.join(targetDir, 'index.php'), phpIndex);
    
    // .htaccess для PHP
    const htaccess = `RewriteEngine On
RewriteBase /

# API запросы обрабатываются index.php
RewriteRule ^api/(.*)$ index.php [QSA,L]

# Статические файлы
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^(.*)$ $1 [L]

# Все остальное - на index.php
RewriteRule ^(.*)$ index.php [QSA,L]`;

    fs.writeFileSync(path.join(targetDir, '.htaccess'), htaccess);
    
    const readme = this.generateReadme('php');
    fs.writeFileSync(path.join(targetDir, 'README.md'), readme);
  }

  // Vercel хостинг
  async generateVercelHosting(targetDir) {
    const vercelConfig = {
      version: 2,
      builds: [
        {
          src: "package.json",
          use: "@vercel/static-build"
        }
      ],
      routes: [
        {
          src: "/api/(.*)",
          dest: "/api.js"
        },
        {
          src: "/(.*)",
          dest: "/index.html"
        }
      ]
    };
    
    fs.writeFileSync(path.join(targetDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
    
    // Простой API для Vercel
    const vercelApi = `export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Базовые заглушки API
  const { query } = req;
  const endpoint = query.api?.[0] || '';
  
  switch (endpoint) {
    case 'doctor':
      res.json({ name: 'Врач', specialization: 'Остеопат' });
      break;
    case 'services':
      res.json([{ id: 1, title: 'Консультация', price: 'По запросу' }]);
      break;
    default:
      res.status(404).json({ error: 'API endpoint not found' });
  }
}`;

    const apiDir = path.join(targetDir, 'api');
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir);
    }
    fs.writeFileSync(path.join(apiDir, '[...api].js'), vercelApi);
    
    const readme = this.generateReadme('vercel');
    fs.writeFileSync(path.join(targetDir, 'README.md'), readme);
  }

  // Netlify хостинг
  async generateNetlifyHosting(targetDir) {
    // _redirects для Netlify
    const redirects = `# SPA перенаправления
/api/* /.netlify/functions/api 200
/* /index.html 200`;

    fs.writeFileSync(path.join(targetDir, '_redirects'), redirects);
    
    // Netlify функция
    const netlifyFunction = `exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }
  
  const path = event.path.replace('/.netlify/functions/api', '');
  
  // Базовые API endpoints
  switch (path) {
    case '/doctor':
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ name: 'Врач', specialization: 'Остеопат' })
      };
    case '/services':
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([{ id: 1, title: 'Консультация', price: 'По запросу' }])
      };
    default:
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'API endpoint not found' })
      };
  }
};`;

    const functionsDir = path.join(targetDir, '.netlify', 'functions');
    fs.mkdirSync(functionsDir, { recursive: true });
    fs.writeFileSync(path.join(functionsDir, 'api.js'), netlifyFunction);
    
    const readme = this.generateReadme('netlify');
    fs.writeFileSync(path.join(targetDir, 'README.md'), readme);
  }

  // Apache хостинг
  async generateApacheHosting(targetDir) {
    const htaccess = `# Apache конфигурация для SPA
RewriteEngine On
RewriteBase /

# Обработка API (если есть серверная часть)
RewriteRule ^api/(.*)$ api.php?route=$1 [QSA,L]

# Статические файлы
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^.*$ - [L]

# SPA fallback
RewriteRule ^.*$ /index.html [L]

# Безопасность
<Files ".env">
  Order Allow,Deny
  Deny from all
</Files>

# Сжатие
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json
</IfModule>

# Кэширование
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/* "access plus 1 year"
</IfModule>`;

    fs.writeFileSync(path.join(targetDir, '.htaccess'), htaccess);
    
    const readme = this.generateReadme('apache');
    fs.writeFileSync(path.join(targetDir, 'README.md'), readme);
  }

  // Nginx хостинг
  async generateNginxHosting(targetDir) {
    const nginxConfig = `# Nginx конфигурация для SPA
server {
    listen 80;
    server_name yourdomain.com;
    root ${targetDir};
    index index.html;

    # Логи
    access_log /var/log/nginx/spa_access.log;
    error_log /var/log/nginx/spa_error.log;

    # API проксирование (если нужно)
    location /api/ {
        try_files $uri $uri/ /api.php?$query_string;
    }

    # Статические файлы
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Безопасность
    location ~ /\\. {
        deny all;
    }
}`;

    fs.writeFileSync(path.join(targetDir, 'nginx.conf'), nginxConfig);
    
    const readme = this.generateReadme('nginx');
    fs.writeFileSync(path.join(targetDir, 'README.md'), readme);
  }

  // Генерация README файла
  generateReadme(target) {
    const targetNames = {
      static: 'Статический хостинг',
      php: 'PHP хостинг',
      vercel: 'Vercel',
      netlify: 'Netlify',
      apache: 'Apache',
      nginx: 'Nginx'
    };

    const instructions = {
      static: `1. Загрузите все файлы на ваш хостинг
2. Убедитесь, что .htaccess файл загружен
3. Проверьте, что mod_rewrite включен в Apache
4. Сайт готов к работе!`,
      
      php: `1. Загрузите все файлы на PHP хостинг
2. Убедитесь, что PHP 7.0+ доступен
3. Создайте директории data, uploads с правами 777
4. Настройте .htaccess для правильной работы
5. API будет работать через PHP`,
      
      vercel: `1. Подключите репозиторий к Vercel
2. Убедитесь, что vercel.json в корне проекта
3. Деплой произойдет автоматически
4. API функции будут работать serverless`,
      
      netlify: `1. Подключите репозиторий к Netlify
2. Убедитесь, что _redirects файл на месте
3. Netlify Functions будут обрабатывать API
4. Деплой автоматический`,
      
      apache: `1. Загрузите файлы на Apache сервер
2. Убедитесь, что mod_rewrite включен
3. Настройте .htaccess файл
4. Проверьте права доступа`,
      
      nginx: `1. Загрузите файлы на сервер
2. Подключите nginx.conf к основной конфигурации
3. Перезапустите Nginx
4. Проверьте логи при возникновении проблем`
    };

    return `# ${this.config.projectName} - ${targetNames[target]}

## Описание
Статическая сборка проекта ${this.config.projectName} для размещения на ${targetNames[target]}.

## Инструкция по развертыванию

${instructions[target]}

## Структура файлов
- \`index.html\` - главная страница приложения
- \`assets/\` - статические ресурсы (CSS, JS, изображения)
${target === 'php' ? '- `api.php` - PHP API для обработки запросов\n- `data/` - директория для данных' : ''}
${target === 'vercel' ? '- `vercel.json` - конфигурация Vercel\n- `api/` - serverless функции' : ''}
${target === 'netlify' ? '- `_redirects` - правила перенаправления\n- `.netlify/functions/` - Netlify функции' : ''}

## Особенности
${this.config.hasAuth ? '- Система авторизации настроена' : '- Авторизация отключена для статической версии'}
${this.config.hasAdmin ? '- Админ-панель доступна' : '- Админ-панель недоступна в статической версии'}
${this.config.hasUploads ? '- Загрузка файлов поддерживается' : '- Загрузка файлов недоступна в статической версии'}

## Поддержка
При возникновении проблем проверьте:
1. Правильность настройки веб-сервера
2. Права доступа к файлам
3. Логи ошибок сервера

Дата генерации: ${new Date().toLocaleString('ru-RU')}
Генератор: Universal Static Generator v1.0
`;
  }

  // Генерация документации
  async generateDocumentation() {
    this.log('📚 Создание документации...', 'info');
    
    const docsDir = path.join(this.config.projectRoot, this.config.outputDir, '_docs');
    fs.mkdirSync(docsDir, { recursive: true });
    
    // Главная документация
    const mainDocs = `# ${this.config.projectName} - Универсальные статические сборки

## Обзор проекта

Этот проект был автоматически проанализирован и преобразован в статические сборки для различных типов хостингов.

## Доступные сборки

${this.config.targets.map(target => `- **${target}**: готовая сборка в папке \`${target}/\``).join('\n')}

## Архитектура проекта

- **Клиент**: ${this.projectStructure?.hasClient ? 'React SPA с Vite' : 'Не обнаружен'}
- **Сервер**: ${this.projectStructure?.hasServer ? 'Node.js/Express API' : 'Не обнаружен'}
- **Стили**: ${this.projectStructure?.hasTailwind ? 'Tailwind CSS' : 'Стандартные CSS'}
- **Сборщик**: ${this.projectStructure?.hasViteConfig ? 'Vite' : 'Другой'}

## API Endpoints

${this.config.apiRoutes.length > 0 
  ? this.config.apiRoutes.map(route => `- **${route.method}** \`${route.path}\`${route.needsAuth ? ' (требует авторизации)' : ''}`).join('\n')
  : 'API endpoints не обнаружены'
}

## Рекомендации по хостингу

1. **Для простых сайтов**: используйте \`static\` сборку
2. **Для динамических функций**: используйте \`php\` сборку
3. **Для современного деплоя**: используйте \`vercel\` или \`netlify\`
4. **Для корпоративных серверов**: используйте \`apache\` или \`nginx\`

## Техническая информация

- Генератор: Universal Static Generator v1.0
- Дата генерации: ${new Date().toLocaleString('ru-RU')}
- Конфигурация проекта: ${JSON.stringify(this.config, null, 2)}

## Использование генератора

\`\`\`javascript
const generator = new UniversalStaticGenerator({
  projectRoot: '/path/to/project',
  targets: ['static', 'php', 'vercel'],
  projectName: 'My Project',
  hasAuth: true,
  hasAdmin: true
});

await generator.generateStaticBundles();
\`\`\`
`;

    fs.writeFileSync(path.join(docsDir, 'README.md'), mainDocs);
    
    // Конфигурационный файл для повторного использования
    const config = {
      ...this.config,
      generated: new Date().toISOString(),
      projectStructure: this.projectStructure
    };
    
    fs.writeFileSync(path.join(docsDir, 'generator-config.json'), JSON.stringify(config, null, 2));
    
    this.log('✅ Документация создана', 'success');
  }

  // Утилита для копирования директорий
  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  // Создание архивов для каждой сборки
  async createArchives() {
    this.log('📦 Создание архивов...', 'info');
    
    for (const target of this.config.targets) {
      const targetDir = path.join(this.config.projectRoot, this.config.outputDir, target);
      const archiveName = `${this.config.projectName}-${target}.zip`;
      const archivePath = path.join(this.config.projectRoot, this.config.outputDir, archiveName);
      
      if (fs.existsSync(targetDir)) {
        try {
          const currentDir = process.cwd();
          process.chdir(targetDir);
          execSync(`powershell Compress-Archive -Path ./* -DestinationPath "${archivePath}" -Force`);
          process.chdir(currentDir);
          
          this.log(`📦 Создан архив: ${archiveName}`, 'success');
        } catch (error) {
          this.log(`⚠️ Не удалось создать архив для ${target}: ${error.message}`, 'warning');
        }
      }
    }
  }
}

module.exports = UniversalStaticGenerator;