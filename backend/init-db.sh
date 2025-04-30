#!/bin/sh

cd /app/database

alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

cd /app
