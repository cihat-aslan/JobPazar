@echo off
echo ========================================
echo   Mail Servisi Baslatiliyor...
echo ========================================
cd /d "%~dp0"

REM Sanal ortam kontrol
if not exist "venv" (
    echo Sanal ortam olusturuluyor...
    python -m venv venv
)

echo Sanal ortam aktif ediliyor...
call venv\Scripts\activate.bat

echo Bagimliliklar yukleniyor...
pip install -r requirements.txt

echo.
echo ========================================
echo   Mail Servisi Calistiriliyor...
echo   http://127.0.0.1:8000
echo ========================================
uvicorn main:app --reload --port 8000

pause
