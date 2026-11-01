#!/usr/bin/env bash
# Testy migracji i RLS na lokalnym, tymczasowym PostgreSQL (bez Dockera i bez konta Supabase).
# Wymaga zainstalowanego PostgreSQL 15+ (initdb, pg_ctl, psql).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PG_BIN="${PG_BIN:-$(pg_config --bindir 2>/dev/null || ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
PORT="${PG_TEST_PORT:-54329}"
TMP="$(mktemp -d)"
DATA="$TMP/data"

as_pg() {
  # Serwer PostgreSQL nie może działać jako root.
  if [ "$(id -u)" = "0" ]; then su postgres -s /bin/bash -c "$*"; else bash -c "$*"; fi
}

cleanup() {
  as_pg "'$PG_BIN/pg_ctl' -D '$DATA' -m immediate stop" >/dev/null 2>&1 || true
  rm -rf "$TMP"
}
trap cleanup EXIT

[ "$(id -u)" = "0" ] && chown postgres "$TMP"
as_pg "'$PG_BIN/initdb' -D '$DATA' -U postgres -A trust --locale=C.UTF-8 -E UTF8" >/dev/null
as_pg "'$PG_BIN/pg_ctl' -D '$DATA' -o '-p $PORT -k $TMP -c listen_addresses=' -l '$TMP/log' -w start" >/dev/null

PSQL=("$PG_BIN/psql" -h "$TMP" -p "$PORT" -U postgres -d postgres -v ON_ERROR_STOP=1 -q -tA)

echo "→ atrapa Supabase"
"${PSQL[@]}" -f "$ROOT/supabase/tests/stub_supabase.sql"
for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "→ migracja $(basename "$f")"
  "${PSQL[@]}" -f "$f"
done
echo "→ testy RLS"
"${PSQL[@]}" -f "$ROOT/supabase/tests/rls_test.sql" 2>&1 | sed -n 's/^psql:[^ ]* NOTICE:  /  /p; /NIEZALICZONE\|ERROR\|zaliczone/p'
