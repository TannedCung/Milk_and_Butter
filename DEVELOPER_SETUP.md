# MilkandButter Developer Setup Guide

## 🛠️ Development Environment Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 16+ (for local frontend development)
- Python 3.10+ (for local backend development)

### Quick Start with Docker
```bash
# 1. Clone the repository
git clone <repository-url>
cd MilkandButter

# 2. Copy environment template
cp env.example .env

# 3. Edit .env with your actual values
# - Add your Google OAuth credentials
# - Set secure passwords for database

# 4. Start the application
docker compose up -d

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

## 📋 Environment Variables

### Required Variables
Copy `env.example` to `.env` and configure:

- **GOOGLE_OAUTH_CLIENT_ID**: Google OAuth client ID
- **GOOGLE_OAUTH_SECRET**: Google OAuth secret
- **POSTGRES_PASSWORD**: Database password
- **SECRET_KEY**: Django secret key

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)

## 🛡️ Security Best Practices

### Files Already Ignored
Our `.gitignore` and `.dockerignore` files protect:

- **Environment files** (`.env`, `.env.local`, etc.)
- **Secrets and keys** (`.secrets`, `*.pem`, `*.key`)
- **Database files** (`*.sqlite3`, `*.dump`)
- **Logs and temporary files**
- **IDE configurations** (`.vscode/`, `.idea/`)
- **Build artifacts** (`node_modules/`, `__pycache__/`)

### Never Commit These
- Environment variables with real values
- API keys or secrets
- Database files or dumps
- SSL certificates
- Local configuration files

## 🐳 Docker Configuration

### Multi-Stage .dockerignore Files

1. **Root `.dockerignore`**: Global patterns for multi-service builds
2. **Backend `.dockerignore`**: Python/Django specific optimizations
3. **Frontend `.dockerignore`**: Node.js/React specific optimizations

### Benefits
- **Smaller images**: Excludes unnecessary files
- **Faster builds**: Reduces build context
- **Security**: Prevents secrets from entering images
- **Consistency**: Same exclusions across environments

## 🔧 Development Workflow

### Local Development
```bash
# Backend only
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python manage.py runserver

# Frontend only
cd frontend
npm install
npm start
```

### Production Deployment
```bash
# Use production Docker Compose
docker compose -f docker-compose.production.yml up -d
```

## 📁 Project Structure
```
MilkandButter/
├── .gitignore              # Git ignore patterns
├── .dockerignore           # Docker ignore patterns
├── env.example             # Environment template
├── docker-compose.yml      # Development services
├── docker-compose.production.yml  # Production services
├── backend/
│   ├── .dockerignore       # Backend-specific ignores
│   ├── Dockerfile          # Backend container
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── .dockerignore       # Frontend-specific ignores
│   ├── Dockerfile          # Frontend container
│   └── package.json        # Node.js dependencies
└── nginx/
    └── nginx.conf          # Reverse proxy config
```

## 🚀 Deployment Notes

### Environment-Specific Files
- **Development**: Uses `docker-compose.yml`
- **Production**: Uses `docker-compose.production.yml`
- **Environment**: Copy `env.example` to `.env` for each environment

### Security in Production
Ensure these settings in production `.env`:
```bash
DEBUG=False
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

## 📚 Additional Resources

- [Django Settings Best Practices](https://docs.djangoproject.com/en/4.2/topics/settings/)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

## 🆘 Troubleshooting

### Common Issues
1. **Permission denied**: Check Docker daemon is running
2. **Port conflicts**: Ensure ports 3000, 8000, 5432 are available
3. **Environment variables**: Verify `.env` file exists and has correct values
4. **Database connection**: Check PostgreSQL container is running

### Getting Help
- Check container logs: `docker compose logs <service-name>`
- Restart services: `docker compose restart`
- Clean rebuild: `docker compose down && docker compose up --build` 