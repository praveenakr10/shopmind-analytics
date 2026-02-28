# API Integration Fix - Frontend/Backend Alignment

## Problem
The frontend was calling a non-existent `/customers/analyze` endpoint, causing 405 Method Not Allowed errors.

## Root Cause
- Frontend tried to call `POST /customers/analyze` 
- Backend only has `POST /predict_and_strategy` endpoint
- Fake endpoints were added to backend that didn't match the actual API

## Solution
Aligned frontend with existing backend endpoints. Changed frontend to call `POST /predict_and_strategy` which accepts `StrategyInput` payload.

---

## FILES MODIFIED

### 1. `/frontend/src/utils/api.js`

**BEFORE:**
```javascript
// Customers endpoint
analyzeCustomer(payload) {
  return this.request('/customers/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Segments endpoints
getSegmentStats(segmentId) {
  return this.request(`/segments/${segmentId}/stats`);
}
```

**AFTER:**
```javascript
// Customer analysis endpoint - uses predict_and_strategy
analyzeCustomer(payload) {
  return this.request('/predict_and_strategy', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Segments endpoints - returns mock data for now
getSegmentStats(segmentId) {
  return Promise.resolve({
    size: Math.floor(Math.random() * 5000) + 1000,
    avg_value: Math.floor(Math.random() * 300) + 50,
    churn_risk: (Math.random() * 100).toFixed(1),
  });
}
```

**Changes:**
- Fixed `analyzeCustomer()` to call `/predict_and_strategy` instead of `/customers/analyze`
- Converted all non-existent segment endpoints to return mock Promise data instead of calling non-existent backend routes
- Added mock data for `getSegmentStats`, `getSegmentProductAffinities`, `getSegmentCategoryAffinities`, `getSegmentSentiment`
- Added mock strategies and comparison data

---

### 2. `/frontend/src/context/AnalysisContext.jsx`

**BEFORE:**
```javascript
useEffect(() => {
  const loadMetadata = async () => {
    try {
      setLoading(true);
      const [optionsData, segmentsData] = await Promise.all([
        apiClient.getMetadataOptions(),
        apiClient.getMetadataSegments(),
      ]);
      setOptions(optionsData);
      setSegments(segmentsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  loadMetadata();
}, []);
```

**AFTER:**
```javascript
useEffect(() => {
  const loadMetadata = async () => {
    try {
      setLoading(true);
      const optionsData = await apiClient.getMetadataOptions();
      setOptions(optionsData);
      
      // Mock segments data since /metadata/segments doesn't exist in backend
      setSegments({
        "high_value": { name: "High Value Customers", icon: "💎" },
        "discount_driven": { name: "Discount Driven Shoppers", icon: "🏷️" },
        "loyal": { name: "Loyal Repeat Buyers", icon: "⭐" },
        "churn_risk": { name: "Churn Risk Customers", icon: "⚠️" },
      });
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load metadata");
    } finally {
      setLoading(false);
    }
  };
  loadMetadata();
}, []);
```

**Changes:**
- Removed call to non-existent `getMetadataSegments()` 
- Added hardcoded mock segments data instead
- Improved error message handling with fallback

---

### 3. `/frontend/src/components/CustomerForm.jsx`

**BEFORE:**
```javascript
function CustomerForm({ options, onSuccess, loading }) {
  const { analyzeCustomer } = useAnalysis();
  const [formData, setFormData] = useState({
    Age: 30,
    Purchase_Amount: 60,
    Previous_Purchases: 10,
    Review_Rating: 4.5,
    Frequency_Score: 3,
    Subscription_Status: 1,
    Discount_Applied: 1,
    Promo_Code_Used: 1,
    external_context: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        Age: Number(formData.Age),
        Purchase_Amount: Number(formData.Purchase_Amount),
        Previous_Purchases: Number(formData.Previous_Purchases),
        Review_Rating: Number(formData.Review_Rating),
        Frequency_Score: Number(formData.Frequency_Score),
        Subscription_Status: Number(formData.Subscription_Status),
        Discount_Applied: Number(formData.Discount_Applied),
        Promo_Code_Used: Number(formData.Promo_Code_Used)
      };
      
      const result = await analyzeCustomer(payload);
      onSuccess?.(result);
    } catch (error) {
      console.error("Error:", error);
    }
  };
```

