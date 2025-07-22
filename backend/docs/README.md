# TON Empire Backend Documentation

## Документация

Данная папка содержит полную документацию по backend'у игры TON Empire.

### 📚 Содержание документации

#### 🚀 [API Documentation](./API.md)
Полная документация REST API с примерами запросов и ответов:
- Аутентификация через Telegram
- Управление пользователями
- Игровая логика (районы, здания, ресурсы)
- Гильдии и PvP битвы
- Рейтинги и лидерборды
- Коды ошибок и обработка

#### 🔌 [WebSocket API](./WEBSOCKET.md)
Документация по real-time API через WebSocket:
- Подключение и аутентификация
- События от сервера к клиенту
- События от клиента к серверу
- Управление комнатами
- Примеры интеграции
- Обработка ошибок и переподключение

#### 🛠️ [OpenAPI Specification](./api.yaml)
Машиночитаемая спецификация API в формате OpenAPI 3.0:
- Импорт в Postman/Insomnia
- Генерация клиентского кода
- Автоматическая валидация
- Интерактивная документация

#### 🚀 [Deployment Guide](./DEPLOYMENT.md)
Подробное руководство по развертыванию:
- Локальная разработка
- Docker и Docker Compose
- Kubernetes
- Production deployment
- Мониторинг и логирование
- Безопасность
- Резервное копирование
- Масштабирование

## Быстрый старт

### 1. Просмотр API документации
```bash
# В браузере откройте
open docs/API.md

# Или используйте Swagger UI
docker run -p 8081:8080 -e SWAGGER_JSON=/docs/api.yaml -v $(pwd)/docs:/docs swaggerapi/swagger-ui
# Откройте http://localhost:8081
```

### 2. Тестирование API
```bash
# Импортируйте в Postman
# File -> Import -> docs/api.yaml

# Или используйте curl
curl -X POST http://localhost:8080/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData": "user=..."}'
```

### 3. WebSocket тестирование
```bash
# Установите wscat
npm install -g wscat

# Подключитесь к WebSocket
wscat -c "ws://localhost:8080/ws?token=your_jwt_token"

# Отправьте сообщение
> {"type": "join_room", "data": {"room": "user_123"}}
```

## Структура API

### Сервисы
- **API Gateway** (`:8080`) - Главная точка входа
- **Auth Service** (`:8081`) - Аутентификация
- **User Service** (`:8082`) - Пользователи
- **Game Service** (`:8083`) - Игровая логика

### Эндпоинты по категориям

#### 🔐 Authentication
- `POST /api/auth/telegram` - Вход через Telegram
- `POST /api/auth/refresh` - Обновление токена

#### 👤 Users
- `GET /api/users/me` - Мой профиль
- `PUT /api/users/me` - Обновить профиль
- `GET /api/users/{id}` - Профиль пользователя

#### 🏗️ Game - Districts & Buildings
- `GET /api/game/districts/my` - Мой район
- `POST /api/game/districts/my` - Создать район
- `GET /api/game/districts/{id}/buildings` - Здания района
- `POST /api/game/districts/{id}/buildings` - Построить здание
- `POST /api/game/buildings/{id}/upgrade` - Улучшить здание
- `DELETE /api/game/buildings/{id}` - Снести здание

#### 💰 Game - Resources
- `POST /api/game/resources/collect` - Собрать ресурсы

#### 🏛️ Guilds
- `GET /api/game/guilds` - Поиск гильдий
- `POST /api/game/guilds` - Создать гильдию

#### ⚔️ Battle
- `POST /api/game/battles/search` - Найти противников
- `POST /api/game/battles/{id}/attack` - Атаковать

#### 🏆 Leaderboard
- `GET /api/game/leaderboard/players` - Рейтинг игроков
- `GET /api/game/leaderboard/guilds` - Рейтинг гильдий

## WebSocket События

### 📥 От сервера к клиенту
- `resource_update` - Обновление ресурсов
- `building_update` - Обновление здания
- `building_created` - Здание построено
- `battle_started` - Битва началась
- `battle_ended` - Битва завершена
- `notification` - Уведомление
- `guild_invitation` - Приглашение в гильдию

