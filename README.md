# beauty-salon-booking
Командный проект: веб-приложение онлайн-записи для салона красоты
# 💇‍♀️ Онлайн-запись в салон красоты

Веб-приложение для онлайн-записи на услуги салона красоты.  
Проект выполнен в рамках дисциплины **«Технологии веб-программирования»** (Траектория «Юпитер»).

---

## 👥 Команда и распределение ролей

* **Backend-разработчик:**  — разработка REST API, бизнес-логика расчета слотов и защиты от двойной записи, база данных, авторизация (JWT), Swagger-документация.
* **Frontend-разработчик:** — клиентское SPA-приложение на React, маршрутизация, формы, адаптивная верстка (Tailwind CSS), интеграция с API.

---

## 🛠 Технологический стек

### Backend
* **Язык:** Python 3.10+
* **Фреймворк:** Django 5.x + Django REST Framework (DRF)
* **База данных:** PostgreSQL
* **Авторизация:** JWT (SimpleJWT)
* **Документация API:** OpenAPI 3.0 / Swagger UI (`drf-spectacular`)

### Frontend
* **Язык:** JavaScript
* **Библиотека UI:** React 18+ (Vite)
* **Маршрутизация:** React Router v6 (Single Page Application)
* **Стилизация:** Tailwind CSS
* **HTTP-клиент:** Axios / Fetch API

---
# 📁 Структура проекта
```text
beauty-salon-booking/
├── backend/
│   ├── config/          # settings.py, urls.py, wsgi/asgi
│   ├── accounts/        # кастомный User, роли, auth API (JWT), управление пользователями
│   ├── catalog/         # категории услуг, услуги, рабочие места
│   ├── masters/         # мастера, услуги мастера, смены, отсутствия
│   ├── bookings/        # расчёт слотов, записи, история статусов, отзывы
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example     # шаблон переменных окружения
│   └── schema.yml       # сгенерированная OpenAPI-схема
├── frontend/
│   ├── src/
│   │   ├── api/         # axios-клиент и модули запросов к API
│   │   ├── components/  # Layout, AdminLayout, таблицы, модальные окна, UI-кит
│   │   ├── context/     # AuthContext
│   │   ├── hooks/       # useAdminData и др.
│   │   ├── pages/       # Home, Services, Masters, Booking, MyBookings, Admin/*
│   │   ├── routes/      # ProtectedRoute
│   │   └── utils/
│   ├── package.json
│   └── .env.example     # шаблон VITE_API_URL
└── README.md
```
---
## 🚀 Быстрый старт
Понадобятся **два терминала**: один для backend, второй для frontend.
### Терминал 1 — backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env      # затем заполнить DB_* и SECRET_KEY
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
### Терминал 2 — frontend
```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```
После этого:
* frontend — <http://localhost:5173>
* backend API — <http://127.0.0.1:8000/api/>
* Swagger UI — <http://127.0.0.1:8000/api/docs/>
Ниже — те же шаги подробно, с проверками и типичными ошибками.
---
## 📦 Подробная установка
### 0. Что должно быть установлено
| Инструмент | Версия | Проверка |
| --- | --- | --- |
| Python | 3.12+ | `python --version` |
| PostgreSQL | 14+ | `psql --version` |
| Node.js | 20.19+ или 22 LTS | `node --version` |
| npm | 10+ | `npm --version` |
| Git | любая актуальная | `git --version` |
> Если `psql` не находится в `PATH`, добавьте каталог `C:\Program Files\PostgreSQL\<версия>\bin`
> или используйте pgAdmin / Docker (см. ниже).
### 1. Клонировать репозиторий
```powershell
git clone https://github.com/Google24/beauty-salon-booking.git
cd beauty-salon-booking
```
### 2. Подготовить базу данных PostgreSQL
Создайте базу и отдельного пользователя (через `psql` или pgAdmin):
```sql
CREATE DATABASE beauty_salon;
CREATE USER beauty_user WITH PASSWORD 'beauty_password';
ALTER DATABASE beauty_salon OWNER TO beauty_user;
```
Если PostgreSQL не установлен локально, его можно поднять в Docker:
```powershell
docker run --name beauty-pg -e POSTGRES_PASSWORD=beauty_password `
  -e POSTGRES_DB=beauty_salon -p 5432:5432 -d postgres:16
