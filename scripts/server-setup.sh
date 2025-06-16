#!/bin/bash

# Автоматический скрипт настройки сервера для проекта ГНБ-Эксперт
# Запускать от root: bash server-setup.sh

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Проверка что скрипт запущен от root
if [ "$EUID" -ne 0 ]; then
    print_error "Запустите скрипт от root: sudo bash server-setup.sh"
    exit 1
fi

print_header "Настройка сервера для проекта ГНБ-Эксперт"

# 1. Обновление системы
print_status "Обновление системы..."
apt update && apt upgrade -y

# 2. Установка базовых пакетов
print_status "Установка базовых пакетов..."
apt install -y curl wget git nano htop unzip software-properties-common build-essential

# 3. Установка Node.js 20.x
print_status "Установка Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Проверка версий
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_status "Установлен Node.js: $NODE_VERSION"
print_status "Установлен npm: $NPM_VERSION"

# 4. Установка PM2
print_status "Установка PM2..."
npm install -g pm2

# 5. Установка Nginx
print_status "Установка Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# 6. Установка Certbot
print_status "Установка Certbot..."
apt install -y snapd
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot

# 7. Установка файрвола
print_status "Установка UFW..."
apt install -y ufw

# 8. Создание пользователя
print_status "Создание пользователя gnb-expert..."
if ! id "gnb-expert" &>/dev/null; then
    adduser --disabled-password --gecos "" gnb-expert
    echo "gnb-expert:$(openssl rand -base64 12)" | chpasswd
    usermod -aG sudo gnb-expert
    print_status "Пользователь gnb-expert создан"
else
    print_warning "Пользователь gnb-expert уже существует"
fi

# 9. Настройка файрвола
print_status "Настройка файрвола..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
echo "y" | ufw enable

# 10. Создание директорий
print_status "Создание рабочих директорий..."
sudo -u gnb-expert mkdir -p /home/gnb-expert/{backups,logs}

# 11. Настройка Nginx - удаление дефолтного сайта
print_status "Настройка Nginx..."
rm -f /etc/nginx/sites-enabled/default

# 12. Создание базовой конфигурации Nginx
cat > /etc/nginx/sites-available/gnb-website << 'EOF'
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
EOF

# Активация сайта
ln -sf /etc/nginx/sites-available/gnb-website /etc/nginx/sites-enabled/

# Проверка конфигурации Nginx
if nginx -t; then
    systemctl reload nginx
    print_status "Nginx настроен успешно"
else
    print_error "Ошибка в конфигурации Nginx"
    exit 1
fi

# 13. Создание скриптов для пользователя
print_status "Создание вспомогательных скриптов..."

# Скрипт обновления проекта
cat > /home/gnb-expert/update-website.sh << 'EOF'
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
EOF

# Скрипт резервного копирования
cat > /home/gnb-expert/backup-website.sh << 'EOF'
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
    -C $PROJECT_DIR . 2>/dev/null

echo "Бэкап создан: gnb-website_$DATE.tar.gz"

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -name "gnb-website_*.tar.gz" -mtime +7 -delete
EOF

# Установка прав на скрипты
chown gnb-expert:gnb-expert /home/gnb-expert/*.sh
chmod +x /home/gnb-expert/*.sh

# 14. Создание шаблона .env
cat > /home/gnb-expert/.env.template << 'EOF'
NODE_ENV=production
NEXTAUTH_URL=https://минипрокол.рф
NEXTAUTH_SECRET=ЗАМЕНИТЕ_НА_СЛУЧАЙНУЮ_СТРОКУ_32_СИМВОЛА
ADMIN_PASSWORD=ЗАМЕНИТЕ_НА_СЛОЖНЫЙ_ПАРОЛЬ
PORT=3000
EOF

chown gnb-expert:gnb-expert /home/gnb-expert/.env.template

print_header "Настройка сервера завершена!"

print_status "✅ Установлено:"
echo "   - Node.js $NODE_VERSION"
echo "   - npm $NPM_VERSION"
echo "   - PM2 $(pm2 --version)"
echo "   - Nginx $(nginx -v 2>&1 | cut -d' ' -f3)"
echo "   - Certbot"
echo "   - UFW файрвол"

print_status "✅ Создан пользователь: gnb-expert"
print_status "✅ Настроен Nginx"
print_status "✅ Настроен файрвол"

print_header "Следующие шаги:"
echo "1. Переключитесь на пользователя: su - gnb-expert"
echo "2. Загрузите проект в /home/gnb-expert/gnb-website"
echo "3. Создайте .env.local на основе .env.template"
echo "4. Установите зависимости: npm install"
echo "5. Соберите проект: npm run build"
echo "6. Запустите через PM2: pm2 start ecosystem.config.js"
echo "7. Настройте DNS записи для домена минипрокол.рф"
echo "8. Установите SSL: sudo certbot --nginx -d минипрокол.рф -d www.минипрокол.рф"

print_status "Сервер готов к развертыванию проекта!"

# Показать информацию о сервере
print_header "Информация о сервере:"
echo "IP адрес: $(hostname -I | awk '{print $1}')"
echo "Hostname: $(hostname)"
echo "ОС: $(lsb_release -d | cut -f2)"
echo "Память: $(free -h | awk '/^Mem:/ {print $2}')"
echo "Диск: $(df -h / | awk 'NR==2 {print $2 " (" $5 " используется)"}')" 