# Установка DONELVIT OS v0.1

1. Распаковать архив в корень репозитория.
2. Установить Node.js 20 LTS или новее.
3. Выполнить `npm install`.
4. Скопировать `.env.example` в `.env.local`.
5. Вставить `NEXT_PUBLIC_SUPABASE_ANON_KEY` из Supabase → Project Settings → API.
6. В Supabase добавить `donelvit` в Exposed schemas.
7. Выполнить `npm run dev` и открыть `http://localhost:3000`.

До настройки Supabase интерфейс работает на демонстрационных данных.
