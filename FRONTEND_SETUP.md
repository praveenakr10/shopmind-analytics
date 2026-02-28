# ShopMind Frontend Setup

A comprehensive behavioral intelligence platform for e-commerce analytics, built with React 19, Vite, React Router v7, and Recharts.

## Project Structure

```
frontend/
├── src/
│   ├── pages/              # Route pages
│   │   ├── DashboardPage.jsx
│   │   ├── SegmentPage.jsx
│   │   ├── AffinityPage.jsx
│   │   ├── SentimentPage.jsx
│   │   ├── StrategyPage.jsx
│   │   └── ComparePage.jsx
│   ├── components/         # Reusable components
│   │   ├── Layout.jsx
│   │   ├── CustomerForm.jsx
│   │   ├── ResultCard.jsx
│   │   ├── StrategyCard.jsx
│   │   ├── DataTable.jsx
│   │   ├── SegmentFilter.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── charts/
│   │       └── HeatmapChart.jsx
│   ├── context/            # State management
│   │   └── AnalysisContext.jsx
│   ├── utils/              # Utilities
│   │   └── api.js
│   ├── styles/             # CSS files
│   │   ├── globals.css
│   │   ├── Layout.css
│   │   ├── DashboardPage.css
│   │   ├── SegmentPage.css
│   │   ├── AffinityPage.css
│   │   ├── SentimentPage.css
│   │   ├── StrategyPage.css
│   │   ├── ComparePage.css
│   │   ├── charts.css
│   │   ├── DataTable.css
│   │   ├── SegmentFilter.css
│   │   └── LoadingSpinner.css
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
└── vite.config.js
```

## Key Features

### 1. Dashboard (`/`)
- Customer analysis form
- AI-powered prediction and strategy generation
- Real-time results display

### 2. Segment Analysis (`/segment/:id`)
- Segment-specific statistics
- Product affinity analysis
- Category affinity analysis
- Sentiment breakdown

### 3. Affinity Analysis (`/affinity`)
- Product affinity matrix visualization
- Category affinity matrix visualization
- Interactive heatmap charts

### 4. Sentiment Analysis (`/sentiment`)
- Sentiment distribution overview
- Positive/Neutral/Negative breakdown
- Sentiment statistics table

### 5. Strategy Generation (`/strategy`)
- Segment selection interface
- AI-powered strategy recommendations
- Detailed strategy breakdown by segment

### 6. Segment Comparison (`/compare`)
- Side-by-side segment comparison
- Multi-metric analysis
- Detailed comparison metrics

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- npm or pnpm

### Steps

1. **Install dependencies**
   ```bash
   cd frontend
   pnpm install
   # or
   npm install
   ```

2. **Configure API endpoint**
   - Edit `src/utils/api.js` and update `API_BASE_URL` if backend is on a different port
   - Default: `http://localhost:8000`

3. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Build for production**
   ```bash
   pnpm build
   ```

5. **Preview production build**
   ```bash
   pnpm preview
   ```

## Architecture

### State Management
- **AnalysisContext** provides global state for all analysis data
- **Caching** implemented in context for performance optimization
- All API calls go through centralized `apiClient`

### Data Flow
1. User interacts with UI components
2. Components call methods from `useAnalysis()` hook
3. Methods fetch data via `apiClient`
4. Data is cached in context state
5. Components re-render with new data

### Design System
- **Colors**: Slate base with amber accents, green for positive, rose for risk
- **Typography**: Georgia serif for headers, system sans-serif for body
- **Spacing**: CSS variables for consistent spacing (xs, sm, md, lg, xl, 2xl)
- **Border Radius**: 8px standard radius with 12px for larger containers

### API Integration
All endpoints mapped from OpenAPI schema:
- `GET /metadata/options` - Get form options
- `GET /metadata/segments` - Get segment definitions
- `POST /customers/analyze` - Analyze customer
- `GET /segments/{id}/stats` - Segment statistics
- `GET /segments/{id}/product-affinities` - Product affinities
- `GET /segments/{id}/category-affinities` - Category affinities
- `GET /segments/{id}/sentiment` - Sentiment data
- `GET /affinities/products/matrix` - Product affinity matrix
- `GET /affinities/categories/matrix` - Category affinity matrix
- `GET /sentiment/overview` - Sentiment overview
- `GET /strategy/segments/{id}` - Segment strategy
- `GET /strategy/products/{id}` - Product strategy
- `GET /compare/segments` - Segment comparison
- `GET /compare/products` - Product comparison

## Styling

### CSS Architecture
- Global styles in `index.css` and `App.css`
- Component-specific styles in `styles/` folder
- All imported through `styles/globals.css`
- CSS variables for theming in `Layout.css`

### Responsive Design
- Mobile-first approach
- Breakpoints: 768px, 1024px
- Flexbox for primary layouts
- Grid for complex 2D layouts

## Components

### Reusable Components

#### DataTable
Sortable data table with customizable columns
```jsx
<DataTable
  data={data}
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'value', label: 'Value', decimals: 2 }
  ]}
  title="Data Table"
  sortable={true}
/>
```

#### HeatmapChart / SentimentChart / MatrixChart
Data visualization components using Recharts
```jsx
<HeatmapChart data={data} title="Product Affinities" />
<SentimentChart data={sentiment} title="Sentiment" />
<MatrixChart data={matrix} title="Affinity Matrix" />
```

#### SegmentFilter
Segment selection component
```jsx
<SegmentFilter
  segments={segments}
  selectedId={selectedId}
  onSelect={(id) => setSelectedId(id)}
/>
```

#### LoadingSpinner
Loading indicator
```jsx
<LoadingSpinner message="Loading data..." />
```

## Performance Optimization

1. **Context Caching**: API responses cached to prevent redundant calls
2. **Code Splitting**: Page components lazy-loadable via React Router
3. **Memoization**: Components use React.memo where appropriate
4. **CSS**: Organized by feature to minimize bundle size

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### API Connection Issues
- Verify backend is running on correct port
- Check CORS settings if backend is on different domain
- Inspect Network tab in browser DevTools

### Data Not Loading
- Check browser console for error messages
- Verify API endpoint URLs in `src/utils/api.js`
- Ensure backend responds with correct JSON structure

### Styling Issues
- Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
- Check if all CSS files are imported in `styles/globals.css`
- Verify CSS variable values in `Layout.css`

## Future Enhancements

- Real-time data updates via WebSocket
- Advanced filtering and search
- Export to PDF/CSV
- User authentication
- Dashboard customization
- Historical data tracking
- Predictive analytics

## License

Proprietary - ShopMind 2026
