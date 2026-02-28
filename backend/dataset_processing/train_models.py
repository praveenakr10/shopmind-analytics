import pandas as pd
import numpy as np
import joblib
import os
import warnings

from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from xgboost import XGBClassifier, XGBRegressor

warnings.filterwarnings("ignore")


def train_models():
    """
    A script to train all advanced models and bundle them into a single artifact.
    """
    DATA_PATH = "dataset/shopping_trends.csv"
    MODEL_DIR = "final_models"
    os.makedirs(MODEL_DIR, exist_ok=True)

    print("--- Starting Model Training Pipeline ---")

    df = pd.read_csv(DATA_PATH)
    df = df.drop_duplicates().dropna()
    print(f"Data loaded. Shape: {df.shape}")


    print("Step 1: Performing Feature Engineering...")

    df["Discount_Flag"] = df["Discount Applied"].map({"Yes": 1, "No": 0})
    df["Discount_Sensitivity"] = df.groupby("Customer ID")["Discount_Flag"].transform("mean")

    df["F_score"] = pd.qcut(df["Previous Purchases"], 5,
                            labels=[1, 2, 3, 4, 5],
                            duplicates="drop").astype(int)

    df["M_score"] = pd.qcut(df["Purchase Amount (USD)"], 5,
                            labels=[1, 2, 3, 4, 5],
                            duplicates="drop").astype(int)

    freq_map = {
        "Weekly": 5, "Bi-Weekly": 4, "Fortnightly": 4, "Monthly": 3,
        "Quarterly": 2, "Annually": 1, "Every 3 Months": 2
    }

    df["R_score"] = df["Frequency of Purchases"].str.strip().map(freq_map).fillna(1).astype(int)
    df["RFM_Score"] = df["R_score"] + df["F_score"] + df["M_score"]

    threshold = df["Purchase Amount (USD)"].quantile(0.75)
    df["High_Value"] = (df["Purchase Amount (USD)"] > threshold).astype(int)


    print("Step 2: Training Subscription Model...")

    df["Subscription_enc"] = df["Subscription Status"].map({"Yes": 1, "No": 0})

    sub_features = [
        "Age", "Purchase Amount (USD)", "Review Rating",
        "Previous Purchases", "High_Value",
        "Discount_Flag", "Discount_Sensitivity",
        "F_score", "M_score", "R_score", "RFM_Score"
    ]

    scaler_sub = StandardScaler()
    X_sub_scaled = scaler_sub.fit_transform(df[sub_features])
    y_sub = df["Subscription_enc"]

    # Production-ready approach: Use scale_pos_weight for imbalanced classes.
    neg_count = y_sub.value_counts().get(0, 0)
    pos_count = y_sub.value_counts().get(1, 0)
    scale_pos_weight = neg_count / pos_count if pos_count > 0 else 1

    sub_model = XGBClassifier(
        n_estimators=200,
        random_state=42,
        eval_metric="logloss",
        scale_pos_weight=scale_pos_weight,
        use_label_encoder=False
    )
    sub_model.fit(X_sub_scaled, y_sub)

    
    print("Step 3: Training Anomaly Model...")

    anomaly_features = [
        "Purchase Amount (USD)", "Previous Purchases", "RFM_Score",
        "Discount_Sensitivity", "Review Rating"
    ]

    scaler_anom = StandardScaler()
    X_anom_scaled = scaler_anom.fit_transform(df[anomaly_features])

    iso_model = IsolationForest(
        contamination=0.05, n_estimators=300, random_state=42
    )
    iso_model.fit(X_anom_scaled)


    print("Step 4: Training CLV Model...")

    subscription_bonus = df["Subscription Status"].map({"Yes": 0.3, "No": 0.0})
    loyalty_multiplier = 1 + (df["RFM_Score"] / df["RFM_Score"].max())
    df["CLV"] = (df["Purchase Amount (USD)"] * df["Previous Purchases"] * (1 + subscription_bonus) * loyalty_multiplier) * 2
    df["CLV_log"] = np.log1p(df["CLV"])

    df_encoded = pd.get_dummies(df, columns=["Gender", "Category", "Season"], drop_first=True)

    adv_features = [
        "Age", "Previous Purchases", "Discount_Sensitivity", "RFM_Score"
    ] + [col for col in df_encoded.columns if col.startswith(("Gender_", "Category_", "Season_"))]

    scaler_adv = StandardScaler()
    X_adv_scaled = scaler_adv.fit_transform(df_encoded[adv_features])

    clv_model = XGBRegressor(
        n_estimators=300, max_depth=4, learning_rate=0.05, random_state=42
    )
    clv_model.fit(X_adv_scaled, df_encoded["CLV_log"])

    print("Step 5: Training Churn Model...")

    low_freq = df["Frequency of Purchases"].isin(["Quarterly", "Annually"])
    low_rfm = df["RFM_Score"] <= df["RFM_Score"].quantile(0.30)
    no_sub = df["Subscription Status"] == "No"
    low_rating = df["Review Rating"] <= 3
    no_promo = df["Promo Code Used"] == "No"
    df["Churn"] = ((low_freq & low_rfm) | (no_sub & low_rating & no_promo)).astype(int)


    predicted_clv = clv_model.predict(X_adv_scaled)
    X_churn_features = np.c_[X_adv_scaled, predicted_clv]

    churn_features_ordered = adv_features + ["Predicted_CLV"]
    y_churn = df["Churn"]

    churn_model = XGBClassifier(
        n_estimators=300, max_depth=4, learning_rate=0.05,
        random_state=42, eval_metric="logloss", use_label_encoder=False
    )
    churn_model.fit(X_churn_features, y_churn)

    
    print("Step 6: Training Sentiment Model...")

    df["Sentiment_Label"] = pd.cut(
        df["Review Rating"], bins=[0, 2.9, 3.9, 5], labels=[0, 1, 2]
    ).astype(int)

    sent_model = XGBClassifier(
        n_estimators=200, max_depth=4, learning_rate=0.05,
        random_state=42, eval_metric="mlogloss", use_label_encoder=False
    )
    # Fit on the original scaled advanced features (without predicted CLV)
    sent_model.fit(X_adv_scaled, df["Sentiment_Label"])

   
    print("Step 7: Bundling and saving all models...")

    model_bundle = {
        "subscription_model": sub_model,
        "subscription_scaler": scaler_sub,
        "subscription_features": sub_features,

        "anomaly_model": iso_model,
        "anomaly_scaler": scaler_anom,
        "anomaly_features": anomaly_features,

        "clv_model": clv_model,
        "churn_model": churn_model,
        "sentiment_model": sent_model,

        "advanced_scaler": scaler_adv,
        "advanced_features": adv_features,
        "churn_features_ordered": churn_features_ordered
    }

    save_path = os.path.join(MODEL_DIR, "advanced_models.pkl")
    joblib.dump(model_bundle, save_path)
    print(f"All models bundled and saved successfully to '{save_path}'")


if __name__ == "__main__":
    
    train_models()