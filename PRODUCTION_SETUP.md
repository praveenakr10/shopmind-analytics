# ShopMind2 - Production Setup Guide

## Overview

ShopMind2 is a premium SaaS-grade behavioral intelligence dashboard built with React 19, Vite, FastAPI, and advanced ML models. This guide covers setup and deployment for production environments.

---

## Frontend Setup (React + Vite)

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
cd frontend
pnpm install
```

### Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
pnpm build
pnpm preview  # Preview production build locally
```

### Features

- **Dark/Light Theme Toggle**: Persistent theme selection with CSS variables
- **Premium Components**:
  - MetricCard - KPI display with trends
  - InsightPanel - AI insight cards with glassmorphism
  - ChartContainer - Data visualization wrapper
  - RiskIndicator - Risk scoring visualization
  - SegmentBadge - Segment labeling system

- **Pages**:
  - Dashboard - Customer analysis with AI predictions
  - Segment Analysis - Deep-dive metrics per segment
  - Affinity Analysis - Product/category relationships
  - Sentiment Analysis - Customer sentiment distribution
  - Strategy Generation - AI-powered recommendations
  - Segment Comparison - Side-by-side analysis

### Environment Variables

Create `.env.local` in frontend/:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## Backend Setup (FastAPI)

### Prerequisites
- Python 3.8+
- pip or conda

### Installation

```bash
cd backend
pip install -r requirements.txt
```

### Models

Pre-trained ML models are loaded from `./final_models/`:
- `preprocessing_pipeline.pkl` - Clustering preprocessing
- `kmeans_model.pkl` - Segment clustering
- `recommendation_model.pkl` - Next purchase prediction
- `advanced_models.pkl` - Churn, CLV, sentiment predictions

### Running the Server

```bash
# Development server
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Production server (with Gunicorn)
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

The API will be available at `http://localhost:8000`

### API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### API Routes

#### Metadata
- `GET /metadata/options` - Available form options
- `GET /metadata/segments` - Customer segments

#### Predictions (Legacy)
- `POST /predict` - Customer segmentation prediction
- `POST /predict_and_strategy` - Prediction + strategy generation
- `POST /predict_subscription` - Subscription prediction
- `POST /predict_churn_clv_sentiment` - Multi-model predictions
- `POST /predict_anomaly` - Anomaly detection

#### Dashboard Analytics
- `GET /affinities/products/matrix` - Product affinity matrix
- `GET /affinities/categories/matrix` - Category affinity matrix
- `GET /sentiment/overview` - Sentiment analysis overview
- `GET /strategy/segments/{segment_id}` - Segment strategy
- `GET /compare/segments` - Segment comparison
- `GET /health` - Health check

---

## Architecture

### Frontend Architecture

```
frontend/
├── src/
│   ├── pages/              # Page components
│   ├── components/         # Reusable components
│   ├── context/            # React Context (Theme, Analysis)
│   ├── styles/             # Component-specific CSS
│   ├── utils/              # API client, helpers
│   └── App.jsx             # Root component with Router
├── public/                 # Static assets
├── vite.config.js          # Vite configuration
└── package.json
```

### Backend Architecture

```
backend/
├── app.py                  # Main FastAPI app
├── routers/                # Route modules
│   ├── metadata.py         # Segment & options
│   ├── affinity.py         # Product/category affinities
│   └── sentiment.py        # Sentiment analysis
├── strategy_ai.py          # Strategy generation
├── genai_insights.py       # AI explanations
├── final_models/           # Pre-trained ML models
└── requirements.txt
```

---

## Design System

### Color Palette

| Purpose | Light Mode | Dark Mode |
|---------|-----------|----------|
| Primary Text | `#0f172a` | `#ffffff` |
| Secondary Text | `#475569` | `#94a3b8` |
| Primary Brand | `#6366f1` (Indigo) | `#818cf8` |
| Success | `#10b981` (Emerald) | `#34d399` |
| Warning | `#f59e0b` (Amber) | `#fbbf24` |
| Danger | `#f43f5e` (Rose) | `#fb7185` |

### Typography

- **Headings**: Georgia, Garamond (serif)
- **Body**: System sans-serif (-apple-system, Segoe UI, Roboto)
- **Code**: Menlo, Monaco (monospace)

### Spacing System (8px base)

- xs: 0.5rem (4px)
- sm: 0.75rem (6px)
- md: 1rem (8px)
- lg: 1.5rem (12px)
- xl: 2rem (16px)
- 2xl: 3rem (24px)

### Transitions

- Fast: 150ms
- Base: 200ms
- Slow: 250ms

---

## Deployment

### Frontend Deployment (Vercel)

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys on push
# Or manually deploy:
pnpm deploy
```

### Backend Deployment

#### Heroku

```bash
# Create Procfile
echo "web: gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:\$PORT" > backend/Procfile

# Deploy
git push heroku main
```

#### Docker

```dockerfile
FROM python:3.10
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "app:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

```bash
docker build -t shopmind .
docker run -p 8000:8000 shopmind
```

#### AWS EC2 / ECS

See AWS documentation for containerized deployment.

---

## Performance Optimization

### Frontend

- Lazy-load routes with React Router
- Memoize heavy components with `React.memo`
- Use CSS variables for efficient theme switching
- Implement skeleton loaders for data states

### Backend

- Cache segment data with in-memory caching
- Use FastAPI's built-in dependency injection
- Batch predict requests where possible
- Monitor with `/health` endpoint

---

## Monitoring & Logging

### Frontend
- Use browser DevTools for React profiling
- Monitor bundle size with `pnpm build --analyze`
- Track errors with Sentry or similar service

### Backend
- Use FastAPI's structured logging
- Monitor endpoint performance
- Track ML model inference times
- Set up alerts for `/health` failures

---

## Troubleshooting

### Frontend Issues

**Theme not persisting**: Check localStorage access and ensure ThemeContext is properly initialized.

**API calls failing**: Verify `VITE_API_BASE_URL` environment variable and CORS settings on backend.

**Charts not rendering**: Check browser console for Recharts errors; ensure data format matches expected schema.

### Backend Issues

**Models not loading**: Verify model files in `./final_models/` and file permissions.

**Segment not found**: Check segment IDs match those defined in metadata routes.

**API documentation not showing**: Ensure FastAPI is running and visit `/docs` endpoint.

---

## Support & Maintenance

### Regular Tasks

1. **Weekly**: Monitor API health and response times
2. **Monthly**: Review model performance and predictions
3. **Quarterly**: Update dependencies and security patches

### Backup & Recovery

- Backup ML models regularly
- Maintain database backups if applicable
- Keep deployment configurations in version control

---

## License

ShopMind2 - Premium Analytics Dashboard
© 2026

