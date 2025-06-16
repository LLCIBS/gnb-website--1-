# 🚀 Быстрое развертывание проекта ГНБ-Эксперт

## 📋 Что нужно для развертывания

1. **VPS сервер** с Ubuntu 20.04/22.04 LTS
2. **Домен** минипрокол.рф с настроенными DNS записями
3. **SSH доступ** к серверу

---

## ⚡ Автоматическое развертывание (рекомендуется)

### Шаг 1: Настройка сервера (от root)
```bash
# Подключение к серверу
ssh root@ВАШ_IP_СЕРВЕРА

# Загрузка и запуск скрипта настройки сервера
wget https://raw.githubusercontent.com/ваш-репозиторий/gnb-website/main/scripts/server-setup.sh
bash server-setup.sh
```

### Шаг 2: Развертывание проекта (от пользователя gnb-expert)
```bash
# Переключение на пользователя проекта
su - gnb-expert

# Загрузка и запуск скрипта развертывания
wget https://raw.githubusercontent.com/ваш-репозиторий/gnb-website/main/scripts/deploy-project.sh
bash deploy-project.sh
```

### Шаг 3: Установка SSL (от root)
```bash
# Переключение обратно на root
exit

# Установка SSL сертификата
sudo certbot --nginx -d минипрокол.рф -d www.минипрокол.рф
```

**Готово! Сайт доступен по адресу: https://минипрокол.рф**

---

## 🔧 Ручное развертывание

### 1. Настройка сервера
```bash
# Обновление системы
apt update && apt upgrade -y

# Установка Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Установка PM2, Nginx, Git
npm install -g pm2
apt install -y nginx git

# Создание пользователя
adduser gnb-expert
usermod -aG sudo gnb-expert
```

### 2. Загрузка проекта
```bash
# Переключение на пользователя
su - gnb-expert

# Клонирование проекта
git clone https://github.com/ваш-репозиторий/gnb-website.git
cd gnb-website

# Установка зависимостей
npm install
```

### 3. Настройка проекта
```bash
# Создание .env.local
cat > .env.local << EOF
NODE_ENV=production
NEXTAUTH_URL=https://минипрокол.рф
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ADMIN_PASSWORD=ваш-сложный-пароль
PORT=3000
EOF

# Сборка проекта
npm run build
```

### 4. Запуск через PM2
```bash
# Запуск приложения
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Настройка Nginx
```bash
# Создание конфигурации (от root)
sudo nano /etc/nginx/sites-available/gnb-website
```

Вставьте конфигурацию из файла `nginx-miniprокol.conf`

```bash
# Активация сайта
sudo ln -s /etc/nginx/sites-available/gnb-website /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Настройка DNS
В панели управления домена добавьте:
```
A    @      ВАШ_IP_СЕРВЕРА
A    www    ВАШ_IP_СЕРВЕРА
```

### 7. Установка SSL
```bash
sudo certbot --nginx -d минипрокол.рф -d www.минипрокол.рф
```

---

## 🔍 Проверка развертывания

### Проверка статуса сервисов
```bash
# Статус PM2
pm2 status

# Статус Nginx
sudo systemctl status nginx

# Проверка портов
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### Проверка сайта
```bash
# HTTP
curl -I http://минипрокол.рф

# HTTPS
curl -I https://минипрокол.рф

# Локальное приложение
curl -I http://127.0.0.1:3000
```

### Чек-лист работоспособности
- [ ] PM2 показывает статус "online"
- [ ] Nginx работает без ошибок
- [ ] Сайт открывается по HTTP
- [ ] Сайт открывается по HTTPS
- [ ] SSL сертификат валидный
- [ ] Все страницы загружаются
- [ ] Админ панель доступна (/admin)

---

## 🛠️ Управление проектом

### Полезные команды
```bash
# Просмотр логов
pm2 logs gnb-website

# Перезапуск приложения
pm2 restart gnb-website

# Мониторинг ресурсов
pm2 monit

# Обновление проекта
./update-website.sh

# Резервное копирование
./backup-website.sh
```

### Логи и отладка
```bash
# Логи PM2
pm2 logs gnb-website --lines 100

# Логи Nginx
sudo tail -f /var/log/nginx/gnb-website.error.log
sudo tail -f /var/log/nginx/gnb-website.access.log

# Системные логи
sudo journalctl -u nginx -f
```

---

## 🚨 Решение проблем

### Ошибка 502 Bad Gateway
```bash
# Запустите скрипт исправления
./scripts/fix-502.sh

# Или вручную:
pm2 restart gnb-website
sudo systemctl reload nginx
```

### PM2 показывает "errored"
```bash
pm2 logs gnb-website --lines 50
pm2 restart gnb-website

# Если не помогает:
pm2 stop gnb-website
pm2 delete gnb-website
pm2 start ecosystem.config.js
```

### SSL не работает
```bash
sudo certbot certificates
sudo certbot renew
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📞 Поддержка

### Регулярное обслуживание
```bash
# Обновление системы (раз в неделю)
sudo apt update && sudo apt upgrade

# Проверка логов (ежедневно)
pm2 logs gnb-website --lines 20

# Резервное копирование (автоматически через cron)
crontab -e
# 0 2 * * * /home/gnb-expert/backup-website.sh
```

### Мониторинг
- **Статус сайта**: https://минипрокол.рф
- **Админ панель**: https://минипрокол.рф/admin
- **PM2 мониторинг**: `pm2 monit`
- **Использование диска**: `df -h`
- **Использование памяти**: `free -h`

---

## 📁 Структура файлов на сервере

```
/home/gnb-expert/
├── gnb-website/           # Основной проект
│   ├── .env.local         # Переменные окружения
│   ├── ecosystem.config.js # Конфигурация PM2
│   ├── logs/              # Логи приложения
│   └── ...
├── backups/               # Резервные копии
├── update-website.sh      # Скрипт обновления
└── backup-website.sh      # Скрипт бэкапа
```

**Сайт должен быть доступен по адресу: https://минипрокол.рф** 