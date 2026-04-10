#!/bin/bash
# Keep-alive wrapper for Next.js server
cd /home/z/my-project

while true; do
    echo "[$(date)] Starting Next.js server..."
    NODE_ENV=production node .next/standalone/server.js 2>&1 &
    PID=$!
    echo "[$(date)] Server PID: $PID"
    
    # Wait for process to exit
    wait $PID
    EXIT_CODE=$?
    echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 2s..."
    sleep 2
done
