# TON Empire WebSocket API

## Обзор

WebSocket API обеспечивает real-time взаимодействие между клиентом и сервером в игре TON Empire. Через WebSocket передаются обновления ресурсов, статуса зданий, уведомления о битвах и другие игровые события.

## Подключение

### Endpoint
```
ws://localhost:8080/ws
```

### Аутентификация
WebSocket требует JWT токен для подключения:
```
ws://localhost:8080/ws?token=<jwt_token>
```

### Пример подключения (JavaScript)
```javascript
const token = 'your_jwt_token';
const ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

ws.onopen = function(event) {
    console.log('WebSocket connected');
    
    // Присоединиться к пользовательской комнате
    ws.send(JSON.stringify({
        type: 'join_room',
        data: { room: 'user_' + userId }
    }));
};

ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    handleMessage(message);
};

ws.onclose = function(event) {
    console.log('WebSocket disconnected');
};

ws.onerror = function(error) {
    console.error('WebSocket error:', error);
};
```

## Формат сообщений

Все сообщения имеют единый формат:
```json
{
  "type": "message_type",
  "data": {
    // message payload
  }
}
```

## События от сервера к клиенту

### resource_update
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

**Когда отправляется:**
- После сбора ресурсов
- По таймеру производства
- После постройки/улучшения зданий
- После торговых операций

### building_update
Обновление состояния здания.

```json
{
  "type": "building_update",
  "data": {
    "id": "building-uuid",
    "level": 4,
    "health": 85,
    "is_active": true,
    "upgrade_end_at": "2024-01-15T13:30:00Z"
  }
}
```

**Когда отправляется:**
- Завершение строительства
- Завершение улучшения
- Изменение здоровья здания
- Активация/деактивация здания

### building_created
Новое здание построено.

```json
{
  "type": "building_created",
  "data": {
    "id": "building-uuid",
    "type": "house",
    "level": 1,
    "position": { "x": 3, "y": 4 },
    "district_id": "district-uuid"
  }
}
```

### building_upgrade_complete
Улучшение здания завершено.

```json
{
  "type": "building_upgrade_complete",
  "data": {
    "id": "building-uuid",
    "type": "house",
    "level": 5,
    "new_stats": {
      "max_health": 150,
      "production_rate": 25
    }
  }
}
```

### battle_started
Началась битва.

```json
{
  "type": "battle_started",
  "data": {
    "battle_id": "battle-uuid",
    "attacker": {
      "id": "user-uuid",
      "username": "attacker_name",
      "level": 8,
      "power": 3200
    },
    "defender": {
      "id": "user-uuid", 
      "username": "defender_name",
      "level": 7,
      "power": 2800
    },
    "preparation_end_at": "2024-01-15T13:05:00Z",
    "battle_end_at": "2024-01-15T13:15:00Z"
  }
}
```

### battle_ended
Битва завершена.

```json
{
  "type": "battle_ended",
  "data": {
    "battle_id": "battle-uuid",
    "winner": {
      "id": "user-uuid",
      "username": "winner_name"
    },
    "loser": {
      "id": "user-uuid", 
      "username": "loser_name"
    },
    "rewards": {
      "winner_resources": {
        "gold": 500,
        "experience": 100
      },
      "loser_resources": {
        "experience": 25
      }
    },
    "damage_report": {
      "buildings_destroyed": 2,
      "buildings_damaged": 5
    }
  }
}
```

### guild_invitation
Приглашение в гильдию.

```json
{
  "type": "guild_invitation",
  "data": {
    "guild_id": "guild-uuid",
    "guild_name": "Dragon Empire",
    "guild_tag": "DE",
    "inviter": {
      "id": "user-uuid",
      "username": "guild_leader"
    },
    "expires_at": "2024-01-16T13:00:00Z"
  }
}
```

### guild_member_joined
Новый участник присоединился к гильдии.

```json
{
  "type": "guild_member_joined",
  "data": {
    "guild_id": "guild-uuid",
    "member": {
      "id": "user-uuid",
      "username": "new_member",
      "level": 5,
      "power": 1200
    }
  }
}
```

### notification
Общее уведомление.

```json
{
  "type": "notification",
  "data": {
    "type": "success", // success, error, warning, info
    "title": "Building Complete",
    "message": "Your house has been upgraded to level 3!",
    "duration": 5000, // milliseconds
    "icon": "🏠"
  }
}
```

### district_attack_warning
Предупреждение о готовящейся атаке.

```json
{
  "type": "district_attack_warning",
  "data": {
    "attacker": {
      "username": "enemy_player",
      "level": 10,
      "power": 4500
    },
    "attack_time": "2024-01-15T13:05:00Z",
    "preparation_time_left": 180 // seconds
  }
}
```

### market_trade_completed
Торговая сделка завершена.

```json
{
  "type": "market_trade_completed",
  "data": {
    "trade_id": "trade-uuid",
    "partner": {
      "username": "trader_name"
    },
    "given": {
      "gold": 1000
    },
    "received": {
      "wood": 800
    }
  }
}
```

### user_level_up
Пользователь получил новый уровень.

```json
{
  "type": "user_level_up",
  "data": {
    "new_level": 6,
    "experience": 1500,
    "rewards": {
      "gold": 200,
      "unlock_buildings": ["power_plant"]
    }
  }
}
```

## События от клиента к серверу

### join_room
Присоединиться к комнате для получения обновлений.

```json
{
  "type": "join_room",
  "data": {
    "room": "user_123456789"
  }
}
```

**Доступные комнаты:**
- `user_{user_id}` - персональные обновления
- `district_{district_id}` - обновления района
- `guild_{guild_id}` - обновления гильдии
- `battle_{battle_id}` - обновления битвы

