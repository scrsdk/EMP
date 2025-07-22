# TON Empire Backend Deployment Guide

## Обзор

Данное руководство описывает процесс развертывания backend'а TON Empire в различных окружениях: от локальной разработки до production.

## Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Auth Service  │
│   (Next.js)     │────│   (Port 8080)   │────│   (Port 8081)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                         │
                              │                         │
                       ┌─────────────────┐    ┌─────────────────┐
                       │  User Service   │    │  Game Service   │
                       │   (Port 8082)   │    │   (Port 8083)   │
                       └─────────────────┘    └─────────────────┘
                              │                         │
                              └─────────┬───────────────┘
                                        │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   PostgreSQL    │    │      Redis      │
                       │   (Port 5432)   │    │   (Port 6379)   │
                       └─────────────────┘    └─────────────────┘
```

## Требования

### Минимальные требования
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Linux (Ubuntu 20.04+, CentOS 7+), macOS, Windows

### Рекомендуемые требования (Production)
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 100GB+ SSD
- **Network**: 1Gbps

### Зависимости
- Docker 20.10+
- Docker Compose 2.0+
- Go 1.21+ (для сборки из исходников)
- PostgreSQL 14+
- Redis 6+

## Локальная разработка

### 1. Клонирование репозитория
```bash
git clone https://github.com/ton-empire/backend.git
cd backend
```

### 2. Настройка переменных окружения
```bash
cp .env.example .env
```

Отредактируйте `.env`:
```env
# Database
DATABASE_URL=postgres://ton_empire:password@localhost:5432/ton_empire
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=3600

# Telegram
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Services
AUTH_SERVICE_URL=http://auth-service:8081
USER_SERVICE_URL=http://user-service:8082
GAME_SERVICE_URL=http://game-service:8083

# Monitoring
PROMETHEUS_URL=http://prometheus:9090
```

### 3. Запуск с Docker Compose
```bash
# Основные сервисы
docker-compose up -d

# С мониторингом
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### 4. Инициализация базы данных
```bash
# Выполнение миграций
make migrate-up

# Заполнение тестовыми данными (опционально)
make seed
```

### 5. Проверка работоспособности
```bash
# Проверка статуса сервисов
curl http://localhost:8080/health

# Проверка метрик
curl http://localhost:8080/metrics
```

## Сборка из исходников

### 1. Установка зависимостей
```bash
go mod download
```

### 2. Сборка всех сервисов
```bash
make build
```

### 3. Запуск отдельных сервисов
```bash
# API Gateway
./bin/api-gateway

# Auth Service
./bin/auth-service

# User Service  
./bin/user-service

# Game Service
./bin/game-service
```

## Production развертывание

### 1. Docker Swarm

#### Инициализация кластера
```bash
# На master ноде
docker swarm init

# На worker нодах (получить команду join с master)
docker swarm join --token <token> <master-ip>:2377
```

#### Развертывание стека
```bash
# Создание production конфигурации
cp docker-compose.prod.yml docker-compose.override.yml

# Развертывание
docker stack deploy -c docker-compose.yml ton-empire
```

#### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  api-gateway:
    image: ton-empire/api-gateway:latest
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      placement:
        constraints:
          - node.role == worker
    environment:
      - NODE_ENV=production
    networks:
      - ton-empire-network

  auth-service:
    image: ton-empire/auth-service:latest
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
    environment:
      - NODE_ENV=production

  user-service:
    image: ton-empire/user-service:latest
    deploy:
      replicas: 2

  game-service:
    image: ton-empire/game-service:latest
    deploy:
      replicas: 3

  postgres:
    image: postgres:14
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
    environment:
      POSTGRES_DB: ton_empire
      POSTGRES_USER: ton_empire
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
    driver: local

networks:
  ton-empire-network:
    driver: overlay
    attachable: true
```

### 2. Kubernetes

#### Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ton-empire
```

#### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ton-empire-config
  namespace: ton-empire
data:
  DATABASE_URL: "postgres://ton_empire:password@postgres:5432/ton_empire"
  REDIS_URL: "redis://redis:6379"
  JWT_EXPIRES_IN: "3600"
