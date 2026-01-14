# FeedRV Backend

AI-powered content feed aggregator with JWT authentication.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Or: Python 3.12+ with `uv`

### Running with Docker

```bash
# From project root
cd /home/bartek/Coding/FeedRV

# Start services
docker compose up -d

# Check logs
docker compose logs -f backend
```

**API:** http://localhost:8000  
**Docs:** http://localhost:8000/docs

### Running Locally

```bash
cd backend

# Install dependencies
uv sync

# Set environment variables
export SECRET_KEY="your-secret-key-min-32-chars"
export DATABASE_URL="postgresql://postgres:password@localhost:5432/feedrv"

# Run server
uv run fastapi dev main.py
```

---

## 📚 Documentation

| File | Description |
|------|-------------|
| **[AUTH_QUICK_REF.md](AUTH_QUICK_REF.md)** | Quick reference for authorization (start here) |
| **[AUTHORIZATION_GUIDE.md](AUTHORIZATION_GUIDE.md)** | Complete authorization guide with examples |
| **[REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)** | Project refactoring summary |
| **[FIX_BCRYPT.md](FIX_BCRYPT.md)** | Fix for bcrypt version conflict |

---

## 🔐 Authentication

### Quick Example

```bash
# 1. Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 2. Login (get token)
TOKEN=$(curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=test123" \
  -s | jq -r '.access_token')

# 3. Use token
curl http://localhost:8000/items/ \
  -H "Authorization: Bearer $TOKEN"
```

See **[AUTH_QUICK_REF.md](AUTH_QUICK_REF.md)** for more examples.

---

## 🏗️ Architecture

### Project Structure

```
backend/
├── main.py                   # FastAPI app configuration
├── app/
│   ├── auth.py              # JWT authentication system
│   ├── models.py            # SQLModel database models
│   ├── database.py          # Database configuration
│   ├── services.py          # AI/embeddings services
│   ├── scraper.py           # Web scraping
│   └── routers/             # API endpoints
│       ├── auth.py          # /auth/* endpoints
│       ├── items.py         # /items/* endpoints
│       ├── tags.py          # /tags/* endpoints
│       └── health.py        # / and /health endpoints
├── Dockerfile
├── pyproject.toml
└── uv.lock
```

### Tech Stack

- **FastAPI** - Web framework
- **SQLModel** - ORM with Pydantic integration
- **PostgreSQL + pgvector** - Database with vector search
- **JWT** - Authentication (python-jose)
- **bcrypt** - Password hashing (passlib)
- **Google Gemini** - AI content analysis & embeddings
- **uv** - Fast Python package manager

---

## 📡 API Endpoints

### Public
```
GET  /              # Hello message
GET  /health        # Health check
```

### Authentication
```
POST /auth/register # Create account
POST /auth/login    # Get JWT token
GET  /auth/me       # Current user info (requires auth)
```

### Items (require authentication)
```
POST   /items/?url=<url>              # Add new item
GET    /items/                        # List user's items
GET    /items/search/?q=<query>       # Search with AI
DELETE /items/{id}                    # Delete item
```

### Tags (require authentication)
```
GET    /tags/                         # List all tags
```

**Interactive docs:** http://localhost:8000/docs

---

## 🔧 Configuration

### Environment Variables

```env
# Required
SECRET_KEY=your-super-secret-key-min-32-characters-long
DATABASE_URL=postgresql://postgres:password@localhost:5432/feedrv
GOOGLE_API_KEY=your-google-api-key

# Optional
ACCESS_TOKEN_EXPIRE_MINUTES=30  # Default: 30
```

**Generate SECRET_KEY:**
```bash
openssl rand -hex 32
```

### Docker Setup

See `docker-compose.yml` in project root for full configuration.

---

## 🛠️ Development

### Install Dependencies

```bash
# Using uv (recommended)
uv sync

# Or with pip
pip install -e .
```

### Run Development Server

```bash
# With uv
uv run fastapi dev main.py

# Or directly
fastapi dev main.py --reload
```

### Database Migrations

Database tables are auto-created on first run via `SQLModel.metadata.create_all()`.

Vector extension and indexes are created in `app/database.py:init_db()`.

### Run Tests

```bash
# TODO: Add tests
uv run pytest
```

---

## 🐛 Troubleshooting

### bcrypt Version Error

If you see: `AttributeError: module 'bcrypt' has no attribute '__about__'`

**Solution:** See **[FIX_BCRYPT.md](FIX_BCRYPT.md)**

```bash
# Rebuild Docker container
docker compose down backend
docker compose build backend
docker compose up -d backend
```

### Token Expired (401)

JWT tokens expire after 30 minutes. Re-login to get new token:

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=your@email.com&password=yourpass"
```

### Database Connection Error

Check if PostgreSQL is running:

```bash
docker compose ps db
```

Verify `DATABASE_URL` in `.env` file.

---

## 📦 Dependencies

Key packages:

```toml
fastapi[standard]>=0.128.0
sqlmodel>=0.0.31
psycopg[binary]>=3.1.18
pgvector>=0.2.5
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
bcrypt<4.0.0                    # Important: pin to 3.x
python-multipart>=0.0.9
pydantic-ai>=1.39.1
httpx>=0.28.1
trafilatura>=2.0.0
```

See `pyproject.toml` for complete list.

---

## 🚢 Production Deployment

### Checklist

- [ ] Change `SECRET_KEY` to strong random value
- [ ] Use HTTPS (not HTTP)
- [ ] Set `DATABASE_URL` to production database
- [ ] Enable CORS with specific origins
- [ ] Add rate limiting
- [ ] Set up logging and monitoring
- [ ] Use production WSGI server (gunicorn + uvicorn)
- [ ] Configure backup strategy for database
- [ ] Set up CI/CD pipeline
- [ ] Add health checks and alerts

### Example Production Command

```bash
# Use gunicorn with uvicorn workers
gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 📞 Support

- **Issues:** Create issue on GitHub
- **Documentation:** See markdown files in this directory
- **API Docs:** http://localhost:8000/docs

---

**Last Updated:** 2026-01-09  
**Version:** 1.0.0

