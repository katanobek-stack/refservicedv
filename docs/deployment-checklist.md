# Публикация этапа безопасности

## GitHub Pages

- В Settings → Pages включить `Enforce HTTPS`.
- После публикации проверить `http://refservicedv.ru/`: он должен перенаправлять на HTTPS.
- Настроить security headers на CDN/Cloudflare: `Content-Security-Policy`, `Strict-Transport-Security`, `Referrer-Policy`, `X-Content-Type-Options`, `frame-ancestors`.

## Cloudflare Worker

- Не удалять старый endpoint до теста нового Worker.
- Создать KV namespace и заполнить ID в `worker/wrangler.toml`.
- Задать секреты Worker и месячный лимит Anthropic.
- Проверить имя модели Anthropic перед деплоем.
- Настроить `api.refservicedv.ru` и указать этот адрес в `config.js`.
- Проверить две операции: `POST /assistant` и `POST /inquiries`, включая отказ без разрешённого Origin, лимит запросов и повторный idempotency key.
- Только после проверки отозвать старый Anthropic key и удалить `coolservice-bot`.

## Данные и юридические тексты

- Заполнить `[ЗАПОЛНИТЬ]` в `privacy.html` и `consent.html`.
- Уточнить у владельца фактические гарантии, цены, часы работы, адрес, географию выезда, Telegram и коммерческие цифры из `docs/content-verification.md`.
- Проверить актуальность политики и при необходимости выполнить обязанности оператора ПДн по 152-ФЗ.
