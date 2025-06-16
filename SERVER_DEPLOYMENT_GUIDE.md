# Полная инструкция по развертыванию проекта ГНБ-Эксперт на сервере

## 📋 Содержание
1. [Подготовка сервера](#1-подготовка-сервера)
2. [Установка необходимого ПО](#2-установка-необходимого-по)
3. [Настройка пользователя](#3-настройка-пользователя)
4. [Загрузка проекта](#4-загрузка-проекта)
5. [Настройка проекта](#5-настройка-проекта)
6. [Настройка PM2](#6-настройка-pm2)
7. [Настройка Nginx](#7-настройка-nginx)
8. [Настройка домена](#8-настройка-домена)
9. [Установка SSL](#9-установка-ssl)
10. [Проверка и тестирование](#10-проверка-и-тестирование)
11. [Мониторинг и обслуживание](#11-мониторинг-и-обслуживание)

---

## 1. Подготовка сервера

### 1.1 Требования к серверу
- **ОС**: Ubuntu 20.04/22.04 LTS
- **RAM**: минимум 2GB (рекомендуется 4GB)
- **CPU**: минимум 1 ядро (рекомендуется 2)
- **Диск**: минимум 20GB SSD
- **Сеть**: статический IP адрес

### 1.2 Первоначальная настройка
```bash
# Подключение к серверу
ssh root@ВАШ_IP_АДРЕС

# Обновление системы
apt update && apt upgrade -y

# Установка базовых пакетов
apt install -y curl wget git nano htop unzip software-properties-common
```

---

## 2. Установка необходимого ПО

### 2.1 Установка Node.js 20.x
```bash
# Добавление репозитория NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Установка Node.js
apt-get install -y nodejs

# Проверка версий
node --version  # должно быть v20.x.x
npm --version   # должно быть 10.x.x
```

### 2.2 Установка PM2
```bash
# Установка PM2 глобально
npm install -g pm2

# Проверка установки
pm2 --version
```

### 2.3 Установка Nginx
```bash
# Установка Nginx
apt install -y nginx

# Запуск и автозапуск
systemctl start nginx
systemctl enable nginx

# Проверка статуса
systemctl status nginx
```

### 2.4 Установка дополнительных инструментов
```bash
# Установка certbot для SSL
apt install -y snapd
snap install --classic certbot
ln -s /snap/bin/certbot /usr/bin/certbot

# Установка файрвола
apt install -y ufw
```

---

## 3. Настройка пользователя

### 3.1 Создание пользователя для проекта
```bash
# Создание пользователя
adduser gnb-expert
# Введите пароль и информацию о пользователе

# Добавление в группу sudo
usermod -aG sudo gnb-expert

# Переключение на пользователя
su - gnb-expert
```

### 3.2 Настройка SSH ключей (опционально)
```bash
# Создание директории для SSH ключей
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Если у вас есть SSH ключ, добавьте его в authorized_keys
# nano ~/.ssh/authorized_keys
# chmod 600 ~/.ssh/authorized_keys
```

---

## 4. Загрузка проекта

### 4.1 Клонирование из Git репозитория
```bash
# Переход в домашнюю директорию
cd ~

# Клонирование проекта (замените на ваш репозиторий)
git clone https://github.com/ваш-username/gnb-website.git

# Переход в директорию проекта
cd gnb-website
```

### 4.2 Альтернативный способ - загрузка архива
```bash
# Если нет Git репозитория, загрузите архив
wget https://ссылка-на-архив/gnb-website.zip
unzip gnb-website.zip
cd gnb-website
```

---

## 5. Настройка проекта

### 5.1 Установка зависимостей
```bash
# Установка всех зависимостей
npm install

# Если есть ошибки, попробуйте:
npm install --legacy-peer-deps
```

### 5.2 Создание файла окружения
```bash
# Создание .env.local
nano .env.local
```

Добавьте следующее содержимое:
```env
NODE_ENV=production
NEXTAUTH_URL=https://минипрокол.рф
NEXTAUTH_SECRET=сгенерируйте-случайную-строку-32-символа
ADMIN_PASSWORD=ваш-сложный-пароль-админки
PORT=3000
```

**Важно**: Сгенерируйте секретный ключ:
```bash
# Генерация секретного ключа
openssl rand -base64 32
```

### 5.3 Сборка проекта
```bash
# Сборка для продакшена
npm run build

# Проверка что сборка прошла успешно
ls -la .next/
```

### 5.4 Тестовый запуск
```bash
# Тестовый запуск (для проверки)
npm start

# В другом терминале проверьте:
curl -I http://localhost:3000

# Остановите тестовый запуск (Ctrl+C)
```

---

## 6. Настройка PM2

### 6.1 Создание конфигурации PM2
```bash
# Создание ecosystem.config.js
nano ecosystem.config.js
```

Добавьте содержимое:
```javascript
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
```

### 6.2 Создание директории для логов
```bash
mkdir -p logs
```

### 6.3 Запуск приложения через PM2
```bash
# Запуск приложения
pm2 start ecosystem.config.js

# Сохранение конфигурации
pm2 save

# Настройка автозапуска
pm2 startup
# Выполните команду, которую выдаст PM2

# Проверка статуса
pm2 status
pm2 logs gnb-website
```

---

## 7. Настройка Nginx

### 7.1 Создание конфигурации сайта
```bash
# Создание конфигурации
sudo nano /etc/nginx/sites-available/gnb-website
```

Добавьте содержимое:
```nginx
server {
    listen 80;
    server_name минипрокол.рф www.минипрокол.рф xn--h1aagebhibgk.xn--p1ai www.xn--h1aagebhibgk.xn--p1ai;

    # Увеличиваем таймауты
    proxy_connect_timeout       60s;
    proxy_send_timeout          60s;
    proxy_read_timeout          60s;
    
    # Размер буфера
    large_client_header_buffers 4 16k;
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
        
        # Дополнительные настройки
        proxy_buffering off;
        proxy_request_buffering off;
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

    # Безопасность
    server_tokens off;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Логирование
    access_log /var/log/nginx/gnb-website.access.log;
    error_log /var/log/nginx/gnb-website.error.log;
}
```

### 7.2 Активация сайта
```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/gnb-website /etc/nginx/sites-enabled/

# Удаление дефолтного сайта
sudo rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl reload nginx
```

---

## 8. Настройка домена

### 8.1 DNS записи
В панели управления домена `минипрокол.рф` добавьте:

```
Тип    Имя    Значение           TTL
A      @      ВАШ_IP_СЕРВЕРА     3600
A      www    ВАШ_IP_СЕРВЕРА     3600
```

### 8.2 Проверка DNS
```bash
# Проверка DNS (может занять до 24 часов)
nslookup минипрокол.рф
dig минипрокол.рф

# Проверка доступности
curl -I http://минипрокол.рф
```

---

## 9. Установка SSL

### 9.1 Получение SSL сертификата
```bash
# Получение сертификата для домена
sudo certbot --nginx -d минипрокол.рф -d www.минипрокол.рф

# Следуйте инструкциям certbot
```

### 9.2 Проверка автообновления
```bash
# Тест автообновления
sudo certbot renew --dry-run

# Проверка cron задачи
sudo crontab -l
```

---

## 10. Проверка и тестирование

### 10.1 Проверка всех сервисов
```bash
# Статус PM2
pm2 status

# Статус Nginx
sudo systemctl status nginx

# Проверка портов
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
sudo netstat -tlnp | grep :3000
```

### 10.2 Тестирование сайта
```bash
# Проверка HTTP
curl -I http://минипрокол.рф

# Проверка HTTPS
curl -I https://минипрокол.рф

# Проверка редиректа
curl -I http://www.минипрокол.рф
```

### 10.3 Чек-лист работоспособности
- [ ] PM2 показывает статус "online"
- [ ] Nginx работает без ошибок
- [ ] Сайт открывается по HTTP
- [ ] Сайт открывается по HTTPS
- [ ] SSL сертификат валидный
- [ ] Редирект с www работает
- [ ] Все страницы загружаются
- [ ] Формы отправляются
- [ ] Админ панель доступна (/admin)

---

## 11. Мониторинг и обслуживание

### 11.1 Полезные команды PM2
```bash
# Просмотр статуса
pm2 status

# Просмотр логов
pm2 logs gnb-website
pm2 logs gnb-website --lines 100

# Перезапуск приложения
pm2 restart gnb-website

# Остановка приложения
pm2 stop gnb-website

# Мониторинг в реальном времени
pm2 monit
```

### 11.2 Полезные команды Nginx
```bash
# Проверка конфигурации
sudo nginx -t

# Перезагрузка конфигурации
sudo systemctl reload nginx

# Перезапуск Nginx
sudo systemctl restart nginx

# Просмотр логов
sudo tail -f /var/log/nginx/gnb-website.access.log
sudo tail -f /var/log/nginx/gnb-website.error.log
```

### 11.3 Обновление проекта
```bash
# Создание скрипта обновления
nano ~/update-website.sh
```

Содержимое скрипта:
```bash
#!/bin/bash
cd /home/gnb-expert/gnb-website

echo "Остановка приложения..."
pm2 stop gnb-website

echo "Обновление кода..."
git pull origin main

echo "Установка зависимостей..."
npm install

echo "Сборка проекта..."
npm run build

echo "Запуск приложения..."
pm2 start gnb-website

echo "Обновление завершено!"
pm2 status
```

```bash
# Сделать скрипт исполняемым
chmod +x ~/update-website.sh

# Использование
./update-website.sh
```

### 11.4 Резервное копирование
```bash
# Создание скрипта бэкапа
nano ~/backup-website.sh
```

Содержимое:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/gnb-expert/backups"
PROJECT_DIR="/home/gnb-expert/gnb-website"

mkdir -p $BACKUP_DIR

echo "Создание бэкапа..."
tar -czf $BACKUP_DIR/gnb-website_$DATE.tar.gz \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='logs' \
    -C $PROJECT_DIR .

echo "Бэкап создан: gnb-website_$DATE.tar.gz"

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -name "gnb-website_*.tar.gz" -mtime +7 -delete
```

```bash
chmod +x ~/backup-website.sh

# Добавление в crontab для ежедневного бэкапа
crontab -e
# Добавьте строку: 0 2 * * * /home/gnb-expert/backup-website.sh
```

### 11.5 Настройка файрвола
```bash
# Настройка UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Включение файрвола
sudo ufw enable

# Проверка статуса
sudo ufw status
```

---

## 🚨 Решение проблем

### Проблема: PM2 показывает "errored"
```bash
# Просмотр логов ошибок
pm2 logs gnb-website --lines 50

# Перезапуск
pm2 restart gnb-website

# Если не помогает - полный перезапуск
pm2 stop gnb-website
pm2 delete gnb-website
pm2 start ecosystem.config.js
```

### Проблема: 502 Bad Gateway
```bash
# Проверка что приложение запущено
pm2 status

# Проверка порта 3000
sudo netstat -tlnp | grep :3000

# Проверка подключения
curl -I http://127.0.0.1:3000

# Проверка логов Nginx
sudo tail -f /var/log/nginx/gnb-website.error.log
```

### Проблема: SSL не работает
```bash
# Проверка сертификата
sudo certbot certificates

# Обновление сертификата
sudo certbot renew

# Проверка конфигурации Nginx
sudo nginx -t
```

---

## 📞 Поддержка

После развертывания регулярно:
1. Проверяйте логи: `pm2 logs gnb-website`
2. Мониторьте ресурсы: `pm2 monit`
3. Обновляйте систему: `sudo apt update && sudo apt upgrade`
4. Создавайте резервные копии: `./backup-website.sh`
5. Проверяйте SSL сертификаты: `sudo certbot certificates`

**Сайт должен быть доступен по адресу: https://минипрокол.рф** 