# PostgreSQL пароль
export PGPASSWORD='65336435'

# ============================================
# ОБЩИЕ АЛИАСЫ
# ============================================

# Редактирование .bashrc
alias bashrc='code ~/.bashrc'
alias reload='source ~/.bashrc'

# SSH
alias yandex='ssh simonenkonikita@51.250.43.36'

# PostgreSQL (Windows fix)
alias psql='winpty "/c/Program Files/PostgreSQL/18/bin/psql"'

# PostgreSQL aliases
alias psql-ipoteka='psql -U postgres -d ipoteka_db'
alias psql-list='psql -U postgres -l'

# ============================================
# ПРОЕКТ CALC
# ============================================

# Путь к проекту
export CALC_PATH=~/project/calc

# ---- Навигация ----
alias calc='cd $CALC_PATH'
alias calc-be='cd $CALC_PATH/backend'
alias calc-fe='cd $CALC_PATH/frontend'

# ---- Быстрый запуск (короткие) ----
alias be='cd $CALC_PATH/backend && npm run dev'
alias fe='cd $CALC_PATH/frontend && npm run dev'
alias b='be'
alias f='fe'

# ---- Полные названия ----
alias backend='be'
alias frontend='fe'

# ---- Запуск в фоне ----
alias start-all='cd $CALC_PATH/backend && npm run dev & cd $CALC_PATH/frontend && npm run dev'

# ---- Запуск с установкой зависимостей ----
be-install() {
    echo "📦 Устанавливаем зависимости для бэкенда..."
    cd $CALC_PATH/backend
    npm install
    echo "🚀 Запускаем бэкенд..."
    npm run dev
}

fe-install() {
    echo "📦 Устанавливаем зависимости для фронтенда..."
    cd $CALC_PATH/frontend
    npm install
    echo "🚀 Запускаем фронтенд..."
    npm run dev
}

# ---- Управление процессами ----
status() {
    echo "🔍 Статус процессов:"
    echo "─────────────────────"
    
    if netstat -ano 2>/dev/null | findstr ":3001" | findstr "LISTENING" > /dev/null; then
        PID=$(netstat -ano 2>/dev/null | findstr ":3001" | findstr "LISTENING" | awk '{print $5}' | head -1)
        echo "✅ Бэкенд ЗАПУЩЕН (порт 3001, PID: $PID)"
    else
        echo "❌ Бэкенд НЕ запущен (порт 3001)"
    fi
    
    if netstat -ano 2>/dev/null | findstr ":5173" | findstr "LISTENING" > /dev/null; then
        PID=$(netstat -ano 2>/dev/null | findstr ":5173" | findstr "LISTENING" | awk '{print $5}' | head -1)
        echo "✅ Фронтенд ЗАПУЩЕН (порт 5173, PID: $PID)"
    else
        echo "❌ Фронтенд НЕ запущен (порт 5173)"
    fi
    echo "─────────────────────"
}

stop-all() {
    echo "🛑 Останавливаем все процессы..."
    
    PID=$(netstat -ano 2>/dev/null | findstr ":3001" | findstr "LISTENING" | awk '{print $5}' | head -1)
    if [ -n "$PID" ]; then
        taskkill //F //PID $PID 2>/dev/null && echo "✅ Бэкенд остановлен (PID: $PID)" || echo "❌ Не удалось остановить бэкенд"
    else
        echo "ℹ️ Бэкенд не был запущен"
    fi
    
    PID=$(netstat -ano 2>/dev/null | findstr ":5173" | findstr "LISTENING" | awk '{print $5}' | head -1)
    if [ -n "$PID" ]; then
        taskkill //F //PID $PID 2>/dev/null && echo "✅ Фронтенд остановлен (PID: $PID)" || echo "❌ Не удалось остановить фронтенд"
    else
        echo "ℹ️ Фронтенд не был запущен"
    fi
    
    echo "✅ Готово!"
}

# ---- Короткая команда перезапуска ----
ssa() {
    stop-all
    echo "─────────────────────────────"
    start-all
}

# ---- Запуск в отдельных окнах (Windows) ----
be-win() {
    echo "🪟 Открываем новое окно для бэкенда..."
    start bash -c "cd $CALC_PATH/backend && npm run dev; exec bash"
}

