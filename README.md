# ShopMind Analytics: Unlocking Shopper Behavior with ML and GenAI

## 1. Overview

ShopMind Analytics is a powerful e-commerce intelligence platform designed for the **Praxis 2.0 - GenAI + Machine Learning Innovation Showcase**. It addresses the challenge of understanding complex shopper behavior by integrating advanced machine learning for customer segmentation and Natural Language Processing (NLP) with Generative AI for deep, actionable insights.

Our platform empowers merchandising and marketing teams to move beyond raw data, providing clear, human-understandable explanations of customer affinities, purchasing patterns, and sentiment. By bridging the gap between quantitative analysis and qualitative reasoning, ShopMind Analytics helps businesses make smarter, data-driven decisions.

## 2. The Problem: Understanding the "Why" Behind the "What"

Online retailers have access to vast amounts of data, but understanding the underlying motivations of their customers remains a significant challenge. Shoppers exhibit complex behaviors influenced by a mix of preferences, values, timing, and price sensitivity.

The core problem is to design a shopper behavior analysis and segmentation framework that not only identifies *what* different customer groups are buying but also explains *why*, revealing deep-seated purchasing affinities and how these groups interact with products.

### Key Challenges:
*   Identifying meaningful, behavior-based customer segments.
*   Analyzing product and category attraction for each segment.
*   Predicting customer lifetime value, churn risk, and subscription likelihood.
*   Interpreting customer behavior to detect anomalies.
*   Translating complex analytical outputs into actionable insights for non-technical teams.

## 3. Our Solution: An Integrated ML and GenAI Framework

ShopMind Analytics provides a multi-layered solution that combines machine learning for pattern discovery with generative AI for explanation and insight generation.

### Our Approach

1.  **Customer Behavior Analysis & Prediction (The "Who"):**
    *   We use trained machine learning models to analyze customer behavior and make predictions:
        *   **Customer Segmentation:** We analyze purchasing patterns using RFM (Recency, Frequency, Monetary) scoring to create actionable, behavior-driven personas like "Premium Urgent Buyers," "Loyal Frequent Buyers," "Occasional Buyers," and "Discount-Driven Shoppers."
        *   **Subscription Prediction:** XGBoost Classifier predicts which customers are likely to subscribe based on their purchase behavior, frequency, and engagement metrics.
        *   **Churn Prediction:** XGBoost Classifier identifies customers at risk of churning based on low engagement, infrequent purchases, and negative sentiment.
        *   **Customer Lifetime Value (CLV):** XGBoost Regressor predicts the lifetime value of customers based on their purchase history and engagement patterns.
        *   **Anomaly Detection:** Isolation Forest identifies unusual purchasing patterns that may indicate fraud, exceptional high-value customers, or data quality issues.

2.  **Product Affinity & Sentiment Analysis (The "What" and "How they Feel"):**
    *   **Affinity Analysis:** For each segment, we analyze transaction data to determine which product categories they are most attracted to. This reveals cross-category purchasing habits and potential up-sell or cross-sell opportunities.
    *   **Sentiment Analysis:** XGBoost Classifier processes customer review ratings to predict sentiment (positive, negative, neutral) and identify key themes in customer feedback.

3.  **GenAI-Powered Insight Generation (The "Why"):**
    *   This is where our solution truly shines. The outputs from the ML models (customer segments, product affinities, sentiment scores, CLV predictions, churn risk) are fed into a **Generative AI model (powered by Hugging Face Llama 3.1)**.
    *   The GenAI acts as an expert analyst, synthesizing the data to generate clear, narrative-style reports. It explains the characteristics of each customer segment, describes their purchasing affinities, summarizes the sentiment from reviews, and provides actionable recommendations for marketing and merchandising teams.

## 4. Architecture

Our system is designed with a modular architecture to ensure scalability and clarity.

```
+----------------------+      +-------------------------+      +-------------------------+
|      Data Source     |----->|   Data Preprocessing    |----->|       ML Pipeline       |
| (Transactions,       |      |   (Cleaning, Feature    |      | (Segmentation,          |
|  Reviews, Customer   |      |    Engineering)         |      |  Predictions)           |
|  Data)               |      +-------------------------+      +-------------------------+
+----------------------+                                               |
                                                                       |
       +---------------------------------------------------------------+
       |
       v
+-------------------------+      +-------------------------+      +-------------------------+
|   GenAI Insight Engine  |<-----|     Analytics Store     |<-----|   (Segments,            |
|   (Llama 3.1 via HF)    |      |   (Processed Data &     |      |    CLV, Churn,          |
|                         |      |    ML Model Outputs)    |      |    Sentiment,           |
|                         |      |                         |      |    Affinities)          |
+-------------------------+      +-------------------------+      +-------------------------+
       |
       v
+-------------------------+
|  Frontend Dashboard     |
|  (React, Recharts)      |
|  - Segment Explorer     |
|  - Affinity Matrix      |
|  - ML Predictions       |
|  - GenAI-Powered Report |
+-------------------------+
```

