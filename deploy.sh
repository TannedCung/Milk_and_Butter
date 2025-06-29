#!/bin/bash

# Production deployment script for MilkandButter
# Usage: ./deploy.sh [environment]

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="milkandbutter"
BACKUP_DIR="./backups"
DEPLOY_USER="deploy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if environment files exist
check_env_files() {
    log "Checking environment files..."
    
    if [[ ! -f "backend/.env.production" ]]; then
        error "Backend production environment file not found!"
        error "Please create backend/.env.production with your production settings."
        exit 1
    fi
    
    if [[ ! -f "frontend/.env.production" ]]; then
        error "Frontend production environment file not found!"
        error "Please create frontend/.env.production with your production settings."
        exit 1
    fi
    
    log "Environment files found ✓"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    mkdir -p $BACKUP_DIR
    BACKUP_NAME="${PROJECT_NAME}_backup_$(date +%Y%m%d_%H%M%S)"
    
    # Backup database
    if docker compose -f docker-compose.production.yml ps db | grep -q "Up"; then
        log "Backing up database..."
        docker compose -f docker-compose.production.yml exec -T db pg_dump -U ${DB_USER:-milkandbutter_user} ${DB_NAME:-milkandbutter_prod} > "${BACKUP_DIR}/${BACKUP_NAME}_db.sql"
    fi
    
    # Backup media files
    if [[ -d "./media" ]]; then
        log "Backing up media files..."
        tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_media.tar.gz" ./media
    fi
    
    log "Backup completed: $BACKUP_NAME"
}

# Pre-deployment checks
pre_deploy_checks() {
    log "Running pre-deployment checks..."
    
    # Check Docker and Docker Compose
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed!"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        error "Docker Compose is not installed!"
        exit 1
    fi
    
    # Check if ports are available
    if netstat -tuln 2>/dev/null | grep -q ":80 "; then
        warning "Port 80 is already in use"
    fi
    
    if netstat -tuln 2>/dev/null | grep -q ":443 "; then
        warning "Port 443 is already in use"
    fi
    
    log "Pre-deployment checks completed ✓"
}

# Build and deploy
deploy() {
    log "Starting deployment for $ENVIRONMENT environment..."
    
    # Pull latest changes (if in git repo)
    if [[ -d ".git" ]]; then
        log "Pulling latest changes..."
        git pull origin main
    fi
    
    # Build images
    log "Building Docker images..."
    docker compose -f docker-compose.production.yml build --no-cache
    
    # Stop existing containers gracefully
    log "Stopping existing containers..."
    docker compose -f docker-compose.production.yml down --timeout 30
    
    # Start new containers
    log "Starting new containers..."
    docker compose -f docker-compose.production.yml up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Run database migrations
    log "Running database migrations..."
    docker compose -f docker-compose.production.yml exec backend python manage.py migrate --settings=backend.settings_production
    
    # Collect static files
    log "Collecting static files..."
    docker compose -f docker-compose.production.yml exec backend python manage.py collectstatic --noinput --settings=backend.settings_production
    
    # Create superuser if it doesn't exist
    log "Ensuring superuser exists..."
    docker compose -f docker-compose.production.yml exec backend python manage.py shell --settings=backend.settings_production -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    print('Creating superuser...')
    User.objects.create_superuser('admin', 'admin@example.com', 'changeme123!')
    print('Superuser created! Please change the password!')
else:
    print('Superuser already exists')
"
}

# Health checks
health_checks() {
    log "Running health checks..."
    
    # Check backend health
    MAX_RETRIES=10
    RETRY_COUNT=0
    
    while [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; do
        if curl -f -s http://localhost/health > /dev/null 2>&1; then
            log "Backend health check passed ✓"
            break
        else
            warning "Backend health check failed, retrying in 10 seconds... ($((RETRY_COUNT + 1))/$MAX_RETRIES)"
            sleep 10
            RETRY_COUNT=$((RETRY_COUNT + 1))
        fi
    done
    
    if [[ $RETRY_COUNT -eq $MAX_RETRIES ]]; then
        error "Backend health check failed after $MAX_RETRIES attempts"
        return 1
    fi
    
    # Check frontend
    if curl -f -s http://localhost > /dev/null 2>&1; then
        log "Frontend health check passed ✓"
    else
        error "Frontend health check failed"
        return 1
    fi
    
    log "All health checks passed ✓"
}

# Rollback function
rollback() {
    error "Deployment failed! Rolling back..."
    
    # Stop failed containers
    docker compose -f docker-compose.production.yml down
    
    # Restore from backup if available
    LATEST_BACKUP=$(ls -t $BACKUP_DIR/*_db.sql 2>/dev/null | head -n1)
    if [[ -n "$LATEST_BACKUP" ]]; then
        log "Restoring database from backup: $LATEST_BACKUP"
        # Add database restore logic here
    fi
    
    error "Rollback completed. Please check the logs and fix the issues."
    exit 1
}

# Cleanup old backups (keep last 5)
cleanup_backups() {
    log "Cleaning up old backups..."
    find $BACKUP_DIR -name "${PROJECT_NAME}_backup_*" -type f | sort -r | tail -n +6 | xargs rm -f
    log "Backup cleanup completed ✓"
}

# Main deployment flow
main() {
    log "Starting MilkandButter production deployment..."
    
    # Trap errors and rollback
    trap rollback ERR
    
    check_env_files
    pre_deploy_checks
    create_backup
    deploy
    
    # Remove error trap before health checks
    trap - ERR
    
    if health_checks; then
        log "Deployment completed successfully! ✓"
        log "Application is running at:"
        log "  - Frontend: http://localhost (or your domain)"
        log "  - Backend API: http://localhost/api/"
        log "  - Admin: http://localhost/admin/"
        log ""
        log "Don't forget to:"
        log "  1. Update your DNS records to point to this server"
        log "  2. Set up SSL certificates"
        log "  3. Configure monitoring and backups"
        log "  4. Change default admin password"
        
        cleanup_backups
    else
        error "Health checks failed after deployment"
        rollback
    fi
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 