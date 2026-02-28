# ShopMind2 - Developer Reference Guide

## Quick Start

### Frontend Development

```bash
cd frontend
pnpm install
pnpm dev
# Open http://localhost:5173
```

### Backend Development

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --reload
# API docs: http://localhost:8000/docs
```

---

## Frontend Architecture

### Directory Structure

```
frontend/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── Layout.jsx          # App shell with navigation
│   │   ├── MetricCard.jsx       # KPI display component
│   │   ├── InsightPanel.jsx     # AI insight cards
│   │   ├── ChartContainer.jsx   # Chart wrapper
│   │   ├── RiskIndicator.jsx    # Risk visualization
│   │   └── SegmentBadge.jsx     # Segment label
│   │
│   ├── context/
│   │   ├── ThemeContext.jsx     # Dark/light mode state
│   │   └── AnalysisContext.jsx  # Analysis data state
│   │
│   ├── pages/                   # Route pages
│   │   ├── DashboardPage.jsx    # Main dashboard
│   │   ├── SegmentPage.jsx      # Segment detail
│   │   ├── AffinityPage.jsx     # Affinity analysis
│   │   ├── SentimentPage.jsx    # Sentiment analysis
│   │   ├── StrategyPage.jsx     # Strategy generation
│   │   └── ComparePage.jsx      # Segment comparison
│   │
│   ├── styles/                  # Component-level CSS
│   │   ├── theme.css            # CSS variable definitions
│   │   ├── Layout.css           # Navigation styles
│   │   ├── MetricCard.css
│   │   ├── InsightPanel.css
│   │   ├── ChartContainer.css
│   │   ├── RiskIndicator.css
│   │   └── SegmentBadge.css
│   │
│   ├── utils/
│   │   └── api.js               # API client
│   │
│   ├── App.jsx                  # Root component
│   ├── index.css                # Global styles
│   └── main.jsx                 # Entry point
│
├── public/                      # Static assets
├── vite.config.js              # Vite configuration
├── package.json
└── README.md
```

### Key Components

#### MetricCard
Displays a single KPI with trend indicator.

```jsx
<MetricCard
  title="Total Revenue"
  value="$45,230"
  trend="up"
  change="+12.5%"
  icon="📊"
/>
```

**Props**:
- `title` (string) - Card title
- `value` (string|number) - Main value
- `trend` (string) - 'up', 'down', 'stable'
- `change` (string) - Change percentage
- `icon` (string) - Emoji icon

#### InsightPanel
AI insight card with glass effect.

```jsx
<InsightPanel
  title="Premium Customer Opportunity"
  insight="High-value segment shows 35% growth potential"
  recommendation="Launch VIP retention program"
  severity="opportunity"
/>
```

**Props**:
- `title` (string)
- `insight` (string) - Main insight text
- `recommendation` (string) - Action item
- `severity` (string) - 'info', 'success', 'warning', 'opportunity'

#### ChartContainer
Wraps charts with error handling.

```jsx
<ChartContainer
  title="Segment Distribution"
  loading={isLoading}
  error={error}
>
  <AreaChart data={data}>
    {/* Recharts components */}
  </AreaChart>
</ChartContainer>
```

**Props**:
- `title` (string)
- `loading` (boolean)
- `error` (Error|null)
- `children` (ReactNode) - Chart component

#### SegmentBadge
Segment label with styling.

```jsx
<SegmentBadge segment="high_value" size="md" />
```

**Props**:
- `segment` (string) - Segment ID
- `size` (string) - 'sm', 'md', 'lg'

### State Management

#### ThemeContext
Global theme state.

```jsx
// In App.jsx
<ThemeProvider>
  <App />
</ThemeProvider>

// In any component
const { isDark, toggleTheme } = useTheme();
```

**API**:
- `isDark` (boolean) - Current theme
- `toggleTheme()` - Toggle theme
- `setTheme(theme)` - Set specific theme

#### AnalysisContext
Analysis data state (existing).

```jsx
const { data, loading, error } = useAnalysis();
```

### Styling System

#### CSS Variables
All styles use CSS custom properties for theming.

**Color Variables**:
```css
/* Light mode */
--bg-primary: white;
--bg-secondary: #f9fafb;
--text-primary: #0f172a;
--text-secondary: #475569;