1.  **Data Ingestion & Preprocessing:** Raw data (transactions, reviews) is cleaned, transformed, and prepared for modeling. Features for ML models are engineered using RFM analysis and behavioral metrics.
2.  **Machine Learning Pipeline:**
    *   **Customer Segmentation:** RFM-based segmentation creates behavior-driven customer personas.
    *   **Subscription Prediction:** XGBoost Classifier predicts subscription likelihood.
    *   **Churn Prediction:** XGBoost Classifier identifies customers at risk of churning.
    *   **CLV Prediction:** XGBoost Regressor estimates customer lifetime value.
    *   **Anomaly Detection:** Isolation Forest detects unusual purchasing patterns.
    *   **Sentiment Analysis:** XGBoost Classifier predicts sentiment from review ratings.
3.  **Analytics Store:** The processed data and model outputs (segment labels, affinity scores, sentiment data, predictions) are stored for easy access.
4.  **GenAI Insight Engine:** A backend service queries the analytics store and sends a structured prompt to the Hugging Face Llama 3.1 API. The prompt asks the model to analyze the data for a specific segment and generate a business-friendly report.
5.  **Frontend Dashboard:** A user-friendly interface built with React and Recharts visualizes the segments, product affinities, ML predictions, and displays the AI-generated narrative insights.

## 5. Key Features

*   **Interactive Customer Segment Explorer:** Visualize and filter customer segments based on behavioral metrics.
*   **Product Affinity Heatmaps:** Understand which product categories resonate most with each customer segment.
*   **Subscription Prediction:** Identify customers likely to subscribe to membership programs.
*   **Churn Risk Detection:** Identify and flag customers at risk of leaving.
*   **Customer Lifetime Value (CLV):** Predict the total revenue expected from each customer.
*   **Anomaly Detection:** Flag unusual purchasing patterns for review.
*   **Sentiment Trend Analysis:** Track customer sentiment across different products and categories.
*   **Automated Insight Reports:** Generate natural language reports that explain segment behavior, motivations, and provide actionable recommendations.

## 6. Technology Stack

*   **Backend:** Python, FastAPI, Pandas, Scikit-learn
*   **Frontend:** React, JavaScript, Recharts for visualizations
*   **Machine Learning:**
    *   Segmentation: RFM-based behavioral clustering
    *   Subscription Prediction: XGBoost Classifier
    *   Churn Prediction: XGBoost Classifier
    *   CLV Prediction: XGBoost Regressor
    *   Anomaly Detection: Isolation Forest
    *   Sentiment Analysis: XGBoost Classifier
*   **Generative AI:** Hugging Face Llama 3.1 (via Inference API)
*   **Data Storage:** CSV-based data files

## 7. Assumptions

*   The provided dataset is representative of the overall shopper population.
*   Customer IDs are consistent across transaction and review datasets, allowing for accurate linking of behavior and feedback.
*   Behavioral patterns identified in the historical data are likely to persist in the near future.
*   The sentiment expressed in reviews is a reliable proxy for a customer's broader opinion of a product.

## 8. ML + GenAI Integration: A Symbiotic Relationship

Our framework is built on the principle that ML and GenAI are more powerful together.

*   **ML provides the "what":** It excels at finding patterns, clustering data, and making predictions at scale. It identifies the customer segments, predicts subscription likelihood, estimates CLV, detects churn risk, identifies anomalies, and quantifies sentiment.
*   **GenAI provides the "so what":** It takes the structured output from the ML models and translates it into strategic insights. It answers questions like:
    *   *"What story does this data tell?"*
    *   *"Based on their high CLV but medium churn risk, what retention strategy should we use for the 'Premium Urgent Buyers' segment?"*
    *   *"Which customers with high subscription probability should we target for our membership campaign?"*
    *   *"Summarize the key complaints from negative reviews for our new product line."*

This integration transforms raw analytical output into a strategic tool that is accessible to everyone, from data scientists to marketing managers.

## 9. Ethical Considerations & Limitations

*   **Bias in Data:** The ML models could inadvertently reinforce existing biases present in the training data. For example, if historical marketing was targeted at a specific demographic, the model might over-represent that group in "high-value" segments. We acknowledge this and recommend periodic model audits.
*   **GenAI Hallucinations:** While powerful, generative models can sometimes produce plausible-sounding but incorrect information. The insights generated are intended as a starting point for human analysis, not as an infallible source of truth. All recommendations should be reviewed by a domain expert.
*   **Prototype Limitations:** The current prototype uses a static dataset. A production system would require a real-time data pipeline and continuous model retraining.

## 10. How to Run the Project Locally

### Prerequisites
*   Node.js (v18+)
*   Python (v3.9+)
*   An environment variable `HF_TOKEN` with a valid Hugging Face API token.

### Backend Setup
```
bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```
bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The application will be available.
