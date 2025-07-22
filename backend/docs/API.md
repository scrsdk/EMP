# TON Empire API Documentation

## Обзор

TON Empire API предоставляет REST-интерфейс для взаимодействия с игровым backend'ом. API построен на основе микросервисной архитектуры и включает следующие сервисы:

- **API Gateway** (`localhost:8080`) - Основная точка входа
- **Auth Service** (`localhost:8081`) - Аутентификация через Telegram
- **User Service** (`localhost:8082`) - Управление пользователями
- **Game Service** (`localhost:8083`) - Игровая логика

## Базовый URL

```
Development: http://localhost:8080
Production: https://api.ton-empire.com
```

## Аутентификация

API использует JWT токены для аутентификации. Токены получаются через эндпоинт `/api/auth/telegram` с помощью данных из Telegram Mini App.

### Получение токена

```http
POST /api/auth/telegram
Content-Type: application/json

{
  "initData": "user=%7B%22id%22%3A123456789..."
}
```

### Использование токена

```http
Authorization: Bearer <jwt_token>
```

## Rate Limiting

- Аутентификация: 10 запросов в минуту
- Game API: 100 запросов в минуту
- WebSocket: без ограничений

## Endpoints

### Authentication

#### POST /api/auth/telegram
Аутентификация пользователя через Telegram Mini App.

**Request:**
```json
{
  "initData": "string" // Данные из Telegram WebApp
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "telegram_id": "string",
    "username": "string",
    "first_name": "string",
    "last_name": "string",
    "level": 1,
    "experience": 0,
    "power": 0
  },
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "expires_in": 3600
}
```

#### POST /api/auth/refresh
Обновление JWT токена.

**Request:**
```json
{
  "refresh_token": "string"
}
```

### Users

#### GET /api/users/me
Получить профиль текущего пользователя.

**Response:**
```json
{
  "id": "uuid",
  "telegram_id": "string",
  "username": "string",
  "first_name": "string",
  "last_name": "string",
  "level": 5,
  "experience": 1250,
  "power": 2500,
  "battle_stats": {
    "wins": 10,
    "losses": 3,
    "rating": 1450
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z",
  "last_active_at": "2024-01-15T12:00:00Z"
}
```

#### PUT /api/users/me
Обновить профиль пользователя.

**Request:**
```json
{
  "username": "new_username",
  "first_name": "New Name",
  "last_name": "New Lastname"
}
```

#### GET /api/users/{userId}
Получить публичный профиль пользователя.

### Game - Districts

