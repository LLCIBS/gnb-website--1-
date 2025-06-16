# Исправление ошибки 502 Bad Gateway

## 🔍 Диагностика проблемы

### 1. Проверьте статус PM2
```bash
pm2 status
pm2 logs gnb-website
```

### 2. Проверьте, запущено ли приложение на порту 3000
```bash
sudo netstat -tlnp | grep :3000
# или
sudo ss -tlnp | grep :3000
```

### 3. Проверьте логи Nginx
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 🛠️ Возможные решения

### Решение 1: Запуск приложения
Если приложение не запущено:

```bash
cd /home/gnb-expert/gnb-website
pm2 start ecosystem.config.js
pm2 save
```

### Решение 2: Проверка порта
Если приложение запущено на другом порту:

```bash
# Проверьте все порты Node.js приложений
sudo netstat -tlnp | grep node
```

### Решение 3: Исправление конфигурации Nginx
Обновите конфигурацию Nginx для домена минипрокол.рф:

```nginx
server {
    listen 80;
    server_name xn--h1aagebhibgk.xn--p1ai www.xn--h1aagebhibgk.xn--p1ai минипрокол.рф www.минипрокол.рф;

    # Увеличиваем таймауты
    proxy_connect_timeout       60s;
    proxy_send_timeout          60s;
    proxy_read_timeout          60s;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Дополнительные заголовки
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_redirect off;
    }

    # Кэширование статических файлов
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
        expires 1y;
    }

    location /images/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=86400";
        expires 1d;
    }

    # Логирование для отладки
    access_log /var/log/nginx/miniprокol.access.log;
    error_log /var/log/nginx/miniprокol.error.log;
}
```

### Решение 4: Проверка переменных окружения
Убедитесь, что в .env.local правильно указан домен:

```env
NODE_ENV=production
NEXTAUTH_URL=https://минипрокол.рф
NEXTAUTH_SECRET=ваш-секретный-ключ
ADMIN_PASSWORD=ваш-пароль
PORT=3000
```

## 🚀 Пошаговое исправление

### Шаг 1: Остановите и перезапустите приложение
```bash
pm2 stop gnb-website
pm2 delete gnb-website
cd /home/gnb-expert/gnb-website
pm2 start ecosystem.config.js
pm2 save
```

### Шаг 2: Проверьте статус
```bash
pm2 status
pm2 logs gnb-website --lines 50
```

### Шаг 3: Обновите конфигурацию Nginx
```bash
sudo nano /etc/nginx/sites-available/gnb-website
# Вставьте обновленную конфигурацию выше

sudo nginx -t
sudo systemctl reload nginx
```

### Шаг 4: Проверьте подключение
```bash
# Проверьте локальное подключение
curl -I http://127.0.0.1:3000

# Проверьте через Nginx
curl -I http://минипрокол.рф
```

## 🔧 Дополнительная отладка

### Если проблема не решена:

1. **Проверьте файрвол:**
```bash
sudo ufw status
# Если активен, разрешите порт 3000 локально
sudo ufw allow from 127.0.0.1 to any port 3000
```

2. **Проверьте SELinux (если используется):**
```bash
sudo setsebool -P httpd_can_network_connect 1
```

3. **Запустите приложение напрямую для тестирования:**
```bash
cd /home/gnb-expert/gnb-website
npm start
# В другом терминале:
curl -I http://localhost:3000
```

4. **Проверьте права доступа:**
```bash
ls -la /home/gnb-expert/gnb-website
sudo chown -R gnb-expert:gnb-expert /home/gnb-expert/gnb-website
```

## ✅ Проверка после исправления

После применения исправлений проверьте:

```bash
# 1. Статус PM2
pm2 status

# 2. Порт 3000
sudo netstat -tlnp | grep :3000

# 3. Логи Nginx
sudo tail -f /var/log/nginx/error.log

# 4. Доступность сайта
curl -I http://минипрокол.рф
```

Если все работает, переходите к установке SSL:

```bash
sudo certbot --nginx -d минипрокол.рф -d www.минипрокол.рф
``` 