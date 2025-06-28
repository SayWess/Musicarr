#!/bin/sh

cd /app/database

# alembic revision --autogenerate -m "Migration"
alembic upgrade head

cd /app
