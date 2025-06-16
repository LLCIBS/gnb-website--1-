#!/bin/bash

# Скрипт резервного копирования для проекта ГНБ-Эксперт
# Использование: ./backup.sh [опции]

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
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
    echo -e "${BLUE}$1${NC}"
}

# Переменные
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/home/gnb-expert/gnb-website"
BACKUP_DIR="/home/gnb-expert/backups"
BACKUP_NAME="gnb-website_$DATE.tar.gz"
KEEP_DAYS=7

# Создание директории для бэкапов
mkdir -p "$BACKUP_DIR"

print_header "=== Резервное копирование проекта ГНБ-Эксперт ==="
print_status "Дата: $(date)"
print_status "Проект: $PROJECT_DIR"
print_status "Бэкап: $BACKUP_DIR/$BACKUP_NAME"

# Проверка существования директории проекта
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Директория проекта не найдена: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR" || {
    print_error "Не удается перейти в директорию проекта"
    exit 1
}

# Создание архива с исключениями
print_status "Создание архива..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME" \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='logs/*.log' \
    --exclude='.env.local' \
    --exclude='*.tmp' \
    --exclude='*.log' \
    . 2>/dev/null

if [ $? -eq 0 ]; then
    print_status "✅ Архив создан успешно"
    
    # Информация о размере архива
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)
    print_status "Размер архива: $BACKUP_SIZE"
else
    print_error "❌ Ошибка при создании архива"
    exit 1
fi

# Создание отдельного бэкапа конфигурационных файлов
print_status "Создание бэкапа конфигураций..."
CONFIG_BACKUP="$BACKUP_DIR/configs_$DATE.tar.gz"

# Бэкап конфигураций системы (если есть права)
if [ -r "/etc/nginx/sites-available/gnb-website" ]; then
    tar -czf "$CONFIG_BACKUP" \
        /etc/nginx/sites-available/gnb-website \
        /etc/letsencrypt/live/ \
        ~/.bashrc \
        ~/.profile 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_status "✅ Конфигурации сохранены"
    else
        print_warning "Частичная ошибка при сохранении конфигураций"
    fi
fi

# Бэкап базы данных (если используется)
if command -v pg_dump &> /dev/null; then
    print_status "Создание бэкапа базы данных..."
    DB_BACKUP="$BACKUP_DIR/database_$DATE.sql"
    
    # Замените на ваши настройки БД
    # pg_dump -h localhost -U username -d gnb_website > "$DB_BACKUP" 2>/dev/null
    # 
    # if [ $? -eq 0 ]; then
    #     print_status "✅ База данных сохранена"
    #     gzip "$DB_BACKUP"
    # else
    #     print_warning "Ошибка при создании бэкапа БД"
    # fi
fi

# Удаление старых бэкапов
print_status "Очистка старых бэкапов (старше $KEEP_DAYS дней)..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "gnb-website_*.tar.gz" -mtime +$KEEP_DAYS -delete -print | wc -l)
DELETED_CONFIGS=$(find "$BACKUP_DIR" -name "configs_*.tar.gz" -mtime +$KEEP_DAYS -delete -print | wc -l)
DELETED_DB=$(find "$BACKUP_DIR" -name "database_*.sql.gz" -mtime +$KEEP_DAYS -delete -print | wc -l)

if [ $DELETED_COUNT -gt 0 ] || [ $DELETED_CONFIGS -gt 0 ] || [ $DELETED_DB -gt 0 ]; then
    print_status "Удалено старых бэкапов: $((DELETED_COUNT + DELETED_CONFIGS + DELETED_DB))"
else
    print_status "Старых бэкапов для удаления не найдено"
fi

# Статистика бэкапов
print_status "Текущие бэкапы в $BACKUP_DIR:"
ls -lah "$BACKUP_DIR" | grep -E "(gnb-website_|configs_|database_)" | tail -5

# Проверка свободного места
DISK_USAGE=$(df -h "$BACKUP_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    print_warning "Использование диска: ${DISK_USAGE}%"
    print_warning "Рекомендуется очистить старые бэкапы"
fi

print_header "=== Резервное копирование завершено ==="
print_status "Основной бэкап: $BACKUP_NAME"
print_status "Время выполнения: $(date)"

# Проверка целостности архива
print_status "Проверка целостности архива..."
if tar -tzf "$BACKUP_DIR/$BACKUP_NAME" >/dev/null 2>&1; then
    print_status "✅ Архив целостный"
else
    print_error "❌ Архив поврежден!"
    exit 1
fi

exit 0 