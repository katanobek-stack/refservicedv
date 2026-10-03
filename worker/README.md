# Защищённый Worker RefServiceDV

Этот Worker заменяет старый публичный endpoint чата. В репозитории нет секретов и нет деплоя: ключи задаются только через `wrangler secret put`.

## Настройка

1. Создайте KV namespace для `RATE_LIMIT_KV` и подставьте его ID в `wrangler.toml`.
2. Установите секреты: `ANTHROPIC_API_KEY`, проверенное актуальное `ANTHROPIC_MODEL`, `INQUIRY_WEBHOOK_URL`; при необходимости `INQUIRY_WEBHOOK_TOKEN` и `TURNSTILE_SECRET`.
3. Проверьте актуальное имя модели Anthropic перед публикацией. Worker намеренно не принимает неизвестные модели.
4. Разверните Worker на `api.refservicedv.ru` и задайте в корневом `config.js` адрес `https://api.refservicedv.ru`.
5. Сначала проверьте тестовым webhook и ограниченным бюджетом Anthropic, затем подключайте CRM.

Worker не пишет напрямую в Firestore из браузера. Заявки идут через серверный webhook; он должен валидировать и сохранять их в отдельную коллекцию/CRM на стороне владельца.

## Важное ограничение

KV rate limit защищает от базового злоупотребления, но для серьёзного трафика добавьте Cloudflare Rate Limiting или Durable Object. CORS ограничивает браузерные вызовы, но не является защитой от прямых HTTP-запросов.
