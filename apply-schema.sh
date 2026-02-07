#!/bin/bash
SUPABASE_PROJECT_REF="ilriyvzvwarnqrbnranq"
SUPABASE_ACCESS_TOKEN="$(supabase projects api-keys --project-ref $SUPABASE_PROJECT_REF 2>&1 | grep service_role | awk '{print $3}')"

curl -X POST "https://$SUPABASE_PROJECT_REF.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_ACCESS_TOKEN" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d @supabase-schema.sql
