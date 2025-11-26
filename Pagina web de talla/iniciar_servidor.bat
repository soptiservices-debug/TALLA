@echo off
REM Archivo batch para iniciar el servidor web local
REM Este archivo ejecutará el servidor PowerShell

echo ========================================
echo Control Trabajos Talla - Servidor Local
echo ========================================
echo.

REM Obtener la carpeta donde está este archivo
cd /d "%~dp0"

REM Ejecutar el servidor PowerShell
powershell -NoProfile -ExecutionPolicy Bypass -File "servidor.ps1"

pause
