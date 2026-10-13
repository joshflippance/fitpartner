#!/usr/bin/env bash
# Applies every migration to a fresh database on plain Postgres and runs supabase/tests/*.test.sql.
# Uses standard PG* env vars (PGHOST, PGPORT, PGUSER, PGPASSWORD). Needs a superuser.
set -euo pipefail
cd "$(dirname "$0")/.."
DB="${TEST_DB:-fitpartner_test}"
PSQL=(psql -v ON_ERROR_STOP=1 -q -X)

"${PSQL[@]}" -d postgres -c "drop database if exists $DB" -c "create database $DB" >/dev/null 2>&1
"${PSQL[@]}" -d "$DB" -f supabase/tests/00_supabase_stub.sql >/dev/null 2>&1
for f in supabase/migrations/*.sql; do
  "${PSQL[@]}" -d "$DB" -f "$f" >/dev/null 2>&1 || { echo "Migration failed: $f"; "${PSQL[@]}" -d "$DB" -f "$f"; exit 1; }
done
echo "Migrations applied: $(ls supabase/migrations/*.sql | wc -l)"

for t in supabase/tests/*.test.sql; do
  out=$("${PSQL[@]}" -d "$DB" -f "$t" 2>&1) || { echo "$out" | grep -E "ERROR|ASSERT" ; echo "FAILED: $t"; exit 1; }
  passed=$(echo "$out" | grep -c "NOTICE:  ok:" || true)
  echo "PASS $t ($passed checks)"
done
