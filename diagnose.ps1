# Medical Pharmacy Chatbot - System Diagnostic Script (Windows)
# Run this to check if everything is properly set up

$ErrorActionPreference = "Continue"

Clear-Host

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗"
Write-Host "║ Windows System Diagnostic Check           ║"
Write-Host "║ Medical Pharmacy Chatbot Setup            ║"
Write-Host "╚════════════════════════════════════════════╝"
Write-Host ""

$PASSED = 0
$FAILED = 0
$WARNINGS = 0

# Helper functions
function Check-Pass {
    param([string]$msg)
    Write-Host "✅ PASS: $msg" -ForegroundColor Green
    $script:PASSED++
}

function Check-Fail {
    param([string]$msg)
    Write-Host "❌ FAIL: $msg" -ForegroundColor Red
    $script:FAILED++
}

function Check-Warn {
    param([string]$msg)
    Write-Host "⚠️  WARN: $msg" -ForegroundColor Yellow
    $script:WARNINGS++
}

function Check-Info {
    param([string]$msg)
    Write-Host "ℹ️  INFO: $msg" -ForegroundColor Cyan
}

# ===== SECTION 1: Node.js & npm =====
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "1. Node.js & npm Setup" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Check-Pass "Node.js installed: $nodeVersion"
} else {
    Check-Fail "Node.js not installed"
}

if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Check-Pass "npm installed: $npmVersion"
} else {
    Check-Fail "npm not installed"
}

Write-Host ""

# ===== SECTION 2: Directory Structure =====
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "2. Directory Structure" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

if (Test-Path "BackEnd") {
    Check-Pass "BackEnd directory exists"
} else {
    Check-Fail "BackEnd directory not found"
}

if (Test-Path "FrontEnd") {
    Check-Pass "FrontEnd directory exists"
} else {
    Check-Fail "FrontEnd directory not found"
}

if (Test-Path "BackEnd\.env") {
    Check-Pass ".env file exists in BackEnd"
} else {
    Check-Fail ".env file not found in BackEnd (required)"
}

if (Test-Path "BackEnd\src\server.js") {
    Check-Pass "server.js exists"
} else {
    Check-Fail "server.js not found"
}

if (Test-Path "BackEnd\src\app.js") {
    Check-Pass "app.js exists"
} else {
    Check-Fail "app.js not found"
}

Write-Host ""

# ===== SECTION 3: Dependencies =====
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "3. Backend Dependencies" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

if (Test-Path "BackEnd\node_modules") {
    Check-Pass "BackEnd dependencies installed"
} else {
    Check-Warn "BackEnd node_modules not found (run: cd BackEnd && npm install)"
}

if (Test-Path "FrontEnd\node_modules") {
    Check-Pass "FrontEnd dependencies installed"
} else {
    Check-Warn "FrontEnd node_modules not found (run: cd FrontEnd && npm install)"
}

Write-Host ""

# ===== SECTION 4: Port Availability =====
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "4. Port Availability" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if (-not $port5000) {
    Check-Pass "Port 5000 is available"
} else {
    Check-Warn "Port 5000 is already in use"
}

$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if (-not $port5173) {
    Check-Pass "Port 5173 is available"
} else {
    Check-Warn "Port 5173 is already in use"
}

Write-Host ""

# ===== SECTION 5: PostgreSQL =====
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "5. PostgreSQL Configuration" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