```
Проверка подключения:
```powershell
psql -U beauty_user -d beauty_salon -c "SELECT version();"
```
### 3. Запустить backend
```powershell
cd backend
```
**3.1. Виртуальное окружение**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```
Если PowerShell блокирует активацию:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
**3.2. Зависимости**
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```
**3.3. Переменные окружения**
```powershell
copy .env.example .env
```
Откройте `backend/.env` и заполните значения (см. раздел «Переменные окружения»).
Файл `.env` **не коммитится** — он есть только у вас локально.
**3.4. Миграции и администратор**
```powershell
python manage.py migrate
python manage.py createsuperuser
```
`createsuperuser` создаёт пользователя с `is_superuser=True` — он получает полный доступ
и к Django Admin (`/admin/`), и к React-админке (`/admin`).
**3.5. Запуск**
```powershell
python manage.py runserver
```
Проверка: <http://127.0.0.1:8000/api/health/> должен вернуть `{"status": "ok"}`.
### 4. Запустить frontend
Во втором терминале:
```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```
Vite поднимет dev-сервер на <http://localhost:5173>. Если порт 5173 занят, Vite
предложит следующий (например, 5174) — этот адрес уже добавлен в `CORS_ALLOWED_ORIGINS`,
но при другом порте его нужно дописать в `backend/config/settings.py`.
### 5. Проверить, что всё работает
| Что проверить | Где |
| --- | --- |
| Health-эндпоинт | <http://127.0.0.1:8000/api/health/> |
| Swagger UI (список всех эндпоинтов) | <http://127.0.0.1:8000/api/docs/> |
| ReDoc | <http://127.0.0.1:8000/api/redoc/> |
| Django Admin (наполнение данными) | <http://127.0.0.1:8000/admin/> |
| Клиентская часть | <http://localhost:5173> |
| React-админка | <http://localhost:5173/admin> (после входа админом) |
Минимальная проверка сценария:
1. войти в Django Admin и создать категорию, услугу, рабочее место, мастера и смену;
2. открыть <http://localhost:5173>, выбрать услугу и мастера;
3. выбрать дату — должны появиться свободные слоты;
4. создать запись и увидеть её в личном кабинете;
5. войти администратором в `/admin` → `/admin/bookings` и сменить статус записи.
---
## 🔐 Переменные окружения
### `backend/.env`
| Переменная | Обязательна | Пример | Назначение |
| --- | --- | --- | --- |
| `DB_NAME` | да | `beauty_salon` | имя базы данных |
| `DB_USER` | да | `beauty_user` | пользователь PostgreSQL |
| `DB_PASSWORD` | да | `beauty_password` | пароль пользователя БД |
| `DB_HOST` | нет | `localhost` | хост БД (по умолчанию `localhost`) |
| `DB_PORT` | нет | `5432` | порт БД (по умолчанию `5432`) |
| `SECRET_KEY` | да | длинная случайная строка | секретный ключ Django |
| `DEBUG` | нет | `True` | режим отладки (по умолчанию `True`) |
Сгенерировать `SECRET_KEY`:
```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
### `frontend/.env`
| Переменная | Пример | Назначение |
| --- | --- | --- |
| `VITE_API_URL` | `http://127.0.0.1:8000/api` | базовый URL backend API (без слэша в конце) |
---
## 🌐 Адреса
| Сервис | URL |
| --- | --- |
| Frontend (dev) | <http://localhost:5173> |
| Backend API | <http://127.0.0.1:8000/api/> |
| Swagger UI | <http://127.0.0.1:8000/api/docs/> |
| ReDoc | <http://127.0.0.1:8000/api/redoc/> |
| OpenAPI-схема | <http://127.0.0.1:8000/api/schema/> |
| Health-check | <http://127.0.0.1:8000/api/health/> |
| Django Admin | <http://127.0.0.1:8000/admin/> |
---
## 🔌 Основные маршруты API
Полный и всегда актуальный список — в Swagger UI. Ниже — самое нужное.
| Метод и путь | Назначение | Доступ |
| --- | --- | --- |
| `POST /api/auth/register/` | регистрация клиента | публично |
| `POST /api/auth/login/` | вход, выдача `access` + `refresh` | публично |
| `POST /api/auth/token/refresh/` | обновление `access` по `refresh` | публично |
| `GET/PATCH /api/auth/me/` | профиль текущего пользователя | по токену |
| `POST /api/auth/change-password/` | смена пароля | по токену |
| `CRUD /api/auth/users/` | управление пользователями | admin |
| `CRUD /api/catalog/categories/` | категории услуг | чтение публично, запись admin |
| `CRUD /api/catalog/services/` | услуги | чтение публично, запись admin |
| `CRUD /api/catalog/workplaces/` | рабочие места | чтение публично, запись admin |
| `CRUD /api/masters/` | мастера | чтение публично, запись admin |
| `CRUD /api/masters/master-services/` | какие услуги оказывает мастер | admin |
| `CRUD /api/masters/schedules/` | смены мастеров | admin / мастер |
| `CRUD /api/masters/absences/` | отсутствия мастеров | admin / мастер |
| `GET /api/bookings/slots/?master=&service=&date=` | свободные слоты на дату | публично |
| `CRUD /api/bookings/bookings/` | записи (клиент видит только свои) | по токену |
| `POST /api/bookings/bookings/{id}/cancel/` | отмена записи | владелец / admin |
| `PATCH /api/bookings/bookings/{id}/status/` | смена статуса | admin |
| `PATCH /api/bookings/bookings/{id}/admin-status/` | смена статуса из админ-панели (любые переходы) | admin |
| `GET /api/bookings/bookings/{id}/history/` | история статусов записи | по токену |
| `GET /api/bookings/reviews/` | отзывы | admin |
Авторизация — заголовок `Authorization: Bearer <access_token>`.
---
## 👤 Роли
| Роль | Что может |
| --- | --- |
| `client` | смотреть каталог и слоты, создавать и отменять свои записи, оставить отзыв о выполненной записи |
| `master` | видеть свои записи, управлять своими сменами и отсутствиями |
| `admin` | полный доступ: каталог, мастера, расписания, все записи, статусы, пользователи |
При регистрации через `/api/auth/register/` пользователь всегда получает роль `client`.
Администратора создают командой `createsuperuser` или через управление пользователями
в админ-панели.
---
## 🛠 Админ-панель (/admin)
React-админка полностью заменяет стандартный Django Admin. Доступ только для пользователей с ролью `admin` (или `is_staff` / `is_superuser`).
Разделы:
| Маршрут | Что делает |
| --- | --- |
| `/admin` | Сводка и быстрые ссылки |
| `/admin/users` | Пользователи: поиск, сортировка, роли, `is_active`, `is_staff` |
| `/admin/categories` | Категории услуг: CRUD + поиск |
| `/admin/services` | Услуги: CRUD, фильтры, быстрое редактирование в таблице |
| `/admin/workplaces` | Рабочие места: CRUD + фильтры |
| `/admin/masters` | Мастера: CRUD, загрузка фото, inline-услуги/расписание/отсутствия |
| `/admin/schedules` | Смены мастеров: CRUD + фильтр по мастеру |
| `/admin/absences` | Отпуска и больничные: CRUD + фильтр по мастеру |
| `/admin/bookings` | Записи: фильтры, история, услуги, `admin-status`, отмена |
| `/admin/reviews` | Отзывы (только чтение) |
Особенности:
- 401 → обновление access-токена через `/api/auth/token/refresh/`, при неудаче — редирект на `/login`;
- 403 → экран «Доступ запрещён»;
- смена статуса записи администратором идёт **только** на `PATCH /api/bookings/bookings/{id}/admin-status/` (любые переходы, включая `done → new`);
- обычный `/status/` в админке не используется;
- админ видит неактивные услуги, места и мастеров, клиентский сайт — только активные.
---
## 🧩 Демо-данные
Автоматического наполнения (fixtures / `manage.py seed_demo`) в репозитории пока нет,
поэтому для показа сценария данные создаются вручную через
<http://127.0.0.1:8000/admin/> в таком порядке:
1. **Категория** услуги (например, «Маникюр»);
2. **Рабочее место** (кабинет/стол) с нужным типом;
3. **Услуга**: цена, длительность, буфер, категория, требуемый тип рабочего места;
4. **Мастер**: привязать пользователя/имя, отметить услуги, которые он оказывает;
5. **Смена мастера** на нужный день недели (начало и конец рабочего дня).
Без смены мастера список слотов будет пустым — это предусмотрено алгоритмом.
---
## 🧪 Тесты
В проекте пока нет автотестов: файлы `tests.py` во всех приложениях — заготовки Django.
```powershell
cd backend
python manage.py test
```
Что стоит покрыть в первую очередь (критично для защиты):
* регистрация с попыткой передать `role=admin` → создаётся клиент;
* анонимный доступ к каталогу и слотам;
* обычный клиент получает `403` на админских эндпоинтах;
* расчёт слотов: смена мастера, занятые интервалы, буфер, отсутствия;
* двойное бронирование одного интервала → `409 Conflict`;
* две конкурентные заявки на один слот (транзакция + блокировка);
* отмена записи: запрет для чужой/начавшейся записи.
---
## 🏗 Сборка frontend
```powershell
cd frontend
npm run lint      # oxlint
npm run build     # production-сборка в frontend/dist
npm run preview   # локальный предпросмотр собранной версии
```
Сборка frontend не требует изменения backend: приложение общается с API по `VITE_API_URL`.
Для `DEBUG=False` Django не раздаёт `/media/` — в учебном проекте это не требуется.
---
## 🐞 Типичные проблемы
| Ошибка | Причина и решение |
| --- | --- |
| `pg_config executable not found` при `pip install` | `psycopg2` собирается из исходников: установите PostgreSQL или замените на `psycopg2-binary==2.9.13` |
| `Activate.ps1 cannot be loaded because running scripts is disabled` | `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` |
| `SECRET_KEY must not be empty` / `ImproperlyConfigured` | нет файла `backend/.env` — скопируйте `.env.example` и заполните |
| `could not connect to server` / `OperationalError` | PostgreSQL не запущен или неверные `DB_*` в `.env`; проверьте `psql -U beauty_user -d beauty_salon` |
| `ModuleNotFoundError: No module named 'dotenv'` (или `rest_framework`) | зависимости поставлены не в то окружение: активируйте `.venv` и повторите `pip install -r requirements.txt` |
| В браузере `CORS policy` | порт frontend не совпадает с `CORS_ALLOWED_ORIGINS` в `backend/config/settings.py` |
| `401 Unauthorized` через час работы | истёк `access`-токен; клиент обновляет его по `refresh`, а если и `refresh` истёк (7 дней) — нужно войти заново |
| Слоты не показываются | у мастера нет смены на эту дату, услуга не привязана к мастеру или день занят |
| Фото мастеров/услуг не открываются | `/media/` раздаётся только при `DEBUG=True` |
| Порт занят | `python manage.py runserver 8001` + `VITE_API_URL` + добавить origin в CORS |
| `No migrations to apply`, но таблиц нет | вы подключились не к той базе — проверьте `DB_NAME` в `.env` |
---
