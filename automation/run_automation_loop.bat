@echo off
title PulseNews - 10-Minute Automation Engine
echo =======================================================
echo      PulseNews Pakistan - Live Automation Engine
echo =======================================================
echo.
echo  Auto-fetching fresh news every 10 minutes...
echo  Press Ctrl+C anytime to stop.
echo.

cd /d "%~dp0\.."
python automation/auto_news_publisher.py --loop-10

pause
