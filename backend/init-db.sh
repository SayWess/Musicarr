#!/bin/sh

cd /app/database

alembic revision --autogenerate -m "Database Migration"
alembic upgrade head

cd /app
