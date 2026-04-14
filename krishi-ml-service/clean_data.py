import pandas as pd

# Load dataset
df = pd.read_csv("market_data.csv")

print(f"📊 Total rows: {len(df)}")
print(f"📋 Columns: {df.columns.tolist()}")

# Filter commodity and location (adjust based on your data)
df = df[
    (df["Commodity"] == "Cotton") &
    (df["District"] == "Jalana")
]

print(f"🔍 After filtering Cotton + Jalana: {len(df)} rows")

# Remove missing values
df = df.dropna(subset=["Modal_Price", "Arrival_Date"])

# Convert date
df["Date"] = pd.to_datetime(df["Arrival_Date"], format="%d/%m/%Y")
df = df.sort_values("Date")

# Rename columns for consistency
df = df.rename(columns={
    "Modal_Price": "Modal Price",
    "Min_Price": "Min Price",
    "Max_Price": "Max Price"
})

# Add arrival quantity (use 100 as default if not available)
df["Arrival Quantity"] = 100

# Save cleaned dataset
df.to_csv("cleaned_cotton_jalana.csv", index=False)

print(f"✅ Cleaned dataset ready: {len(df)} rows")
print(f"📅 Date range: {df['Date'].min()} to {df['Date'].max()}")
