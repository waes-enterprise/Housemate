#!/bin/bash
cd /home/z/my-project
export DATABASE_URL="file:/home/z/my-project/db/custom.db"
export NODE_ENV=production
while true; do
  node .next/standalone/server.js 2>&1
  echo "[$(date)] Server exited, restarting..." >> /tmp/server-restart.log
  sleep 1
done
