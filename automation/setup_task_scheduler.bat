@echo off
:: ============================================================
:: PulseNews - Windows Task Scheduler Setup
:: Runs news automation every 10 minutes, silently, on login.
:: Run this ONCE as Administrator.
:: ============================================================
title PulseNews Task Scheduler Setup

echo.
echo  ============================================================
echo    PulseNews -- Windows Task Scheduler Setup
echo  ============================================================
echo.
echo  This will create a background task that:
echo    - Fetches fresh news every 10 minutes automatically
echo    - Starts silently when Windows boots (no console window)
echo    - Runs even if you close the terminal
echo.

set "PROJECT_DIR=%~dp0.."
pushd "%PROJECT_DIR%"
set "PROJECT_DIR=%CD%"
popd

set "PYTHON_PATH=python"
set "SCRIPT_PATH=%PROJECT_DIR%\automation\auto_news_publisher.py"
set "TASK_NAME=PulseNews_AutoPublisher"

echo  Project root: %PROJECT_DIR%
echo  Script path:  %SCRIPT_PATH%
echo.

schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

schtasks /create /tn "%TASK_NAME%" /tr "\"%PYTHON_PATH%\" \"%SCRIPT_PATH%\" --once" /sc MINUTE /mo 10 /st 00:00 /ru "%USERNAME%" /f /rl HIGHEST

if %ERRORLEVEL% == 0 (
    echo.
    echo  [SUCCESS] Task "%TASK_NAME%" created!
    echo  Fresh news will be fetched every 10 minutes automatically.
    echo.
    echo  To stop:   schtasks /delete /tn "%TASK_NAME%" /f
    echo  To run now: schtasks /run /tn "%TASK_NAME%"
    echo.
) else (
    echo.
    echo  [ERROR] Right-click this file and "Run as Administrator"
    echo.
)

pause