if (Get-Command psql -ErrorAction SilentlyContinue) {
    Check-Pass "PostgreSQL client (psql) installed"
    
    # Try to connect
    try {
        $connection = psql -h localhost -U postgres -d postgres -c "\q" 2>&1
        Check-Pass "Can connect to PostgreSQL"
        
        # Check if pharmacy_ai database exists
        $dbTest = psql -h localhost -U postgres -lqt 2>&1 | Select-String "pharmacy_ai"
        if ($dbTest) {
            Check-Pass "Database 'pharmacy_ai' exists"
            
            # Check if medicines table exists
            $tableTest = psql -h localhost -U postgres -d pharmacy_ai -c "\dt medicines" 2>&1
            if ($tableTest -and $tableTest -notmatch "no relations") {
                Check-Pass "medicines table exists"
                
                # Count medicines
                try {
                    $medicineCount = psql -h localhost -U postgres -d pharmacy_ai -t -c "SELECT COUNT(*) FROM medicines;" 2>&1 | Select-String "^\s+\d"
                    if ($medicineCount) {
                        Check-Pass "medicines table has records"
                    } else {
                        Check-Warn "medicines table is empty (run: node seed-medicines.js)"
                    }
                } catch {
                    Check-Info "Could not count medicines"
                }
            } else {
                Check-Warn "medicines table not found (run: node seed-medicines.js)"
            }
        } else {
            Check-Warn "Database 'pharmacy_ai' not found (create with: psql -U postgres -c `"CREATE DATABASE pharmacy_ai;`")"
        }
    } catch {
        Check-Fail "Cannot connect to PostgreSQL on localhost"
        Check-Info "Ensure PostgreSQL is running and credentials are correct in .env"
    }
} else {
    Check-Fail "PostgreSQL client (psql) not installed"
    Check-Info "Install PostgreSQL to use this system"
}

Write-Host ""

# ===== SECTION 6: Environment Variables =====
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "6. Environment Configuration" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

if (Test-Path "BackEnd\.env") {
    $envContent = Get-Content "BackEnd\.env" -Raw
    
    if ($envContent -match "DB_HOST") {
        Check-Pass "DB_HOST configured"
    } else {
        Check-Warn "DB_HOST not found in .env"
    }
    
    if ($envContent -match "DB_USER") {
        Check-Pass "DB_USER configured"
    } else {
        Check-Warn "DB_USER not found in .env"
    }
    
    if ($envContent -match "DB_NAME") {
        Check-Pass "DB_NAME configured"
    } else {
        Check-Warn "DB_NAME not found in .env"
    }
    
    if ($envContent -match "NODE_ENV") {
        Check-Pass "NODE_ENV configured"
    } else {
        Check-Info "NODE_ENV not set (using default)"
    }
} else {
    Check-Fail ".env file not found"
}

Write-Host ""

# ===== SECTION 7: API Endpoints =====
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "7. API Endpoint Check" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

if (Get-Command curl -ErrorAction SilentlyContinue) {
    try {
        $response = curl -s http://localhost:5000/health 2>$null
        if ($response) {
            Check-Pass "Backend server is running"
            
            if ($response -match "connected") {
                Check-Pass "Backend database connection is active"
            } else {
                Check-Warn "Backend running but database connection status unknown"
            }
        }
    } catch {
        Check-Info "Backend server not running (OK - start it to test)"
    }
} else {
    Check-Info "curl not available - cannot test API"
}

Write-Host ""

# ===== SUMMARY =====
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

$TOTAL = $PASSED + $FAILED + $WARNINGS

Write-Host ""
Write-Host "✅ Passed:   $PASSED" -ForegroundColor Green
Write-Host "⚠️  Warnings: $WARNINGS" -ForegroundColor Yellow
Write-Host "❌ Failed:   $FAILED" -ForegroundColor Red
Write-Host ""

if ($FAILED -eq 0) {
    Write-Host "═══════════════════════════════════════" -ForegroundColor Green
    Write-Host "System Setup: READY TO GO! 🚀" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start backend: cd BackEnd && node src/server.js"
    Write-Host "2. Start frontend: cd FrontEnd && npm run dev"
    Write-Host "3. Go to: http://localhost:5173"
    Write-Host ""
} else {
    Write-Host "═══════════════════════════════════════" -ForegroundColor Red
    Write-Host "Issues Found - Please Fix Above Errors" -ForegroundColor Red
    Write-Host "═══════════════════════════════════════" -ForegroundColor Red
    Write-Host ""
    Write-Host "See TROUBLESHOOTING.md for detailed help" -ForegroundColor Cyan
}

Write-Host ""
Read-Host "Press Enter to continue"
