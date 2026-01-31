@echo off
title Push Henderson Cisco Config Generator to GitHub
cd /d "%~dp0"

echo.
echo Henderson's Cisco Configuration Generator - Push to GitHub
echo ===========================================================
echo.

REM If you haven't created the repo yet:
REM 1. Go to https://github.com/new
REM 2. Repository name: henderson-cisco-config-generator
REM 3. Description: Henderson's Cisco Configuration Generator - web app for copy-paste-ready IOS config
REM 4. Choose Public, then Create repository (do NOT add README/gitignore - we already have them)
REM 5. Replace YOUR_USERNAME below with your GitHub username, then run this script again.
echo.

set "GITHUB_USER=YOUR_USERNAME"
if "%GITHUB_USER%"=="YOUR_USERNAME" (
  echo Edit this file and set GITHUB_USER to your GitHub username.
  echo Then create the repo at https://github.com/new named: henderson-cisco-config-generator
  echo Then run this script again.
  goto :eof
)

git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/henderson-cisco-config-generator.git
echo Pushing to origin main...
git push -u origin main

if errorlevel 1 (
  echo.
  echo If the repo does not exist yet, create it at:
  echo   https://github.com/new
  echo   Name: henderson-cisco-config-generator
  echo   Then run this script again.
)
echo.
pause