/* Dark mode */
html.dark {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: white;
  --text-secondary: #94a3b8;
}
```

**Spacing System**:
```css
--spacing-xs: 0.5rem;
--spacing-sm: 0.75rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;
--spacing-2xl: 3rem;
```

**Typography**:
```css
--font-serif: 'Georgia', 'Garamond', serif;
--font-sans: -apple-system, BlinkMacSystemFont, ...;
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
```

**Shadows**:
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
```

### Adding New Components

1. Create component file: `components/MyComponent.jsx`
2. Create styles file: `styles/MyComponent.css`
3. Use CSS variables for styling
4. Export from component with documentation

```jsx
// components/MyComponent.jsx
import '../styles/MyComponent.css';

/**
 * MyComponent - Description
 * @param {string} title - Component title
 * @param {ReactNode} children - Content
 */
export default function MyComponent({ title, children }) {
  return (
    <div className="my-component">
      <h3 className="my-component-title">{title}</h3>
      <div className="my-component-content">{children}</div>
    </div>
  );
}
```

```css
/* styles/MyComponent.css */
.my-component {
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  transition: all var(--transition-base);
}

.my-component:hover {
  border-color: var(--card-border-hover);
  box-shadow: var(--shadow-md);
}

.my-component-title {
  font-size: var(--text-lg);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.my-component-content {
  color: var(--text-secondary);
}

/* Dark mode variants if needed */
html.dark .my-component {
  /* Dark mode specific styles */
}
```

---

## Backend Architecture

### Directory Structure

```
backend/
├── app.py                       # Main FastAPI app
├── routers/
│   ├── __init__.py
│   ├── metadata.py              # Segments & options
│   ├── affinity.py              # Affinities
│   └── sentiment.py             # Sentiment
├── strategy_ai.py               # Strategy generation
├── genai_insights.py            # AI explanations
├── final_models/
│   ├── preprocessing_pipeline.pkl
│   ├── kmeans_model.pkl
│   ├── recommendation_model.pkl
│   ├── advanced_models.pkl
│   └── segment_knowledge.json
├── requirements.txt
└── README.md
```

### Router Pattern

Each router handles a feature domain with consistent structure:

```python
# routers/my_feature.py
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/my_feature", tags=["my_feature"])

class MyResponse(BaseModel):
    """Response model"""
    data: str
    status: str

@router.get("/endpoint", response_model=MyResponse)
async def my_endpoint():
    """Endpoint documentation"""
    return MyResponse(
        data="result",
        status="success"
    )
```

### Existing Routers

#### metadata.py
- `GET /metadata/segments` - Segment definitions
- `GET /metadata/options` - Form options

#### affinity.py
- `GET /affinities/products/matrix` - Product affinities
- `GET /affinities/categories/matrix` - Category affinities

#### sentiment.py
- `GET /sentiment/overview` - Sentiment analysis

### Adding New Endpoints

1. Create router file: `routers/my_router.py`
2. Define Pydantic models for requests/responses
3. Implement endpoint functions with proper documentation
4. Register router in `app.py`

```python
# routers/my_router.py
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/my_router", tags=["my_router"])

class MyRequest(BaseModel):
    """Input model"""
    name: str
    value: float

class MyResponse(BaseModel):
    """Output model"""
    result: str
    score: float

@router.post("/predict", response_model=MyResponse)
async def predict(data: MyRequest):
    """
    Predict something
    
    Returns prediction result with confidence score.
    """
    score = data.value * 0.5
    return MyResponse(
        result=f"Prediction for {data.name}",
        score=score
    )
```

```python
# In app.py
from routers import my_router
app.include_router(my_router.router)
```

### API Response Patterns

**Success Response**:
```json
{
  "data": [...],
  "status": "success"
}
```

**Error Response**:
```json
{
  "detail": "Error message",
  "status_code": 400
}
```

### Common Patterns

#### Segment Data
All segment endpoints use these IDs:
- `high_value` - Premium customers
- `discount_driven` - Price-sensitive
- `loyal` - Repeat buyers
- `churn_risk` - At risk

#### Affinity Scores
Returned as floats 0.0-1.0:
- 0.8+ High affinity
- 0.5-0.8 Medium affinity
- <0.5 Low affinity

