#!/bin/bash

# Prevent script from running multiple times
if pgrep -f "node aiSync.js" > /dev/null; then
    echo "aiSync.js is already running!"
    exit 1
fi

# Infinite loop to run aiSync.js every 1 second
while true; do
    node ~/mew/aiSync.js
    sleep 1
done
