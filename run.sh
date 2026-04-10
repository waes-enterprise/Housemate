#!/bin/bash
cd /home/z/my-project
while true; do
  DATABASE_URL="file:/home/z/my-project/db/custom.db" NODE_ENV=production node .next/standalone/server.js 2>&1
  sleep 0.5
done
