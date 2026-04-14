import pandas as pd
import joblib
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler

# Load cleaned dataset
df = pd.read_csv("cleaned_cotton_jalana.csv")

print(f"📊 Training on {len(df)} samples")

# Feature engineering
df["Date"] = pd.to_datetime(df["Date"])
df["day"] = df["Date"].dt.day
df["month"] = df["Date"].dt.month
df["year"] = df["Date"].dt.year
df["weekday"] = df["Date"].dt.weekday
df["quarter"] = df["Date"].dt.quarter

# Multiple lag features (CRITICAL for time series)
df["prev_price_1"] = df["Modal Price"].shift(1)
df["prev_price_7"] = df["Modal Price"].shift(7)
df["prev_price_30"] = df["Modal Price"].shift(30)

# Rolling statistics
df["rolling_mean_7"] = df["Modal Price"].rolling(window=7).mean()
df["rolling_std_7"] = df["Modal Price"].rolling(window=7).std()
df["rolling_mean_30"] = df["Modal Price"].rolling(window=30).mean()

# Price change
df["price_change"] = df["Modal Price"].diff()

df = df.dropna()

X = df[[
    "day",
    "month",
    "year",
    "weekday",
    "quarter",
    "Arrival Quantity",
    "prev_price_1",
    "prev_price_7",
    "prev_price_30",
    "rolling_mean_7",
    "rolling_std_7",
    "rolling_mean_30",
    "price_change"
]]

y = df["Modal Price"]

# Train-test split (80-20, no shuffle for time series)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, shuffle=False
)

print(f"🔹 Training samples: {len(X_train)}")
print(f"🔹 Testing samples: {len(X_test)}")

# Scale
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train improved model
model = XGBRegressor(
    n_estimators=1000,
    learning_rate=0.01,
    max_depth=8,
    min_child_weight=3,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)

print("🔄 Training improved model...")
model.fit(X_train_scaled, y_train)

# Evaluate
preds = model.predict(X_test_scaled)
mae = mean_absolute_error(y_test, preds)
r2 = r2_score(y_test, preds)

print("\n" + "="*50)
print("📊 IMPROVED MODEL EVALUATION")
print("="*50)
print(f"MAE (Mean Absolute Error): ₹{mae:.2f}")
print(f"R² Score: {r2:.4f}")
print(f"Improvement: {((988.08 - mae) / 988.08 * 100):.1f}%")
print("="*50)

if mae < 100:
    print("✅ Model is EXCELLENT (MAE < 100)")
elif mae < 200:
    print("✅ Model is GOOD (MAE < 200)")
elif mae < 400:
    print("⚠️  Model is DECENT (MAE < 400)")
else:
    print("❌ Model still needs work (MAE > 400)")

# Save model
joblib.dump(model, "model.pkl")
joblib.dump(scaler, "scaler.pkl")

print("\n✅ Improved model and scaler saved!")