#### Sentiment Scores
Returned as floats 0.0-1.0:
- 0.7+ Positive
- 0.4-0.7 Neutral
- <0.4 Negative

---

## API Reference

### Metadata Endpoints

#### GET /metadata/segments
Returns all customer segments.

**Response**:
```json
{
  "segments": [
    {
      "id": "high_value",
      "label": "High Value Customers",
      "icon": "💎",
      "description": "..."
    }
  ]
}
```

#### GET /metadata/options
Returns form dropdown options.

**Response**:
```json
{
  "options": {
    "Category": ["Electronics", "Clothing", ...],
    "Payment_Method": ["Credit Card", ...],
    "Shipping_Type": ["Standard", ...],
    "Season": ["Winter", ...],
    "Gender": ["Male", ...]
  }
}
```

### Affinity Endpoints

#### GET /affinities/products/matrix
Returns product affinity matrix.

**Response**:
```json
{
  "segments": ["high_value", ...],
  "products": ["Electronics", ...],
  "matrix": [
    {
      "segment": "high_value",
      "product": "Electronics",
      "affinity_score": 0.85,
      "trend": "up",
      "change_percent": 2.5
    }
  ]
}
```

### Sentiment Endpoints

#### GET /sentiment/overview
Returns sentiment analysis overview.

**Response**:
```json
{
  "segments": [
    {
      "segment_id": "high_value",
      "segment_label": "High Value Customers",
      "avg_sentiment_score": 0.82,
      "sentiment_label": "Positive",
      "positive_count": 820,
      "neutral_count": 120,
      "negative_count": 60,
      "avg_clv": 4200,
      "churn_probability": 0.08,
      "trend": "up"
    }
  ],
  "overall_sentiment": 0.72,
  "overall_label": "Positive"
}
```

---

## Debugging Tips

### Frontend

**Theme not applying**:
```js
// Check CSS variable is set
console.log(getComputedStyle(document.documentElement).getPropertyValue('--bg-primary'));

// Check theme class on html
console.log(document.documentElement.classList);
```

**API calls failing**:
```js
// Check environment variable
console.log(import.meta.env.VITE_API_BASE_URL);

// Check network tab in DevTools
// Check CORS headers in response
```

### Backend

**Models not loading**:
```python
# Check file exists
import os
print(os.path.exists("./final_models/kmeans_model.pkl"))

# Check import works
import joblib
model = joblib.load("./final_models/kmeans_model.pkl")
print(type(model))
```

**Endpoint not registered**:
```python
# Check router is included
print(app.routes)

# Check endpoint exists
from app import app
print([r.path for r in app.routes])
```

---

## Performance Tips

### Frontend
- Memoize heavy components: `React.memo(Component)`
- Use `useCallback` for event handlers
- Lazy-load routes: `React.lazy()`
- Defer non-critical loads

### Backend
- Cache segment data in memory
- Use connection pooling for databases
- Batch requests where possible
- Monitor inference time of ML models

---

## Testing

### Frontend Unit Tests
```javascript
// Example with Vitest
import { render, screen } from '@testing-library/react';
import MetricCard from './MetricCard';

test('renders metric card', () => {
  render(<MetricCard title="Revenue" value="$100" />);
  expect(screen.getByText('Revenue')).toBeInTheDocument();
});
```

### Backend API Tests
```python
# Example with pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_metadata_segments():
    response = client.get("/metadata/segments")
    assert response.status_code == 200
    assert "segments" in response.json()
```

---

## Deployment Checklist

### Before Deploying Frontend
- [ ] Build passes: `pnpm build`
- [ ] No TypeScript errors
- [ ] No console warnings/errors
- [ ] API URL configured in .env
- [ ] Theme toggle works
- [ ] Responsive on mobile

### Before Deploying Backend
- [ ] All tests pass
- [ ] API docs available at /docs
- [ ] Health check returns 200
- [ ] Models load successfully
- [ ] CORS configured
- [ ] Logging configured

---

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Recharts Documentation](https://recharts.org/)

---

## Getting Help

- Check `PRODUCTION_SETUP.md` for setup issues
- Check `PRODUCTION_CHECKLIST.md` for deployment issues
- Check `UPGRADE_SUMMARY.md` for feature overview
- Check component JSDoc comments for component props
- Check API /docs endpoint for backend API details

