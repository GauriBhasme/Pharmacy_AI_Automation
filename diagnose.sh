#!/bin/bash
# Medical Pharmacy Chatbot - System Diagnostic Script
# Run this to check if everything is properly set up

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║ System Diagnostic Check                    ║"
echo "║ Medical Pharmacy Chatbot Setup             ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARNINGS++))
}

check_info() {
    echo -e "${BLUE}ℹ️  INFO${NC}: $1"
}

# ===== SECTION 1: Node.js & npm =====
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}1. Node.js & npm Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_pass "Node.js installed: $NODE_VERSION"
else
    check_fail "Node.js not installed"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_pass "npm installed: $NPM_VERSION"
else
    check_fail "npm not installed"
fi

echo ""

# ===== SECTION 2: Directory Structure =====
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}2. Directory Structure${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if [ -d "BackEnd" ]; then
    check_pass "BackEnd directory exists"
else
    check_fail "BackEnd directory not found"
fi

if [ -d "FrontEnd" ]; then
    check_pass "FrontEnd directory exists"
else
    check_fail "FrontEnd directory not found"
fi

if [ -f "BackEnd/.env" ]; then
    check_pass ".env file exists in BackEnd"
else
    check_fail ".env file not found in BackEnd (required)"
fi

if [ -f "BackEnd/src/server.js" ]; then
    check_pass "server.js exists"
else
    check_fail "server.js not found"
fi

if [ -f "BackEnd/src/app.js" ]; then
    check_pass "app.js exists"
else
    check_fail "app.js not found"
fi

echo ""

# ===== SECTION 3: Dependencies =====
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}3. Backend Dependencies${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if [ -d "BackEnd/node_modules" ]; then
    check_pass "BackEnd dependencies installed"
else
    check_warn "BackEnd node_modules not found (run: cd BackEnd && npm install)"
    ((WARNINGS++))
fi

if [ -d "FrontEnd/node_modules" ]; then
    check_pass "FrontEnd dependencies installed"
else
    check_warn "FrontEnd node_modules not found (run: cd FrontEnd && npm install)"
    ((WARNINGS++))
fi

echo ""

# ===== SECTION 4: Port Availability =====
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}4. Port Availability${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if command -v lsof &> /dev/null; then
    if ! lsof -i :5000 &> /dev/null; then
        check_pass "Port 5000 is available"
    else
        check_warn "Port 5000 is in use"
    fi
    
    if ! lsof -i :5173 &> /dev/null; then
        check_pass "Port 5173 is available"
    else
        check_warn "Port 5173 is in use"
    fi
else
    check_info "lsof not available - cannot verify ports (OK on Windows)"
fi

echo ""

# ===== SECTION 5: PostgreSQL =====
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}5. PostgreSQL Configuration${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if command -v psql &> /dev/null; then
    check_pass "PostgreSQL client (psql) installed"
    
    # Check if we can connect
    if psql -h localhost -U postgres -d postgres -c "\q" &> /dev/null; then
        check_pass "Can connect to PostgreSQL"
        
        # Check if pharmacy_ai database exists
        if psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw pharmacy_ai; then
            check_pass "Database 'pharmacy_ai' exists"
            
            # Check if medicines table exists
            if psql -h localhost -U postgres -d pharmacy_ai -c "\dt medicines" &> /dev/null; then
                check_pass "medicines table exists"
                
                # Count medicines
                MEDICINE_COUNT=$(psql -h localhost -U postgres -d pharmacy_ai -t -c "SELECT COUNT(*) FROM medicines;")
                if [ "$MEDICINE_COUNT" -gt 0 ]; then
                    check_pass "medicines table has $MEDICINE_COUNT records"
                else
                    check_warn "medicines table is empty (run: node seed-medicines.js)"
                fi
            else
                check_warn "medicines table not found (run: node seed-medicines.js)"
            fi
        else
            check_warn "Database 'pharmacy_ai' not found (create with: psql -U postgres -c \"CREATE DATABASE pharmacy_ai;\")"
        fi
    else
        check_fail "Cannot connect to PostgreSQL on localhost"
        check_info "Ensure PostgreSQL is running and credentials are correct in .env"
    fi
else
    check_fail "PostgreSQL client (psql) not installed"
    check_info "Install PostgreSQL to use this system"
fi

echo ""

# ===== SECTION 6: Environment Variables =====
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}6. Environment Configuration${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if [ -f "BackEnd/.env" ]; then
    if grep -q "DB_HOST" BackEnd/.env; then
        check_pass "DB_HOST configured"
    else
        check_warn "DB_HOST not found in .env"
    fi
    
    if grep -q "DB_USER" BackEnd/.env; then
        check_pass "DB_USER configured"
    else
        check_warn "DB_USER not found in .env"
    fi
    
    if grep -q "DB_NAME" BackEnd/.env; then
        check_pass "DB_NAME configured"
    else
        check_warn "DB_NAME not found in .env"
    fi
    
    if grep -q "NODE_ENV" BackEnd/.env; then
        check_pass "NODE_ENV configured"
    else
        check_info "NODE_ENV not set (using default)"
    fi
else
    check_fail ".env file not found"
fi

echo ""

# ===== SECTION 7: API Endpoints =====
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}7. API Endpoint Check${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

if command -v curl &> /dev/null; then
    # Check if server is running
    if curl -s http://localhost:5000/health &> /dev/null; then
        check_pass "Backend server is running"
        
        # Check database connection
        if curl -s http://localhost:5000/health | grep -q "connected"; then
            check_pass "Backend database connection is active"
        else
            check_warn "Backend running but database connection status unknown"
        fi
    else
        check_info "Backend server not running (OK - start it to test)"
    fi
else
    check_info "curl not available - cannot test API (OK)"
fi

echo ""

# ===== SUMMARY =====
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"

TOTAL=$((PASSED + FAILED + WARNINGS))

echo ""
echo -e "${GREEN}✅ Passed:${NC}   $PASSED"
echo -e "${YELLOW}⚠️  Warnings:${NC}  $WARNINGS"
echo -e "${RED}❌ Failed:${NC}   $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}System Setup: READY TO GO! 🚀${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start backend: cd BackEnd && node src/server.js"
    echo "2. Start frontend: cd FrontEnd && npm run dev"
    echo "3. Go to: http://localhost:5173"
    exit 0
else
    echo -e "${RED}═══════════════════════════════════════${NC}"
    echo -e "${RED}Issues Found - Please Fix Above Errors${NC}"
    echo -e "${RED}═══════════════════════════════════════${NC}"
    echo ""
    echo "See TROUBLESHOOTING.md for detailed help"
    exit 1
fi
