#!/bin/bash

# Backup script for MilkandButter production
# Usage: ./backup.sh

set -e

# Configuration
BACKUP_DIR="./backups"
PROJECT_NAME="milkandbutter"
KEEP_BACKUPS=7  # Number of backups to keep

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Create backup directory
mkdir -p $BACKUP_DIR

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="${PROJECT_NAME}_backup_${TIMESTAMP}"

log "Starting backup: $BACKUP_NAME"

# Check if services are running
if ! docker compose -f docker-compose.production.yml ps | grep -q "Up"; then
    warning "Production services don't appear to be running"
    warning "Attempting to start services for backup..."
    docker compose -f docker-compose.production.yml up -d db redis
    sleep 10
fi

# Backup database
log "Backing up database..."
if docker compose -f docker-compose.production.yml exec -T db pg_isready -U ${DB_USER:-milkandbutter_user} -d ${DB_NAME:-milkandbutter_prod}; then
    docker compose -f docker-compose.production.yml exec -T db pg_dump \
        -U ${DB_USER:-milkandbutter_user} \
        -d ${DB_NAME:-milkandbutter_prod} \
        --verbose \
        > "${BACKUP_DIR}/${BACKUP_NAME}_db.sql"
    
    # Compress database backup
    gzip "${BACKUP_DIR}/${BACKUP_NAME}_db.sql"
    log "Database backup completed: ${BACKUP_NAME}_db.sql.gz"
else
    error "Database is not accessible for backup"
    exit 1
fi

# Backup media files (if they exist)
if [[ -d "./media" ]] && [[ "$(ls -A ./media)" ]]; then
    log "Backing up media files..."
    tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_media.tar.gz" ./media
    log "Media backup completed: ${BACKUP_NAME}_media.tar.gz"
else
    log "No media files to backup"
fi

# Backup static files (if they exist)
if [[ -d "./staticfiles" ]] && [[ "$(ls -A ./staticfiles)" ]]; then
    log "Backing up static files..."
    tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_static.tar.gz" ./staticfiles
    log "Static files backup completed: ${BACKUP_NAME}_static.tar.gz"
else
    log "No static files to backup"
fi

# Backup environment files
log "Backing up configuration files..."
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}_config"

if [[ -f "backend/.env.production" ]]; then
    cp "backend/.env.production" "${BACKUP_DIR}/${BACKUP_NAME}_config/"
fi

if [[ -f "frontend/.env.production" ]]; then
    cp "frontend/.env.production" "${BACKUP_DIR}/${BACKUP_NAME}_config/"
fi

if [[ -f "docker-compose.production.yml" ]]; then
    cp "docker-compose.production.yml" "${BACKUP_DIR}/${BACKUP_NAME}_config/"
fi

tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_config.tar.gz" -C "${BACKUP_DIR}" "${BACKUP_NAME}_config"
rm -rf "${BACKUP_DIR}/${BACKUP_NAME}_config"
log "Configuration backup completed: ${BACKUP_NAME}_config.tar.gz"

# Create backup manifest
log "Creating backup manifest..."
cat > "${BACKUP_DIR}/${BACKUP_NAME}_manifest.txt" << EOF
Backup: $BACKUP_NAME
Date: $(date)
Host: $(hostname)
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "N/A")
Files:
$(ls -lh "${BACKUP_DIR}/"*"${TIMESTAMP}"*)
EOF

# Cleanup old backups
log "Cleaning up old backups (keeping last $KEEP_BACKUPS)..."
find $BACKUP_DIR -name "${PROJECT_NAME}_backup_*" -type f | sort -r | tail -n +$((KEEP_BACKUPS * 4 + 1)) | xargs rm -f

# Calculate total backup size
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
log "Backup completed successfully!"
log "Backup location: ${BACKUP_DIR}"
log "Total backup size: ${TOTAL_SIZE}"

# Test backup integrity
log "Testing backup integrity..."

# Test database backup
if [[ -f "${BACKUP_DIR}/${BACKUP_NAME}_db.sql.gz" ]]; then
    if gunzip -t "${BACKUP_DIR}/${BACKUP_NAME}_db.sql.gz"; then
        log "Database backup integrity: OK"
    else
        error "Database backup integrity: FAILED"
        exit 1
    fi
fi

# Test media backup
if [[ -f "${BACKUP_DIR}/${BACKUP_NAME}_media.tar.gz" ]]; then
    if tar -tzf "${BACKUP_DIR}/${BACKUP_NAME}_media.tar.gz" > /dev/null; then
        log "Media backup integrity: OK"
    else
        error "Media backup integrity: FAILED"
        exit 1
    fi
fi

# Test config backup
if [[ -f "${BACKUP_DIR}/${BACKUP_NAME}_config.tar.gz" ]]; then
    if tar -tzf "${BACKUP_DIR}/${BACKUP_NAME}_config.tar.gz" > /dev/null; then
        log "Config backup integrity: OK"
    else
        error "Config backup integrity: FAILED"
        exit 1
    fi
fi

log "All backup integrity checks passed ✓"
log "Backup process completed successfully!"

# Output backup details
echo ""
echo "=== BACKUP SUMMARY ==="
echo "Backup Name: $BACKUP_NAME"
echo "Backup Directory: $BACKUP_DIR"
echo "Files created:"
ls -lh "${BACKUP_DIR}/"*"${TIMESTAMP}"*
echo ""
echo "To restore from this backup, refer to the PRODUCTION_README.md" 