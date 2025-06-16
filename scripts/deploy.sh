#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода с цветом
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка наличия PM2
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 не установлен. Установите PM2: npm install -g pm2"
    exit 1
fi

# Основная директория проекта
PROJECT_DIR="/home/gnb-expert/gnb-website"
LOG_DIR="$PROJECT_DIR/logs"

# Переход в директорию проекта
cd $PROJECT_DIR || {
    print_error "Не удается перейти в директорию проекта: $PROJECT_DIR"
    exit 1
}

print_status "Начинаем развертывание проекта ГНБ-Эксперт..."

# Создание директории для логов
mkdir -p $LOG_DIR

# Остановка приложения
print_status "Остановка приложения..."
pm2 stop gnb-website 2>/dev/null || print_warning "Приложение не было запущено"

# Обновление кода из Git
print_status "Обновление кода из репозитория..."
git fetch origin
git reset --hard origin/main

# Проверка наличия .env.local
if [ ! -f ".env.local" ]; then
    print_warning "Файл .env.local не найден. Создайте его перед развертыванием."
    cat << EOF > .env.local
NODE_ENV=production
NEXTAUTH_URL=https://ваш-домен.ru
NEXTAUTH_SECRET=ваш-секретный-ключ-минимум-32-символа
ADMIN_PASSWORD=ваш-пароль-админки
EOF
    print_status "Создан шаблон .env.local. Отредактируйте его перед продолжением."
fi

# Установка/обновление зависимостей
print_status "Установка зависимостей..."
npm ci --only=production

# Сборка проекта
print_status "Сборка проекта..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Ошибка при сборке проекта"
    exit 1
fi

# Запуск приложения
print_status "Запуск приложения..."
pm2 start ecosystem.config.js --env production

# Сохранение конфигурации PM2
pm2 save

# Проверка статуса
sleep 5
pm2 status gnb-website

if pm2 status gnb-website | grep -q "online"; then
    print_status "✅ Развертывание завершено успешно!"
    print_status "Сайт доступен на http://localhost:3000"
    print_status "Логи: pm2 logs gnb-website"
else
    print_error "❌ Ошибка при запуске приложения"
    print_error "Проверьте логи: pm2 logs gnb-website"
    exit 1
fi 