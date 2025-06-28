#!/bin/sh
set -e

/app/init-db.sh

exec "$@"