```

#### Deployment - API Gateway
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: ton-empire
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: ton-empire/api-gateway:latest
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: ton-empire-config
        - secretRef:
            name: ton-empire-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: api-gateway-service
  namespace: ton-empire
spec:
  selector:
    app: api-gateway
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

#### Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ton-empire-ingress
  namespace: ton-empire
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.ton-empire.com
    secretName: ton-empire-tls
  rules:
  - host: api.ton-empire.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway-service
            port:
              number: 80
```

### 3. Автоматизация CI/CD

#### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Go
      uses: actions/setup-go@v3
      with:
        go-version: 1.21
        
    - name: Run tests
      run: make test
      
    - name: Build Docker images
      run: |
        docker build -f docker/api-gateway.Dockerfile -t ton-empire/api-gateway:${{ github.sha }} .
        docker build -f docker/auth-service.Dockerfile -t ton-empire/auth-service:${{ github.sha }} .
        docker build -f docker/user-service.Dockerfile -t ton-empire/user-service:${{ github.sha }} .
        docker build -f docker/game-service.Dockerfile -t ton-empire/game-service:${{ github.sha }} .
        
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push ton-empire/api-gateway:${{ github.sha }}
        docker push ton-empire/auth-service:${{ github.sha }}
        docker push ton-empire/user-service:${{ github.sha }}
        docker push ton-empire/game-service:${{ github.sha }}
        
    - name: Deploy to production
      run: |
        # Update Kubernetes deployments
        kubectl set image deployment/api-gateway api-gateway=ton-empire/api-gateway:${{ github.sha }} -n ton-empire
        kubectl set image deployment/auth-service auth-service=ton-empire/auth-service:${{ github.sha }} -n ton-empire
        kubectl set image deployment/user-service user-service=ton-empire/user-service:${{ github.sha }} -n ton-empire
        kubectl set image deployment/game-service game-service=ton-empire/game-service:${{ github.sha }} -n ton-empire
```

## Мониторинг и логирование

### 1. Prometheus + Grafana

#### Prometheus конфигурация
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ton-empire-api'
    static_configs:
      - targets: ['api-gateway:8080']
    metrics_path: /metrics
    
  - job_name: 'ton-empire-services'
    static_configs:
      - targets: 
        - 'auth-service:8081'
        - 'user-service:8082'
        - 'game-service:8083'
    metrics_path: /metrics
```

#### Grafana дашборды
- **API Performance**: Время ответа, RPS, коды ошибок
- **System Resources**: CPU, Memory, Disk, Network
- **Game Metrics**: Активные пользователи, здания, битвы
- **Database**: Connections, query performance

### 2. ELK Stack (Elasticsearch, Logstash, Kibana)

#### Logstash конфигурация
```ruby
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "ton-empire" {
    json {
      source => "message"
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
    
    mutate {
      add_field => { "service_name" => "%{[fields][service_name]}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "ton-empire-%{+YYYY.MM.dd}"
  }
}
```

### 3. Алерты

#### Prometheus Rules
```yaml
groups:
- name: ton-empire-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }} errors per second"
      
  - alert: DatabaseConnectionsHigh
    expr: pg_stat_activity_count > 80
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High database connections"
      
  - alert: ServiceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Service is down"
      description: "{{ $labels.instance }} has been down for more than 1 minute"
```

## Безопасность

### 1. Сетевая безопасность
```bash
# Настройка firewall (Ubuntu)
ufw enable
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw deny 5432/tcp    # PostgreSQL (только внутренний доступ)
ufw deny 6379/tcp    # Redis (только внутренний доступ)
```

### 2. SSL/TLS сертификаты
```bash
# Установка certbot
sudo apt install certbot

# Получение сертификата
sudo certbot certonly --standalone -d api.ton-empire.com

# Автообновление
sudo crontab -e
# Добавить: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Secrets Management

#### Kubernetes Secrets
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ton-empire-secrets
  namespace: ton-empire
type: Opaque
data:
  JWT_SECRET: <base64-encoded-secret>
  POSTGRES_PASSWORD: <base64-encoded-password>
  TELEGRAM_BOT_TOKEN: <base64-encoded-token>
```

#### Docker Secrets
```bash
# Создание секрета
echo "your-jwt-secret" | docker secret create jwt_secret -

# Использование в compose
services:
  api-gateway:
    secrets:
      - jwt_secret
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret

secrets:
  jwt_secret:
    external: true
```

