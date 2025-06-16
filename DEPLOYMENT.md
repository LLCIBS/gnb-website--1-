# Инструкция по развертыванию проекта ГНБ-Эксперт на VPS

## 1. Подготовка VPS сервера

### 1.1 Требования к серверу
- **ОС**: Ubuntu 20.04/22.04 LTS или CentOS 8+
- **RAM**: минимум 1GB (рекомендуется 2GB+)
- **CPU**: 1 ядро (рекомендуется 2+)
- **Диск**: минимум 20GB SSD
- **Сеть**: статический IP адрес

### 1.2 Первоначальная настройка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Создание пользователя для проекта
sudo adduser gnb-expert
sudo usermod -aG sudo gnb-expert

# Переключение на нового пользователя
su - gnb-expert

# Настройка SSH ключей (опционально)
mkdir ~/.ssh
chmod 700 ~/.ssh
# Скопируйте ваш публичный ключ в ~/.ssh/authorized_keys
```

## 2. Установка необходимого ПО

### 2.1 Установка Node.js

```bash
# Установка Node.js 20.x через NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверка версии
node --version
npm --version
```

### 2.2 Установка PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Настройка автозапуска PM2
pm2 startup
# Выполните команду, которую выдаст PM2
```

### 2.3 Установка Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Проверка статуса
sudo systemctl status nginx
```

### 2.4 Установка Git

```bash
sudo apt install git -y
```

## 3. Загрузка и настройка проекта

### 3.1 Клонирование репозитория

```bash
# Переход в домашнюю директорию
cd ~

# Клонирование проекта (замените на ваш репозиторий)
git clone https://github.com/your-username/gnb-website.git
cd gnb-website
```

### 3.2 Установка зависимостей

```bash
npm install
```

### 3.3 Создание файла окружения

```bash
# Создание .env.local
nano .env.local
```

Добавьте следующие переменные:

```env
NODE_ENV=production
NEXTAUTH_URL=https://ваш-домен.ru
NEXTAUTH_SECRET=ваш-секретный-ключ-минимум-32-символа
ADMIN_PASSWORD=ваш-пароль-админки
```

### 3.4 Сборка проекта

```bash
npm run build
```

## 4. Настройка PM2

### 4.1 Создание конфигурации PM2

```bash
nano ecosystem.config.js
```

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
    }
  }]
}
```

### 4.2 Запуск приложения

```bash
pm2 start ecosystem.config.js
pm2 save
```

## 5. Настройка Nginx

### 5.1 Создание конфигурации сайта

```bash
sudo nano /etc/nginx/sites-available/gnb-website
```

```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Кэширование статических файлов
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /images/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

### 5.2 Активация сайта

```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/gnb-website /etc/nginx/sites-enabled/

# Удаление дефолтного сайта
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl reload nginx
```

## 6. Настройка домена

### 6.1 DNS записи

В панели управления вашего домена добавьте следующие DNS записи:

```
Тип    Имя    Значение           TTL
A      @      IP_ВАШЕГО_VPS      3600
A      www    IP_ВАШЕГО_VPS      3600
```

### 6.2 Проверка подключения

После обновления DNS (может занять до 24 часов) проверьте:

```bash
# Проверка доступности
curl -I http://ваш-домен.ru

# Проверка DNS
nslookup ваш-домен.ru
```

## 7. Установка SSL сертификата

### 7.1 Установка Certbot

```bash
sudo apt install snapd -y
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 7.2 Получение SSL сертификата

```bash
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

### 7.3 Автоматическое обновление сертификата

```bash
# Проверка автообновления
sudo certbot renew --dry-run

# Добавление в cron (автоматически делается Certbot)
```

## 8. Настройка автоматического обновления

### 8.1 Создание скрипта деплоя

```bash
nano ~/deploy.sh
```

```bash
#!/bin/bash
cd /home/gnb-expert/gnb-website

# Остановка приложения
pm2 stop gnb-website

# Обновление кода
git pull origin main

# Установка зависимостей
npm install

# Сборка проекта
npm run build

# Запуск приложения
pm2 start gnb-website

echo "Deployment completed!"
```

```bash
chmod +x ~/deploy.sh
```

### 8.2 Использование скрипта

```bash
# Для обновления проекта выполните:
./deploy.sh
```

## 9. Мониторинг и логи

### 9.1 PM2 команды

```bash
# Просмотр статуса
pm2 status

# Просмотр логов
pm2 logs gnb-website

# Рестарт приложения
pm2 restart gnb-website

# Мониторинг в реальном времени
pm2 monit
```

### 9.2 Nginx логи

```bash
# Логи доступа
sudo tail -f /var/log/nginx/access.log

# Логи ошибок
sudo tail -f /var/log/nginx/error.log
```

## 10. Безопасность

### 10.1 Настройка файрвола

```bash
# Установка UFW
sudo apt install ufw -y

# Настройка правил
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Включение файрвола
sudo ufw enable
```

### 10.2 Дополнительные меры безопасности

```bash
# Изменение порта SSH (опционально)
sudo nano /etc/ssh/sshd_config
# Измените Port 22 на другой порт

# Отключение root логина
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no

# Перезапуск SSH
sudo systemctl restart ssh
```

## 11. Резервное копирование

### 11.1 Создание скрипта бэкапа

```bash
nano ~/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/gnb-expert/backups"
PROJECT_DIR="/home/gnb-expert/gnb-website"

mkdir -p $BACKUP_DIR

# Создание архива проекта
tar -czf $BACKUP_DIR/gnb-website_$DATE.tar.gz -C $PROJECT_DIR .

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -name "gnb-website_*.tar.gz" -mtime +7 -delete

echo "Backup created: gnb-website_$DATE.tar.gz"
```

```bash
chmod +x ~/backup.sh

# Добавление в crontab для ежедневного бэкапа
crontab -e
# Добавьте строку: 0 2 * * * /home/gnb-expert/backup.sh
```

## 12. Проверка работоспособности

### 12.1 Чек-лист после деплоя

- [ ] Сайт открывается по HTTP
- [ ] Сайт открывается по HTTPS
- [ ] SSL сертификат валидный
- [ ] Все страницы загружаются корректно
- [ ] Формы отправляются успешно
- [ ] Админ панель доступна по /admin
- [ ] PM2 показывает статус "online"
- [ ] Nginx работает без ошибок

### 12.2 Команды для проверки

```bash
# Проверка статуса сервисов
sudo systemctl status nginx
pm2 status

# Проверка портов
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
sudo netstat -tlnp | grep :3000

# Проверка SSL
curl -I https://ваш-домен.ru
```

## Поддержка и обновления

После успешного деплоя регулярно:

1. Обновляйте систему: `sudo apt update && sudo apt upgrade`
2. Обновляйте Node.js и npm при необходимости
3. Проверяйте логи на ошибки
4. Создавайте резервные копии
5. Мониторьте производительность

Для получения помощи проверьте логи и используйте команды мониторинга, описанные выше. 