#### GET /api/game/districts/my
Получить информацию о районе текущего пользователя.

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "My Empire",
  "population": 150,
  "efficiency": 85,
  "resources": {
    "gold": 2500,
    "wood": 1200,
    "stone": 800,
    "food": 600,
    "energy": 200
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z"
}
```

#### POST /api/game/districts/my
Создать новый район.

**Request:**
```json
{
  "name": "My Empire"
}
```

### Game - Buildings

#### GET /api/game/districts/{districtId}/buildings
Получить список зданий в районе.

**Response:**
```json
{
  "buildings": [
    {
      "id": "uuid",
      "district_id": "uuid",
      "type": "house",
      "level": 3,
      "health": 80,
      "max_health": 100,
      "position": { "x": 2, "y": 2 },
      "is_active": true,
      "construction_end_at": null,
      "upgrade_end_at": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T12:00:00Z"
    }
  ],
  "total": 15
}
```

#### POST /api/game/districts/{districtId}/buildings
Построить новое здание.

**Request:**
```json
{
  "type": "house",
  "position": { "x": 3, "y": 4 }
}
```

#### POST /api/game/buildings/{buildingId}/upgrade
Улучшить здание.

**Response:**
```json
{
  "id": "uuid",
  "type": "house",
  "level": 4,
  "upgrade_end_at": "2024-01-15T13:00:00Z"
}
```

#### DELETE /api/game/buildings/{buildingId}
Снести здание.

### Game - Resources

#### POST /api/game/resources/collect
Собрать ресурсы.

**Response:**
```json
{
  "collected": {
    "gold": 250,
    "wood": 120,
    "stone": 80,
    "food": 60,
    "energy": 20
  },
  "total": {
    "gold": 2750,
    "wood": 1320,
    "stone": 880,
    "food": 660,
    "energy": 220
  }
}
```

### Guilds

#### GET /api/game/guilds
Поиск гильдий.

**Query Parameters:**
- `search` - поиск по названию
- `limit` - количество результатов (макс. 50)
- `offset` - смещение для пагинации

#### POST /api/game/guilds
Создать гильдию.

**Request:**
```json
{
  "name": "Dragon Empire",
  "tag": "DE",
  "description": "Powerful guild seeking active players"
}
```

### Battle

#### POST /api/game/battles/search
Найти противников для битвы.

**Request:**
```json
{
  "min_level": 1,
  "max_level": 10,
  "min_power": 0,
  "max_power": 5000
}
```

**Response:**
```json
{
  "targets": [
    {
      "user_id": "uuid",
      "username": "EnemyPlayer",
      "level": 5,
      "power": 2000,
      "district_name": "Enemy District",
      "guild": {
        "name": "Enemy Guild",
        "tag": "EG"
      },
      "is_online": false,
      "last_battle": "2024-01-14T10:00:00Z"
    }
  ]
}
```

#### POST /api/game/battles/{targetUserId}/attack
Атаковать игрока.

### Leaderboard

#### GET /api/game/leaderboard/players
Рейтинг игроков.

**Query Parameters:**
- `type` - тип рейтинга: `power`, `level`, `battle_rating`
- `limit` - количество результатов
- `offset` - смещение

#### GET /api/game/leaderboard/guilds
Рейтинг гильдий.

## WebSocket API

WebSocket соединение устанавливается по адресу:
```
ws://localhost:8080/ws?token=<jwt_token>
```

### События от сервера

#### resource_update
Обновление ресурсов игрока.
```json
{
  "type": "resource_update",
  "data": {
    "gold": 2750,
    "wood": 1320,
    "stone": 880,
    "food": 660,
    "energy": 220
  }
}
```

#### building_update
Обновление здания.
```json
{
  "type": "building_update",
  "data": {
    "id": "uuid",
    "level": 4,
    "upgrade_end_at": null,
    "health": 100
  }
}
```

#### building_created
Здание построено.
```json
{
  "type": "building_created",
  "data": {
    "id": "uuid",
    "type": "house",
    "level": 1,
    "position": { "x": 3, "y": 4 }
  }
}
```

#### battle_started
Началась битва.
```json
{
  "type": "battle_started",
  "data": {
    "battle_id": "uuid",
    "attacker": "username",
    "battle_end_at": "2024-01-15T13:10:00Z"
  }
}
```

#### notification
Общее уведомление.
```json
{
  "type": "notification",
  "data": {
    "type": "success",
    "title": "Building Complete",
    "message": "Your house has been built!"
  }
}
```

### События к серверу

#### join_room
Присоединиться к комнате.
```json
{
  "type": "join_room",
  "data": { "room": "user_123456789" }
}
```

## Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Bad Request - Некорректный запрос |
| 401 | Unauthorized - Не авторизован |
| 403 | Forbidden - Доступ запрещен |
| 404 | Not Found - Ресурс не найден |
| 409 | Conflict - Конфликт ресурсов |
| 429 | Too Many Requests - Превышен лимит |
| 500 | Internal Server Error - Внутренняя ошибка |

### Формат ошибки

```json
{
  "error": "error_code",
  "message": "Human readable error message",
  "details": {
    "field": "Additional error details"
  }
}
```

## Примеры использования

### Полный цикл игры

1. **Аутентификация**
```bash
curl -X POST http://localhost:8080/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData": "user=..."}'
```

2. **Создание района**
```bash
curl -X POST http://localhost:8080/api/game/districts/my \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Empire"}'
```

3. **Строительство здания**
```bash
curl -X POST http://localhost:8080/api/game/districts/<district_id>/buildings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"type": "house", "position": {"x": 0, "y": 0}}'
```

4. **Сбор ресурсов**
```bash
curl -X POST http://localhost:8080/api/game/resources/collect \
  -H "Authorization: Bearer <token>"
```

5. **Поиск противников**
```bash
curl -X POST http://localhost:8080/api/game/battles/search \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"min_level": 1, "max_level": 10}'
```

## Мониторинг и метрики

Метрики Prometheus доступны по адресу:
```
http://localhost:8080/metrics
```

### Основные метрики

- `http_requests_total` - Общее количество HTTP запросов
- `http_request_duration_seconds` - Время обработки запросов
- `websocket_connections_active` - Активные WebSocket соединения
- `game_buildings_total` - Общее количество зданий
- `game_battles_active` - Активные битвы

## Развертывание

### Docker

```bash
# Запуск всех сервисов
docker-compose up -d

# Запуск с мониторингом
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### Переменные окружения

```bash
# Database
DATABASE_URL=postgres://user:password@localhost:5432/ton_empire
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=3600

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token

# Services
AUTH_SERVICE_URL=http://auth-service:8081
USER_SERVICE_URL=http://user-service:8082
GAME_SERVICE_URL=http://game-service:8083
```

## Ограничения и лимиты

### Rate Limiting
- Auth endpoints: 10 req/min per IP
- Game endpoints: 100 req/min per user
- WebSocket: без ограничений

### Размеры данных
- Username: 3-32 символа
- Guild name: 3-50 символов
- Guild tag: 2-8 символов (A-Z, 0-9)
- District name: 3-50 символов
- Максимум зданий: 100 на район

### Время жизни
- JWT access token: 1 час
- JWT refresh token: 30 дней
- WebSocket connection: бессрочно
- Battle preparation: 5 минут
- Building construction: зависит от типа

## Поддержка

- **Email**: dev@ton-empire.com
- **GitHub**: https://github.com/ton-empire/backend
- **Telegram**: @ton_empire_support