## Резервное копирование

### 1. База данных
```bash
#!/bin/bash
# backup-db.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="ton_empire_backup_${DATE}.sql"

# Создание резервной копии
docker exec postgres-container pg_dump -U ton_empire ton_empire > "${BACKUP_DIR}/${FILENAME}"

# Сжатие
gzip "${BACKUP_DIR}/${FILENAME}"

# Удаление старых копий (оставляем последние 7 дней)
find ${BACKUP_DIR} -name "*.gz" -mtime +7 -delete

# Загрузка в облако (опционально)
aws s3 cp "${BACKUP_DIR}/${FILENAME}.gz" s3://ton-empire-backups/
```

### 2. Redis
```bash
#!/bin/bash
# backup-redis.sh

BACKUP_DIR="/backups/redis"
DATE=$(date +%Y%m%d_%H%M%S)

# Сохранение данных Redis
docker exec redis-container redis-cli BGSAVE

# Копирование файла
docker cp redis-container:/data/dump.rdb "${BACKUP_DIR}/redis_backup_${DATE}.rdb"

# Сжатие
gzip "${BACKUP_DIR}/redis_backup_${DATE}.rdb"
```

### 3. Автоматизация
```bash
# Добавление в crontab
sudo crontab -e

# Резервное копирование БД каждые 6 часов
0 */6 * * * /opt/scripts/backup-db.sh

# Резервное копирование Redis ежедневно
0 2 * * * /opt/scripts/backup-redis.sh
```

## Восстановление

### 1. Восстановление базы данных
```bash
# Остановка сервисов
docker-compose stop

# Восстановление из резервной копии
gunzip ton_empire_backup_20240115_120000.sql.gz
docker exec -i postgres-container psql -U ton_empire -d ton_empire < ton_empire_backup_20240115_120000.sql

# Запуск сервисов
docker-compose start
```

### 2. Disaster Recovery
```bash
# Полное восстановление системы
git clone https://github.com/ton-empire/backend.git
cd backend

# Восстановление конфигурации
cp /backups/config/.env .env

# Восстановление данных
docker-compose up -d postgres redis
sleep 30

# Восстановление БД
docker exec -i postgres-container psql -U ton_empire -d ton_empire < /backups/latest.sql

# Запуск всех сервисов
docker-compose up -d
```

## Масштабирование

### 1. Горизонтальное масштабирование
```bash
# Увеличение количества реплик
docker service scale ton-empire_api-gateway=5
docker service scale ton-empire_game-service=4

# В Kubernetes
kubectl scale deployment api-gateway --replicas=5 -n ton-empire
```

### 2. Вертикальное масштабирование
```yaml
# Увеличение ресурсов в Docker Compose
services:
  api-gateway:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

### 3. База данных
```bash
# Read-only реплики PostgreSQL
docker run -d --name postgres-replica \
  -e PGUSER=replica \
  -e POSTGRES_PASSWORD=replica_password \
  postgres:14 \
  postgres -c 'hot_standby=on' -c 'wal_level=replica'
```

## Troubleshooting

### Проверка логов
```bash
# Docker Compose
docker-compose logs -f api-gateway

# Docker Swarm
docker service logs -f ton-empire_api-gateway

# Kubernetes
kubectl logs -f deployment/api-gateway -n ton-empire
```

### Проверка подключений
```bash
# Проверка портов
netstat -tlnp | grep :8080

# Проверка DNS
nslookup api.ton-empire.com

# Проверка SSL
openssl s_client -connect api.ton-empire.com:443
```

### Производительность
```bash
# Мониторинг ресурсов
htop
iotop
nethogs

# Docker статистика
docker stats

# Kubernetes ресурсы
kubectl top pods -n ton-empire
kubectl top nodes
```

## Заключение

Данное руководство покрывает основные аспекты развертывания TON Empire backend'а. Для production окружения рекомендуется:

1. Использовать Kubernetes для оркестрации
2. Настроить мониторинг и алерты
3. Реализовать автоматизированное резервное копирование
4. Настроить CI/CD pipeline
5. Провести нагрузочное тестирование
6. Обеспечить высокую доступность (99.9%+)

Для получения поддержки обращайтесь к команде разработки: dev@ton-empire.com