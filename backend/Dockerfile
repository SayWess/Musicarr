FROM python:3.12-alpine AS builder

WORKDIR /app

RUN apk add --no-cache gcc musl-dev postgresql-dev python3-dev libffi-dev

COPY ./requirements.txt .

RUN pip install --no-cache-dir --upgrade --prefix=/install -r requirements.txt


FROM python:3.12-alpine

WORKDIR /app

RUN apk add --no-cache libpq ffmpeg

COPY --from=builder /install /usr/local

COPY . /app

RUN chmod +x /app/init-db.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["fastapi", "run", "/app/main.py", "--port", "80", "--proxy-headers"]