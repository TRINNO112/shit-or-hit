@echo off
title TRINNO MASTER COMPREHENSIVE FULL-SYSTEM AUDIT
cd /d "%~dp0"
color 0E
echo ======================================================================
echo ⚡ LAUNCHING TRINNO COMPLETE UNIFIED FULL-SYSTEM AUDIT
echo ======================================================================
echo 📦 Running all 5 verification stages:
echo    [1/5] Master 33-Component Audit ^& Production Build
echo    [2/5] Mathematical Invariants ^& State Models
echo    [3/5] Database Schema ^& Reconciliation Integrity
echo    [4/5] Core Web Vitals Performance Benchmarks
echo    [5/5] Playwright E2E Multi-Device Browser Suite (Air-Gap Protected)
echo ======================================================================
echo.

call npm run audit:full

if %ERRORLEVEL% EQU 0 (
    color 0A
    echo.
    echo ======================================================================
    echo 🏆 ALL 33 COMPONENTS, WEB VITALS, E2E ^& DATA PIPELINES PASSED 100%%!
    echo ======================================================================
) else (
    color 0C
    echo.
    echo ======================================================================
    echo ❌ AUDIT SUITE ENCOUNTERED FAILURES. INSPECT LOGS ABOVE.
    echo ======================================================================
)

echo.
pause
