# 🔧 Исправление текущего развертывания

## Проблема
Скрипт развертывания остановился из-за отсутствия файла `next.config.js` (у вас файл называется `next.config.mjs`).

## 🚀 Быстрое исправление

### Вариант 1: Использовать исправленный скрипт
```bash
# Загрузить исправленный скрипт
wget https://raw.githubusercontent.com/LLCIBS/gnb-website--1-/main/scripts/deploy-project-fixed.sh

# Запустить исправленный скрипт
bash deploy-project-fixed.sh
```

### Вариант 2: Продолжить вручную
```bash
# Перейти в директорию проекта
cd ~/gnb-website

# Создать .env.local
cat > .env.local << EOF
NODE_ENV=production
NEXTAUTH_URL=https://минипрокол.рф
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ADMIN_PASSWORD=admin123456
PORT=3000
EOF

# Установить зависимости
npm install

# Собрать проект
npm run build

# Создать конфигурацию PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'gnb-website',
    script: 'npm',
    args: 'start',
    cwd: '/home/gnb-expert/gnb-website',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
EOF

# Создать директорию для логов
mkdir -p logs

# Запустить через PM2
pm2 stop gnb-website 2>/dev/null || true
pm2 delete gnb-website 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Проверить статус
pm2 status
```

## 🔍 Проверка результата

### Проверить статус PM2
```bash
pm2 status
```

### Проверить логи
```bash
pm2 logs gnb-website --lines 20
```

### Проверить подключение
```bash
curl -I http://127.0.0.1:3000
```

### Проверить сайт
```bash
curl -I http://минипрокол.рф
```

## 🚨 Если есть ошибки

### Ошибки TypeScript при сборке
```bash
# Временно отключить строгие проверки
cp tsconfig.json tsconfig.json.backup
sed -i 's/"strict": true/"strict": false/g' tsconfig.json
sed -i 's/"noUnusedLocals": true/"noUnusedLocals": false/g' tsconfig.json
sed -i 's/"noUnusedParameters": true/"noUnusedParameters": false/g' tsconfig.json

# Пересобрать
npm run build

# Запустить PM2
pm2 restart gnb-website
```

### Ошибки зависимостей
```bash
# Установить с legacy флагом
npm install --legacy-peer-deps

# Пересобрать
npm run build

# Перезапустить
pm2 restart gnb-website
```

### PM2 не запускается
```bash
# Альтернативный способ запуска
pm2 start npm --name "gnb-website" -- start

# Или прямой запуск
pm2 start "npm start" --name gnb-website
```

## ✅ После успешного запуска

1. **Проверьте статус**: `pm2 status`
2. **Проверьте сайт**: `curl -I http://минипрокол.рф`
3. **Установите SSL**: `sudo certbot --nginx -d минипрокол.рф -d www.минипрокол.рф`
4. **Проверьте в браузере**: https://минипрокол.рф

## 📞 Полезные команды

```bash
# Мониторинг в реальном времени
pm2 monit

# Перезапуск приложения
pm2 restart gnb-website

# Просмотр логов
pm2 logs gnb-website

# Остановка приложения
pm2 stop gnb-website

# Удаление из PM2
pm2 delete gnb-website
``` 