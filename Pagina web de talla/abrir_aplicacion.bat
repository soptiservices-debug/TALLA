@echo off
REM Archivo batch para abrir la aplicación Control Trabajos Talla
REM Este archivo abre index.html en el navegador predeterminado

echo.
echo ========================================
echo Control Trabajos Talla - Optiservices
echo ========================================
echo.
echo Abriendo la aplicacion...
echo.

REM Obtener la carpeta donde está este archivo
cd /d "%~dp0"

REM Abrir index.html con el navegador predeterminado
start index.html

echo.
echo Aplicacion abierta en tu navegador predeterminado
echo Si no se abre, abre manualmente: index.html
echo.
pause
