@echo off
REM ============================================================================
REM Complete API Endpoint Test
REM Tests all endpoints with curl to verify they're working
REM ============================================================================

echo.
echo ============================================================================
echo                    API ENDPOINT VERIFICATION TEST
echo ============================================================================
echo.
echo Testing API server at http://localhost:3001
echo.

echo [1/7] Testing /health endpoint...
curl -s http://localhost:3001/health
echo.
echo.

echo [2/7] Testing /stats endpoint...
curl -s http://localhost:3001/stats
echo.
echo.

echo [3/7] Testing /invoice-trends endpoint...
curl -s http://localhost:3001/invoice-trends
echo.
echo.

echo [4/7] Testing /vendors/top10 endpoint...
curl -s http://localhost:3001/vendors/top10
echo.
echo.

echo [5/7] Testing /category-spend endpoint...
curl -s http://localhost:3001/category-spend
echo.
echo.

echo [6/7] Testing /cash-outflow endpoint...
curl -s http://localhost:3001/cash-outflow
echo.
echo.

echo [7/7] Testing /invoices endpoint...
curl -s http://localhost:3001/invoices
echo.
echo.

echo ============================================================================
echo                         TESTS COMPLETE
echo ============================================================================
echo.
echo All endpoints should return JSON data above.
echo If you see "Route not found" errors, the routes are not mounted correctly.
echo.
pause
