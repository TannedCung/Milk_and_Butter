@echo off
echo ====================================================
echo 🐾 MilkandButter Mock Data Generator
echo ====================================================
echo.

REM Check if we're in the backend directory
if not exist "manage.py" (
    echo ❌ Error: Please run this script from the backend directory
    echo    Current directory: %CD%
    echo    Expected: backend directory containing manage.py
    pause
    exit /b 1
)

echo 📋 Checking Django environment...
python manage.py check --deploy 2>nul
if errorlevel 1 (
    echo ❌ Django environment check failed
    echo    Please ensure Django is properly configured
    pause
    exit /b 1
)

echo ✅ Django environment OK
echo.

REM Prompt for user ID
set /p USER_ID="Enter User ID to assign pets to (default: 1): "
if "%USER_ID%"=="" set USER_ID=1

echo 🚀 Starting mock data generation for User ID: %USER_ID%
echo.

REM Run the management command
python manage.py generate_mock_data --user-id %USER_ID%

if errorlevel 1 (
    echo.
    echo ❌ Mock data generation failed!
    echo    Check the error messages above for details
) else (
    echo.
    echo 🎉 Mock data generation completed successfully!
)

echo.
echo Press any key to exit...
pause >nul 