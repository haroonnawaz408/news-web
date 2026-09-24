@echo off
title PulseNews Pakistan Live Engine
echo ============================================================
echo  PulseNews Pakistan-First News Engine
echo  80%% Pakistan News ^| 20%% World News
echo  Auto-publishes every 10 minutes
echo ============================================================
echo.
cd /d "%~dp0"
:loop
python automation\auto_news_publisher.py --loop-10
echo [!] Publisher crashed, restarting in 30 seconds...
timeout /t 30 /nobreak
goto loop
