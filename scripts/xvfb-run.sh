#!/bin/bash

# Kill any existing Xvfb processes
pkill Xvfb || true

# Remove any stale X lock files
rm -f /tmp/.X99-lock /tmp/.X11-unix/X99 || true

# Start Xvfb with better parameters
Xvfb :99 -screen 0 1024x768x24 -ac +extension GLX +render -noreset > /dev/null 2>&1 &

# Wait for Xvfb to initialize
sleep 2

# Test that Xvfb is working by using xdpyinfo
DISPLAY=:99 xdpyinfo > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "Xvfb started successfully on display :99"
else
  echo "Failed to start Xvfb properly"
  exit 1
fi

echo "DISPLAY=:99" > /tmp/xvfb-environment