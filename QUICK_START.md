# Быстрый старт развертывания на VPS

## 🚀 Краткая инструкция

### 1. Подготовка сервера (Ubuntu 20.04/22.04)

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка необходимого ПО
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm install -g pm2
```

### 2. Клонирование проекта

```bash
git clone ваш-репозиторий gnb-website
cd gnb-website
npm install
```

### 3. Настройка окружения

```bash
cp .env.production.example .env.local
nano .env.local
```

Замените в `.env.local`:
- `ваш-домен.ru` на ваш реальный домен
- `ваш-секретный-ключ` на случайную строку 32+ символов
- `ваш-пароль-админки` на сложный пароль

### 4. Сборка и запуск

```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Настройка Nginx

```bash
sudo cp nginx.conf /etc/nginx/sites-available/gnb-website
sudo ln -s /etc/nginx/sites-available/gnb-website /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Настройка домена

В DNS панели домена добавьте A-записи:
- `@` → IP_ВАШЕГО_VPS
- `www` → IP_ВАШЕГО_VPS

### 7. SSL сертификат

```bash
sudo snap install --classic certbot
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

## ✅ Проверка

После настройки проверьте:
- [ ] Сайт открывается по HTTPS
- [ ] PM2 показывает статус "online": `pm2 status`
- [ ] Nginx работает: `sudo systemctl status nginx`

## 🔧 Полезные команды

```bash
# Просмотр логов
pm2 logs gnb-website

# Перезапуск приложения
pm2 restart gnb-website

# Обновление проекта
./scripts/deploy.sh

# Резервное копирование
./scripts/backup.sh
```

Подробная инструкция в файле `DEPLOYMENT.md` 