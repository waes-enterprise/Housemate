#!/bin/bash
cd /home/z/my-project
export NODE_ENV=production
export DATABASE_URL="file:/home/z/my-project/db/custom.db"
exec node .next/standalone/server.js
