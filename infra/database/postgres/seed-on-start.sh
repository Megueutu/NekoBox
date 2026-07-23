#!/bin/sh
set -eu

postgres_pid=''

stop_postgres() {
    if [ -n "$postgres_pid" ] && kill -0 "$postgres_pid" 2>/dev/null; then
        kill -TERM "$postgres_pid"
        wait "$postgres_pid"
    fi
}

trap stop_postgres INT TERM

/usr/local/bin/docker-entrypoint.sh "$@" &
postgres_pid=$!

until pg_isready --host=127.0.0.1 --username="$POSTGRES_USER" --dbname="$POSTGRES_DB" >/dev/null 2>&1; do
    if ! kill -0 "$postgres_pid" 2>/dev/null; then
        wait "$postgres_pid"
        exit $?
    fi
    sleep 1
done

echo "Aplicando schema e seed do NekoBox..."
psql \
    --set=ON_ERROR_STOP=1 \
    --username="$POSTGRES_USER" \
    --dbname="$POSTGRES_DB" \
    --file=/opt/nekobox/script_bd.sql
echo "Schema e seed aplicados."

wait "$postgres_pid"