### 📤 От клиента к серверу
- `join_room` - Присоединиться к комнате
- `leave_room` - Покинуть комнату
- `ping` - Проверка соединения

## Модели данных

### User
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
  }
}
```

### District
```json
{
  "id": "uuid",
  "name": "My Empire",
  "population": 150,
  "efficiency": 85,
  "resources": {
    "gold": 2500,
    "wood": 1200,
    "stone": 800,
    "food": 600,
    "energy": 200
  }
}
```

### Building
```json
{
  "id": "uuid",
  "type": "house",
  "level": 3,
  "health": 80,
  "max_health": 100,
  "position": {"x": 2, "y": 2},
  "is_active": true,
  "upgrade_end_at": null
}
```

## Аутентификация

Все API запросы (кроме `/auth/*`) требуют JWT токен:

```bash
Authorization: Bearer <jwt_token>
```

Получение токена:
```bash
POST /api/auth/telegram
{
  "initData": "user=%7B%22id%22%3A123456789..."
}
```

## Rate Limiting

- **Auth endpoints**: 10 запросов/минуту
- **Game endpoints**: 100 запросов/минуту  
- **WebSocket**: без ограничений

## Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Примеры использования

### JavaScript/TypeScript
```javascript
// Аутентификация
const response = await fetch('/api/auth/telegram', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ initData: telegramInitData })
});
const { access_token } = await response.json();

// Использование API
const userResponse = await fetch('/api/users/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
const user = await userResponse.json();

// WebSocket
const ws = new WebSocket(`ws://localhost:8080/ws?token=${access_token}`);
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

### Python
```python
import requests
import websocket
import json

# Аутентификация
auth_response = requests.post('http://localhost:8080/api/auth/telegram', 
    json={'initData': telegram_init_data})
token = auth_response.json()['access_token']

# API запрос
headers = {'Authorization': f'Bearer {token}'}
user_response = requests.get('http://localhost:8080/api/users/me', headers=headers)
user = user_response.json()

# WebSocket
def on_message(ws, message):
    data = json.loads(message)
    print(f"Received: {data}")

ws = websocket.WebSocketApp(f"ws://localhost:8080/ws?token={token}",
                           on_message=on_message)
ws.run_forever()
```

### Go
```go
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "strings"
)

type AuthRequest struct {
    InitData string `json:"initData"`
}

type AuthResponse struct {
    AccessToken string `json:"access_token"`
}

func main() {
    // Аутентификация
    authReq := AuthRequest{InitData: telegramInitData}
    authBody, _ := json.Marshal(authReq)
    
    resp, err := http.Post("http://localhost:8080/api/auth/telegram",
        "application/json", strings.NewReader(string(authBody)))
    
    var authResp AuthResponse
    json.NewDecoder(resp.Body).Decode(&authResp)
    
    // API запрос
    req, _ := http.NewRequest("GET", "http://localhost:8080/api/users/me", nil)
    req.Header.Set("Authorization", "Bearer "+authResp.AccessToken)
    
    client := &http.Client{}
    userResp, _ := client.Do(req)
    // Обработка ответа...
}
```

## Инструменты разработки

### Postman Collection
Импортируйте `docs/api.yaml` в Postman для готовой коллекции запросов.

### Swagger UI
```bash
docker run -p 8081:8080 \
  -e SWAGGER_JSON=/docs/api.yaml \
  -v $(pwd)/docs:/docs \
  swaggerapi/swagger-ui
```

### Insomnia
Импортируйте OpenAPI спецификацию из `docs/api.yaml`.

## Поддержка и контакты

- **Email**: dev@ton-empire.com
- **GitHub**: https://github.com/ton-empire/backend
- **Telegram**: @ton_empire_support
- **Discord**: https://discord.gg/ton-empire

## История изменений

### v1.0.0 (2024-01-15)
- Первоначальный релиз API
- REST endpoints для всех игровых функций
- WebSocket real-time API
- Аутентификация через Telegram
- Полная документация

---

**Последнее обновление**: Январь 2024
**Версия API**: 1.0.0