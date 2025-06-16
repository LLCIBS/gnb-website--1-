#!/bin/bash

# Скрипт развертывания проекта ГНБ-Эксперт
# Запускать от пользователя gnb-expert: bash deploy-project.sh

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

# Проверка что скрипт запущен от пользователя gnb-expert
if [ "$USER" != "gnb-expert" ]; then
    print_error "Запустите скрипт от пользователя gnb-expert: su - gnb-expert"
    exit 1
fi

print_header "Развертывание проекта ГНБ-Эксперт"

# Переход в домашнюю директорию
cd ~

# 1. Проверка наличия проекта
if [ ! -d "gnb-website" ]; then
    print_status "Проект не найден. Необходимо загрузить проект."
    
    # Предложение способов загрузки
    echo "Выберите способ загрузки проекта:"
    echo "1) Клонировать из Git репозитория"
    echo "2) Загрузить архив по ссылке"
    echo "3) Я загружу проект вручную"
    read -p "Введите номер (1-3): " choice
    
    case $choice in
        1)
            read -p "Введите URL Git репозитория: " git_url
            if [ -n "$git_url" ]; then
                git clone "$git_url" gnb-website
            else
                print_error "URL не указан"
                exit 1
            fi
            ;;
        2)
            read -p "Введите URL архива: " archive_url
            if [ -n "$archive_url" ]; then
                wget -O gnb-website.zip "$archive_url"
                unzip gnb-website.zip
                # Переименование директории если нужно
                if [ ! -d "gnb-website" ]; then
                    mv gnb-website* gnb-website 2>/dev/null || true
                fi
                rm -f gnb-website.zip
            else
                print_error "URL не указан"
                exit 1
            fi
            ;;
        3)
            print_status "Загрузите проект в директорию /home/gnb-expert/gnb-website"
            print_status "После загрузки запустите скрипт снова"
            exit 0
            ;;
        *)
            print_error "Неверный выбор"
            exit 1
            ;;
    esac
fi

# Переход в директорию проекта
cd gnb-website

# 2. Проверка структуры проекта
print_status "Проверка структуры проекта..."
required_files=("package.json" "next.config.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Отсутствует файл: $file"
        print_error "Убедитесь что это Next.js проект"
        exit 1
    fi
done

print_status "✅ Структура проекта корректна"

# 3. Создание .env.local
if [ ! -f ".env.local" ]; then
    print_status "Создание файла .env.local..."
    
    # Генерация секретного ключа
    SECRET_KEY=$(openssl rand -base64 32)
    
    cat > .env.local << EOF
NODE_ENV=production
NEXTAUTH_URL=https://минипрокол.рф
NEXTAUTH_SECRET=$SECRET_KEY
ADMIN_PASSWORD=admin123456
PORT=3000
EOF
    
    print_warning "Создан файл .env.local с базовыми настройками"
    print_warning "ОБЯЗАТЕЛЬНО измените ADMIN_PASSWORD на сложный пароль!"
    
    # Предложение отредактировать
    read -p "Хотите отредактировать .env.local сейчас? (y/n): " edit_env
    if [ "$edit_env" = "y" ] || [ "$edit_env" = "Y" ]; then
        nano .env.local
    fi
else
    print_status "✅ Файл .env.local уже существует"
fi

# 4. Установка зависимостей
print_status "Установка зависимостей..."
if npm install; then
    print_status "✅ Зависимости установлены"
else
    print_warning "Ошибка при установке зависимостей. Пробуем с --legacy-peer-deps..."
    npm install --legacy-peer-deps
fi

# 5. Сборка проекта
print_status "Сборка проекта для продакшена..."
if npm run build; then
    print_status "✅ Проект собран успешно"
else
    print_error "Ошибка при сборке проекта"
    print_error "Проверьте логи выше и исправьте ошибки"
    exit 1
fi

# 6. Создание конфигурации PM2
if [ ! -f "ecosystem.config.js" ]; then
    print_status "Создание конфигурации PM2..."
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
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    min_uptime: '10s',
    max_restarts: 10
  }]
}
EOF
    print_status "✅ Конфигурация PM2 создана"
fi

# 7. Создание директории для логов
mkdir -p logs

# 8. Тестовый запуск
print_status "Тестовый запуск приложения..."
timeout 10s npm start &
TEST_PID=$!
sleep 5

# Проверка что приложение запустилось
if curl -s -I http://localhost:3000 | grep -q "200\|301\|302"; then
    print_status "✅ Приложение запускается корректно"
    kill $TEST_PID 2>/dev/null || true
else
    print_warning "Приложение может иметь проблемы при запуске"
    kill $TEST_PID 2>/dev/null || true
fi

# 9. Запуск через PM2
print_status "Запуск приложения через PM2..."

# Остановка и удаление старого процесса если есть
pm2 stop gnb-website 2>/dev/null || true
pm2 delete gnb-website 2>/dev/null || true

# Запуск нового процесса
if pm2 start ecosystem.config.js; then
    print_status "✅ Приложение запущено через PM2"
else
    print_error "Ошибка при запуске через PM2"
    exit 1
fi

# Сохранение конфигурации PM2
pm2 save

# Настройка автозапуска PM2
pm2 startup | grep -E '^sudo' | bash || true

# 10. Проверка статуса
sleep 5
print_status "Проверка статуса приложения..."
pm2 status

# Проверка что приложение работает
if pm2 status | grep -q "gnb-website.*online"; then
    print_status "✅ Приложение работает"
else
    print_error "❌ Приложение не запущено"
    print_status "Логи PM2:"
    pm2 logs gnb-website --lines 20
    exit 1
fi

# 11. Проверка подключения
print_status "Проверка подключения к приложению..."
if curl -s -I http://127.0.0.1:3000 | grep -q "200\|301\|302"; then
    print_status "✅ Приложение отвечает на порту 3000"
else
    print_warning "❌ Приложение не отвечает на порту 3000"
    print_status "Логи приложения:"
    pm2 logs gnb-website --lines 10
fi

print_header "Развертывание завершено!"

print_status "✅ Что сделано:"
echo "   - Проект загружен в /home/gnb-expert/gnb-website"
echo "   - Зависимости установлены"
echo "   - Проект собран для продакшена"
echo "   - Создан файл .env.local"
echo "   - Настроен PM2"
echo "   - Приложение запущено"

print_header "Следующие шаги:"
echo "1. Проверьте что DNS записи настроены для домена минипрокол.рф"
echo "2. Проверьте доступность сайта: curl -I http://минипрокол.рф"
echo "3. Установите SSL сертификат:"
echo "   sudo certbot --nginx -d минипрокол.рф -d www.минипрокол.рф"
echo "4. Проверьте сайт в браузере: https://минипрокол.рф"

print_header "Полезные команды:"
echo "pm2 status                    # Статус приложения"
echo "pm2 logs gnb-website          # Логи приложения"
echo "pm2 restart gnb-website       # Перезапуск приложения"
echo "pm2 monit                     # Мониторинг в реальном времени"
echo "./update-website.sh           # Обновление проекта"
echo "./backup-website.sh           # Резервное копирование"

print_status "Проект ГНБ-Эксперт успешно развернут!"

# Показать финальную информацию
print_header "Информация о развертывании:"
echo "Проект: /home/gnb-expert/gnb-website"
echo "Порт: 3000"
echo "PM2 процесс: gnb-website"
echo "Логи: /home/gnb-expert/gnb-website/logs/"
echo "Домен: минипрокол.рф"
echo "Статус PM2: $(pm2 status | grep gnb-website | awk '{print $10}')" 