fe-win() {
    echo "🪟 Открываем новое окно для фронтенда..."
    start bash -c "cd $CALC_PATH/frontend && npm run dev; exec bash"
}

start-all-win() {
    echo "🪟 Открываем окна для бэкенда и фронтенда..."
    be-win
    fe-win
}

# ============================================
# JSON ВЫВОД POSTGRESQL (рабочая версия)
# ============================================

# Папка для экспорта JSON
export DB_EXPORT_PATH="$CALC_PATH/db-export"

# Создать папку если её нет
mkdir -p "$DB_EXPORT_PATH"

# Алиас для перехода в папку с экспортом
alias db-export='cd $DB_EXPORT_PATH'
alias db-export-ls='ls -lh $DB_EXPORT_PATH'

psql-tables() {
    psql -U postgres -d ipoteka_db -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
}

psql-json() {
    if [ -z "$1" ]; then
        echo "❌ Использование: psql-json <имя_таблицы>"
        echo "📌 Доступные таблицы:"
        psql-tables
        return 1
    fi
    PGCLIENTENCODING=UTF8 psql -U postgres -d ipoteka_db -At -c "SELECT json_agg(t) FROM $1 t;"
}

# Добавить PostgreSQL в PATH
export PATH="/c/Program Files/PostgreSQL/18/bin:$PATH"

psql-json-save() {
    if [ -z "$1" ]; then
        echo "❌ Использование: psql-json-save <имя_таблицы> [имя_файла]"
        return 1
    fi
    
    mkdir -p "$DB_EXPORT_PATH"
    FILE="${2:-$DB_EXPORT_PATH/$1.json}"
    echo "📤 Экспорт $1 в $FILE..."
    PGCLIENTENCODING=UTF8 psql -U postgres -d ipoteka_db -t -A -o "$FILE" -c "SELECT json_agg(t) FROM $1 t;"
    echo "✅ Сохранено в $FILE"
    ls -lh "$FILE"
}

psql-json-limit() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        echo "❌ Использование: psql-json-limit <имя_таблицы> <количество>"
        return 1
    fi
    PGCLIENTENCODING=UTF8 psql -U postgres -d ipoteka_db -At -c "SELECT json_agg(t) FROM (SELECT * FROM $1 LIMIT $2) t;"
}

# Экспорт всех таблиц
psql-export-all() {
    echo "📦 Экспорт всех таблиц в $DB_EXPORT_PATH..."
    mkdir -p "$DB_EXPORT_PATH"
    
    # Устанавливаем кодировку UTF-8
    export PGCLIENTENCODING=UTF8
    export PATH="/c/Program Files/PostgreSQL/18/bin:$PATH"
    
    TABLES="banks offers programs complexes apartment_types config dynamic_rates dynamic_subsidies"
    
    for table in $TABLES; do
        echo "  📤 $table..."
        count=$( "/c/Program Files/PostgreSQL/18/bin/psql" -U postgres -d ipoteka_db -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
        if [ -n "$count" ] && [ "$count" -gt 0 ]; then
            "/c/Program Files/PostgreSQL/18/bin/psql" -U postgres -d ipoteka_db -t -A -o "$DB_EXPORT_PATH/${table}.json" -c "SELECT json_agg(t) FROM $table t;" 2>/dev/null
            echo "     ✅ $count записей"
        else
            echo "     ⚠️ Таблица пуста или не существует"
            echo '[]' > "$DB_EXPORT_PATH/${table}.json"
        fi
    done
    
    echo "✅ Готово!"
    echo "─────────────────────────────"
    ls -lh "$DB_EXPORT_PATH"
}

# ---- Полезные комбинации ----
alias logs='cd $CALC_PATH && echo "📁 В папке проекта. Используйте: be или fe"'
alias restart-be='stop-all && be'
alias restart-fe='stop-all && fe'

echo "✅ Все алиасы загружены!"
echo "─────────────────────────────"
echo "📌 Команды проекта calc:"
echo "  be / backend  - запустить бэкенд"
echo "  fe / frontend - запустить фронтенд"
echo "  b / f         - супер-короткие"
echo "  status        - проверить что запущено"
echo "  stop-all      - остановить всё"
echo "  be-win / fe-win - запустить в новом окне"
echo "─────────────────────────────"