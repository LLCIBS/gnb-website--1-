#!/bin/bash

# Скрипт для исправления ошибки 502 Bad Gateway
# Использование: ./fix-502.sh

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

print_header "Исправление ошибки 502 Bad Gateway"

# Проверка PM2
print_status "Проверка статуса PM2..."
if command -v pm2 &> /dev/null; then
    pm2 status
    
    if ! pm2 status | grep -q "gnb-website.*online"; then
        print_warning "Приложение не запущено. Запускаем..."
        
        cd /home/gnb-expert/gnb-website || {
            print_error "Не удается перейти в директорию проекта"
            exit 1
        }
        
        # Остановка и удаление старого процесса
        pm2 stop gnb-website 2>/dev/null
        pm2 delete gnb-website 2>/dev/null
        
        # Запуск нового процесса
        pm2 start ecosystem.config.js
        pm2 save
        
        sleep 5
        pm2 status
    else
        print_status "✅ Приложение запущено"
    fi
else
    print_error "PM2 не установлен"
    exit 1
fi

# Проверка порта 3000
print_status "Проверка порта 3000..."
if netstat -tlnp 2>/dev/null | grep -q ":3000"; then
    print_status "✅ Порт 3000 занят"
    netstat -tlnp | grep ":3000"
else
    print_error "❌ Порт 3000 не занят"
    print_error "Приложение не слушает на порту 3000"
    
    print_status "Логи PM2:"
    pm2 logs gnb-website --lines 20
    exit 1
fi

# Проверка подключения к приложению
print_status "Проверка подключения к приложению..."
if curl -s -I http://127.0.0.1:3000 | grep -q "200\|301\|302"; then
    print_status "✅ Приложение отвечает на порту 3000"
else
    print_error "❌ Приложение не отвечает на порту 3000"
    
    print_status "Попытка перезапуска..."
    pm2 restart gnb-website
    sleep 10
    
    if curl -s -I http://127.0.0.1:3000 | grep -q "200\|301\|302"; then
        print_status "✅ После перезапуска приложение работает"
    else
        print_error "❌ Приложение все еще не отвечает"
        print_status "Логи приложения:"
        pm2 logs gnb-website --lines 30
        exit 1
    fi
fi

# Проверка конфигурации Nginx
print_status "Проверка конфигурации Nginx..."
if sudo nginx -t; then
    print_status "✅ Конфигурация Nginx корректна"
else
    print_error "❌ Ошибка в конфигурации Nginx"
    exit 1
fi

# Проверка статуса Nginx
print_status "Проверка статуса Nginx..."
if systemctl is-active --quiet nginx; then
    print_status "✅ Nginx запущен"
else
    print_warning "Nginx не запущен. Запускаем..."
    sudo systemctl start nginx
fi

# Перезагрузка Nginx
print_status "Перезагрузка конфигурации Nginx..."
sudo systemctl reload nginx

# Проверка логов Nginx
print_status "Последние ошибки Nginx:"
sudo tail -n 10 /var/log/nginx/error.log

# Финальная проверка
print_status "Финальная проверка сайта..."
sleep 3

if curl -s -I http://минипрокол.рф | grep -q "200\|301\|302"; then
    print_status "✅ Сайт работает!"
    print_status "Проверьте: http://минипрокол.рф"
else
    print_warning "Сайт все еще недоступен"
    
    print_status "Дополнительная диагностика:"
    echo "1. Проверьте DNS:"
    nslookup минипрокол.рф
    
    echo -e "\n2. Проверьте доступность через IP:"
    SERVER_IP=$(hostname -I | awk '{print $1}')
    echo "curl -H 'Host: минипрокол.рф' http://$SERVER_IP"
    
    echo -e "\n3. Логи Nginx:"
    sudo tail -n 5 /var/log/nginx/miniprокol.error.log 2>/dev/null || echo "Лог файл не найден"
fi

print_header "Диагностика завершена" 