### leave_room
Покинуть комнату.

```json
{
  "type": "leave_room",
  "data": {
    "room": "guild_456"
  }
}
```

### ping
Проверка соединения.

```json
{
  "type": "ping",
  "data": {}
}
```

**Ответ:**
```json
{
  "type": "pong",
  "data": {
    "timestamp": "2024-01-15T13:00:00Z"
  }
}
```

### battle_action
Действие в битве (для будущих обновлений).

```json
{
  "type": "battle_action",
  "data": {
    "battle_id": "battle-uuid",
    "action": "deploy_troops",
    "target": { "x": 5, "y": 3 },
    "units": {
      "infantry": 10,
      "archers": 5
    }
  }
}
```

## Управление соединениями

### Reconnection
Клиент должен реализовать автоматическое переподключение:

```javascript
class WebSocketManager {
    constructor(url, token) {
        this.url = url;
        this.token = token;
        this.reconnectInterval = 3000;
        this.maxReconnectAttempts = 10;
        this.reconnectAttempts = 0;
    }

    connect() {
        this.ws = new WebSocket(`${this.url}?token=${this.token}`);
        
        this.ws.onopen = () => {
            console.log('Connected');
            this.reconnectAttempts = 0;
            this.onConnected();
        };

        this.ws.onclose = () => {
            console.log('Disconnected');
            this.reconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };
    }

    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`Reconnecting... (${this.reconnectAttempts})`);
                this.connect();
            }, this.reconnectInterval);
        }
    }

    send(message) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }
}
```

### Heartbeat
Для поддержания соединения рекомендуется отправлять ping каждые 30 секунд:

```javascript
setInterval(() => {
    ws.send(JSON.stringify({ type: 'ping', data: {} }));
}, 30000);
```

## Обработка ошибок

### Ошибки аутентификации
```json
{
  "type": "error",
  "data": {
    "code": "authentication_failed",
    "message": "Invalid or expired token",
    "action": "reconnect_with_new_token"
  }
}
```

### Ошибки подписки на комнату
```json
{
  "type": "error",
  "data": {
    "code": "room_access_denied",
    "message": "Access to room 'guild_123' denied",
    "room": "guild_123"
  }
}
```

### Общие ошибки
```json
{
  "type": "error",
  "data": {
    "code": "invalid_message_format",
    "message": "Message type 'invalid_type' not recognized"
  }
}
```

## Производительность и ограничения

### Лимиты
- Максимум 100 активных комнат на соединение
- Максимум 50 сообщений в секунду от клиента
- Максимальный размер сообщения: 64KB
- Таймаут неактивного соединения: 5 минут

### Оптимизация
- Используйте объединение сообщений для массовых обновлений
- Отписывайтесь от неактуальных комнат
- Реализуйте throttling для часто обновляемых данных

### Мониторинг
WebSocket метрики доступны в Prometheus:
- `websocket_connections_total` - общее количество соединений
- `websocket_messages_sent_total` - отправленные сообщения
- `websocket_messages_received_total` - полученные сообщения
- `websocket_rooms_active` - активные комнаты

## Пример полной интеграции

```javascript
class GameWebSocket {
    constructor(apiUrl, token) {
        this.wsManager = new WebSocketManager(apiUrl.replace('http', 'ws') + '/ws', token);
        this.gameState = {
            resources: {},
            buildings: [],
            notifications: []
        };
    }

    connect() {
        this.wsManager.onConnected = () => {
            // Подписаться на обновления пользователя
            this.wsManager.send({
                type: 'join_room',
                data: { room: `user_${this.userId}` }
            });
        };

        this.wsManager.handleMessage = (message) => {
            this.handleGameMessage(message);
        };

        this.wsManager.connect();
    }

    handleGameMessage(message) {
        switch (message.type) {
            case 'resource_update':
                this.updateResources(message.data);
                break;
            case 'building_update':
                this.updateBuilding(message.data);
                break;
            case 'notification':
                this.showNotification(message.data);
                break;
            case 'battle_started':
                this.handleBattleStart(message.data);
                break;
            // ... другие обработчики
        }
    }

    updateResources(resources) {
        this.gameState.resources = { ...this.gameState.resources, ...resources };
        this.onResourcesUpdated(this.gameState.resources);
    }

    updateBuilding(building) {
        const index = this.gameState.buildings.findIndex(b => b.id === building.id);
        if (index !== -1) {
            this.gameState.buildings[index] = { ...this.gameState.buildings[index], ...building };
        }
        this.onBuildingUpdated(building);
    }

    // Callback methods to be implemented by the game client
    onResourcesUpdated(resources) {}
    onBuildingUpdated(building) {}
    onNotificationReceived(notification) {}
}

// Использование
const gameWS = new GameWebSocket('http://localhost:8080', jwtToken);
gameWS.onResourcesUpdated = (resources) => {
    console.log('Resources updated:', resources);
    updateUIResources(resources);
};

gameWS.onBuildingUpdated = (building) => {
    console.log('Building updated:', building);
    updateUIBuilding(building);
};

gameWS.connect();
```

## Тестирование

### Инструменты
- **wscat**: Консольный клиент для тестирования
- **Postman**: Поддержка WebSocket тестирования
- **Custom test scripts**: Автоматизированное тестирование

### Пример тестирования с wscat
```bash
# Установка wscat
npm install -g wscat

# Подключение
wscat -c "ws://localhost:8080/ws?token=your_jwt_token"

# Отправка сообщения
> {"type": "join_room", "data": {"room": "user_123"}}

# Ожидание ответов от сервера
< {"type": "resource_update", "data": {"gold": 1000}}
```