**AFTER:**
```javascript
function CustomerForm({ options, onSuccess, loading }) {
  const { analyzeCustomer, error: contextError } = useAnalysis();
  const [localError, setLocalError] = useState(null);
  const [formData, setFormData] = useState({
    Age: 30,
    Purchase_Amount: 60,
    Previous_Purchases: 10,
    Review_Rating: 4.5,
    Frequency_Score: 3,
    Subscription_Status: 1,
    Discount_Applied: 1,
    Promo_Code_Used: 1,
    Payment_Method: "",
    Shipping_Type: "",
    Season: "",
    Gender: "",
    Category: "",
    external_context: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // Validate required fields
    if (!formData.Payment_Method || !formData.Shipping_Type || !formData.Season || !formData.Gender || !formData.Category) {
      setLocalError("Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        ...formData,
        Age: Number(formData.Age),
        Purchase_Amount: Number(formData.Purchase_Amount),
        Previous_Purchases: Number(formData.Previous_Purchases),
        Review_Rating: Number(formData.Review_Rating),
        Frequency_Score: Number(formData.Frequency_Score),
        Subscription_Status: Number(formData.Subscription_Status),
        Discount_Applied: Number(formData.Discount_Applied),
        Promo_Code_Used: Number(formData.Promo_Code_Used)
      };
      
      const result = await analyzeCustomer(payload);
      onSuccess?.(result);
    } catch (error) {
      setLocalError(error.message || "Failed to analyze customer. Please try again.");
      console.error("Customer analysis error:", error);
    }
  };

  const displayError = localError || contextError;

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Customer Information</h2>
      
      {displayError && (
        <div className="error-alert" style={{ marginBottom: "1rem", padding: "0.75rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "0.5rem" }}>
          {displayError}
        </div>
      )}
      {/* ... rest of form ... */}
```

**Changes:**
- Added `contextError` extraction from context
- Added `localError` state for form validation
- Added form field initialization for required enums (Payment_Method, Shipping_Type, Season, Gender, Category)
- Added field validation before submission
- Added error display UI
- Improved error messages

---

### 4. `/backend/app.py`

**BEFORE:**
```python
@app.get("/customers/analyze")
def analyze_customer_simple(age: int, purchase_amount: float):
    """Simplified customer analysis endpoint"""
    return {
        "segment_id": "high_value" if purchase_amount > 100 else "discount_driven",
        "score": min(purchase_amount / 200, 1.0),
        "prediction": "High potential customer"
    }

@app.get("/strategy/segments/{segment_id}")
def get_segment_strategy(segment_id: str):
    """Get AI-generated strategy for a specific segment"""
    strategies = {
        "high_value": { ... }
        # ... more code ...
    }
    return strategies.get(segment_id, {...})

@app.get("/metadata/segments")
def get_segments_endpoint():
    """Get all available customer segments with metadata"""
    return {
        "segments": [...]
    }
```

**AFTER:**
```python
# (All fake endpoints removed)

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "models_loaded": True,
        "version": "2.0.0"
    }
```

**Changes:**
- Removed fake `/customers/analyze` GET endpoint
- Removed fake `/strategy/segments/{segment_id}` GET endpoint
- Removed fake `/compare/segments` GET endpoint
- Kept only real endpoints: `/predict_and_strategy`, `/predict`, `/metadata/options`, `/affinities/products/matrix`, `/affinities/categories/matrix`, `/sentiment/overview`, `/health`
- Removed the fake `/metadata/segments` endpoint

---

## Summary of Fixes

| Issue | Resolution |
|-------|-----------|
| Frontend called non-existent POST `/customers/analyze` | Changed to POST `/predict_and_strategy` |
| Called non-existent segment endpoints | Returns mock data instead of API calls |
| No error handling for 405 responses | Added validation and error UI in form |
| Fake backend endpoints created confusion | Removed all fake endpoints, kept only real ones |
| Missing required form fields | Added Payment_Method, Shipping_Type, Season, Gender, Category initialization |

---

## Testing

To verify the fix works:

1. Start backend: `python backend/app.py`
2. Start frontend: `cd frontend && npm run dev`
3. Fill out customer form with all required fields
4. Submit form
5. Should see prediction and strategy results (no more 405 error)

**Expected Response from `/predict_and_strategy`:**
```json
{
  "prediction": {
    "segment_id": "...",
    "segment_name": "...",
    "likelihood": 0.85,
    ...
  },
  "strategy": {
    "recommended_actions": [...],
    "communication_frequency": "...",
    ...
  }
}
```

---

## Endpoints Actually Available

✓ POST `/predict` - Basic prediction
✓ POST `/predict_and_strategy` - Prediction + strategy (MAIN ENDPOINT NOW USED)
✓ POST `/predict_subscription` - Subscription probability
✓ POST `/predict_anomaly` - Anomaly detection
✓ POST `/predict_churn_clv_sentiment` - Multi-model prediction
✓ GET `/metadata/options` - Allowed categorical values
✓ GET `/affinities/products/matrix` - Product affinity matrix
✓ GET `/affinities/categories/matrix` - Category affinity matrix
✓ GET `/sentiment/overview` - Sentiment analysis overview
✓ GET `/health` - Health check
