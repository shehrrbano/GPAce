@echo off
echo ============================================
echo   GPAce Pandoc Converter - Starting Server
echo ============================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Check if flask is installed, if not install requirements
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install -r requirements.txt
    echo.
)

REM Check if Pandoc is available
pandoc --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo WARNING: Pandoc is not installed!
    echo Please install Pandoc from https://pandoc.org/installing.html
    echo.
)

echo Starting server on http://localhost:5000
echo Press Ctrl+C to stop
echo.

python pandoc_converter.py

pause
