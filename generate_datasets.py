"""
Digital Banking ETL Platform — Synthetic Dataset Generator
Generates 60 realistic banking CSV datasets across 6 categories:
  • Customers (10 files)
  • Transactions (15 files)
  • Branches (5 files)
  • Products (10 files)
  • Digital Channels (10 files)
  • Calendar (5 files)
  • Loan Applications (5 files - bonus)
"""

import pandas as pd
import numpy as np
import os
import random
from datetime import datetime, timedelta

# ── Seed for reproducibility ──────────────────────────────────────────────────
np.random.seed(42)
random.seed(42)

OUTPUT_DIR = r"c:\Users\sri27\Downloads\New folder\datasets"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Helper utilities ──────────────────────────────────────────────────────────
def rand_dates(start, end, n):
    delta = (end - start).days
    return [start + timedelta(days=random.randint(0, delta)) for _ in range(n)]

def rand_phone():
    return f"+1-{random.randint(200,999)}-{random.randint(100,999)}-{random.randint(1000,9999)}"

def rand_email(first, last):
    domains = ["gmail.com", "yahoo.com", "outlook.com", "bankmail.com", "hotmail.com"]
    return f"{first.lower()}.{last.lower()}{random.randint(1,99)}@{random.choice(domains)}"

def introduce_quality_issues(df, null_pct=0.04, dup_pct=0.02, ws_pct=0.01):
    """Inject realistic data quality issues: nulls, duplicates, whitespace."""
    df = df.copy()
    n = len(df)
    # Nulls
    for col in df.columns:
        if df[col].dtype == object:
            idx = np.random.choice(df.index, size=int(n * null_pct), replace=False)
            df.loc[idx, col] = np.nan
    # Duplicates
    dup_n = int(n * dup_pct)
    if dup_n > 0:
        dup_rows = df.sample(dup_n, random_state=1)
        df = pd.concat([df, dup_rows], ignore_index=True)
    # Whitespace
    for col in df.select_dtypes(include='object').columns:
        idx = np.random.choice(df.index, size=int(len(df) * ws_pct), replace=False)
        df.loc[idx, col] = df.loc[idx, col].apply(
            lambda x: f"  {x}  " if isinstance(x, str) else x
        )
    return df.sample(frac=1, random_state=42).reset_index(drop=True)

FIRST_NAMES = ["James","Mary","John","Patricia","Robert","Jennifer","Michael","Linda","William","Barbara",
               "David","Elizabeth","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Charles","Karen",
               "Christopher","Lisa","Daniel","Nancy","Matthew","Betty","Anthony","Margaret","Mark","Sandra",
               "Donald","Ashley","Steven","Dorothy","Paul","Kimberly","Andrew","Emily","Kenneth","Donna",
               "Joshua","Michelle","Kevin","Carol","Brian","Amanda","George","Melissa","Timothy","Deborah",
               "Ronald","Stephanie","Edward","Rebecca","Jason","Sharon","Jeffrey","Laura","Ryan","Cynthia"]

LAST_NAMES = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez",
              "Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin",
              "Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson",
              "Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores",
              "Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts"]

CITIES = ["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego",
          "Dallas","San Jose","Austin","Jacksonville","Fort Worth","Columbus","Charlotte","Indianapolis",
          "San Francisco","Seattle","Denver","Washington","Nashville","Oklahoma City","El Paso","Boston",
          "Portland","Las Vegas","Memphis","Louisville","Baltimore","Milwaukee","Albuquerque","Tucson"]

STATES = ["NY","CA","IL","TX","AZ","PA","TX","CA","TX","CA","TX","FL","TX","OH","NC","IN",
          "CA","WA","CO","DC","TN","OK","TX","MA","OR","NV","TN","KY","MD","WI","NM","AZ"]

COUNTRIES = ["USA"] * 80 + ["Canada"] * 10 + ["UK"] * 5 + ["Australia"] * 5

CHANNELS = ["Mobile App","Web Portal","ATM","Branch","Telephone Banking","SMS Banking","USSD","Chatbot"]
PRODUCT_TYPES = ["Savings Account","Checking Account","Credit Card","Personal Loan","Mortgage",
                 "Auto Loan","Investment Account","Fixed Deposit","Business Account","Insurance"]
BRANCHES_LIST = [f"Branch-{str(i).zfill(3)}" for i in range(1, 51)]
TRANSACTION_TYPES = ["Deposit","Withdrawal","Transfer","Payment","Purchase","Refund","Fee","Interest","Loan Disbursement","Investment"]
CURRENCIES = ["USD","USD","USD","USD","USD","EUR","GBP","CAD","AUD"]
SEGMENTS = ["Retail","Premium","Corporate","SME","Youth","Senior","Student","Private Banking"]
EMPLOYMENT = ["Employed","Self-Employed","Unemployed","Retired","Student","Part-Time"]
EDUCATION = ["High School","Associate","Bachelor","Master","PhD","Professional"]
CHANNEL_TYPES = ["iOS App","Android App","Web Browser","Desktop App","API Integration","Partner Portal"]
DEVICE_OS = ["iOS 17","iOS 16","Android 14","Android 13","Windows 11","macOS 14","Linux","ChromeOS"]

print("=" * 60)
print("  DIGITAL BANKING ETL PLATFORM — DATASET GENERATOR")
print("=" * 60)

# ══════════════════════════════════════════════════════════════
# CATEGORY 1: CUSTOMERS (10 files, varying sizes and regions)
# ══════════════════════════════════════════════════════════════
print("\n[1/7] Generating CUSTOMER datasets...")

customer_configs = [
    ("customers_retail_2023.csv",        3000, "Retail"),
    ("customers_premium_2023.csv",        800, "Premium"),
    ("customers_corporate_2023.csv",      500, "Corporate"),
    ("customers_sme_2023.csv",            600, "SME"),
    ("customers_youth_2024.csv",         1200, "Youth"),
    ("customers_senior_2024.csv",         700, "Senior"),
    ("customers_new_onboarding_Q1.csv",  1500, "Retail"),
    ("customers_new_onboarding_Q2.csv",  1800, "Retail"),
    ("customers_dormant_accounts.csv",    400, "All"),
    ("customers_international.csv",       300, "Premium"),
]

for fname, n, seg in customer_configs:
    first_names  = [random.choice(FIRST_NAMES) for _ in range(n)]
    last_names   = [random.choice(LAST_NAMES) for _ in range(n)]
    dob_dates    = rand_dates(datetime(1955,1,1), datetime(2004,12,31), n)
    open_dates   = rand_dates(datetime(2010,1,1), datetime(2024,12,31), n)
    
    df = pd.DataFrame({
        "customer_id":        [f"CUST{str(i).zfill(7)}" for i in range(1, n+1)],
        "first_name":         first_names,
        "last_name":          last_names,
        "email":              [rand_email(f, l) for f, l in zip(first_names, last_names)],
        "phone":              [rand_phone() for _ in range(n)],
        "date_of_birth":      [d.strftime("%Y-%m-%d") for d in dob_dates],
        "gender":             np.random.choice(["Male","Female","Non-Binary"], n, p=[0.49,0.49,0.02]),
        "marital_status":     np.random.choice(["Single","Married","Divorced","Widowed"], n, p=[0.35,0.50,0.10,0.05]),
        "nationality":        np.random.choice(COUNTRIES, n),
        "address_line1":      [f"{random.randint(1,9999)} {random.choice(['Main St','Oak Ave','Park Blvd','Elm Dr','Cedar Ln'])}" for _ in range(n)],
        "city":               [random.choice(CITIES) for _ in range(n)],
        "state":              [random.choice(STATES) for _ in range(n)],
        "zip_code":           [str(random.randint(10000,99999)) for _ in range(n)],
        "country":            ["USA"] * n,
        "segment":            seg if seg != "All" else np.random.choice(SEGMENTS, n),
        "customer_since":     [d.strftime("%Y-%m-%d") for d in open_dates],
        "employment_status":  np.random.choice(EMPLOYMENT, n),
        "education_level":    np.random.choice(EDUCATION, n),
        "annual_income":      np.round(np.random.lognormal(10.8, 0.6, n), 2),
        "credit_score":       np.random.randint(300, 850, n),
        "kyc_verified":       np.random.choice(["Yes","No","Pending"], n, p=[0.85,0.05,0.10]),
        "preferred_channel":  np.random.choice(CHANNELS, n),
        "nps_score":          np.random.choice(range(0,11), n),
        "churn_risk":         np.random.choice(["Low","Medium","High"], n, p=[0.65,0.25,0.10]),
        "is_active":          np.random.choice([True, False], n, p=[0.92, 0.08]),
    })
    df = introduce_quality_issues(df, null_pct=0.03, dup_pct=0.015)
    df.to_csv(os.path.join(OUTPUT_DIR, fname), index=False)
    print(f"  ✓ {fname:50s} {len(df):>6,} rows")

# ══════════════════════════════════════════════════════════════
# CATEGORY 2: TRANSACTIONS (15 files)
# ══════════════════════════════════════════════════════════════
print("\n[2/7] Generating TRANSACTION datasets...")

tx_configs = [
    ("transactions_retail_2023_Q1.csv",   8000, "2023-01-01", "2023-03-31"),
    ("transactions_retail_2023_Q2.csv",   9500, "2023-04-01", "2023-06-30"),
    ("transactions_retail_2023_Q3.csv",  10200, "2023-07-01", "2023-09-30"),
    ("transactions_retail_2023_Q4.csv",  11000, "2023-10-01", "2023-12-31"),
    ("transactions_retail_2024_Q1.csv",  12000, "2024-01-01", "2024-03-31"),
    ("transactions_premium_2023.csv",     5000, "2023-01-01", "2023-12-31"),
    ("transactions_premium_2024.csv",     6200, "2024-01-01", "2024-12-31"),
    ("transactions_corporate_2023.csv",   3000, "2023-01-01", "2023-12-31"),
    ("transactions_sme_2023.csv",         4500, "2023-01-01", "2023-12-31"),
    ("transactions_international_2023.csv",1500,"2023-01-01", "2023-12-31"),
    ("transactions_digital_mobile_2024.csv",7000,"2024-01-01","2024-12-31"),
    ("transactions_atm_2023.csv",         5500, "2023-01-01", "2023-12-31"),
    ("transactions_branch_2023.csv",      4000, "2023-01-01", "2023-12-31"),
    ("transactions_loans_2023.csv",       2000, "2023-01-01", "2023-12-31"),
    ("transactions_investments_2024.csv", 3000, "2024-01-01", "2024-12-31"),
]

for fname, n, start_str, end_str in tx_configs:
    start_dt = datetime.strptime(start_str, "%Y-%m-%d")
    end_dt   = datetime.strptime(end_str,   "%Y-%m-%d")
    tx_dates = rand_dates(start_dt, end_dt, n)
    
    amounts = np.where(
        np.random.rand(n) < 0.1,
        np.round(np.random.uniform(5000, 50000, n), 2),
        np.round(np.random.lognormal(4.5, 1.2, n), 2)
    )
    
    df = pd.DataFrame({
        "transaction_id":       [f"TXN{str(i).zfill(10)}" for i in range(1, n+1)],
        "customer_id":          [f"CUST{str(random.randint(1,10000)).zfill(7)}" for _ in range(n)],
        "account_id":           [f"ACC{str(random.randint(1,20000)).zfill(9)}" for _ in range(n)],
        "transaction_date":     [d.strftime("%Y-%m-%d") for d in tx_dates],
        "transaction_time":     [f"{random.randint(0,23):02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d}" for _ in range(n)],
        "transaction_type":     np.random.choice(TRANSACTION_TYPES, n),
        "amount":               amounts,
        "currency":             np.random.choice(CURRENCIES, n),
        "balance_after":        np.round(np.random.uniform(0, 100000, n), 2),
        "channel":              np.random.choice(CHANNELS, n),
        "branch_id":            np.random.choice(BRANCHES_LIST, n),
        "product_id":           [f"PROD{str(random.randint(1,100)).zfill(5)}" for _ in range(n)],
        "merchant_name":        np.random.choice(
            ["Amazon","Walmart","Apple","Google","Starbucks","Target","Netflix","Uber","Airbnb","PayPal",
             "Best Buy","Costco","Home Depot","CVS","Walgreens","Shell","ExxonMobil","McDonald's","Subway"],
            n
        ),
        "merchant_category":    np.random.choice(
            ["Retail","Food & Dining","Entertainment","Travel","Healthcare","Utilities","Education","Technology"],
            n
        ),
        "description":          np.random.choice(
            ["Online purchase","ATM withdrawal","Bill payment","Money transfer","Loan payment",
             "Interest credit","Salary deposit","Investment redemption","Insurance premium","Grocery shopping"],
            n
        ),
        "status":               np.random.choice(["Completed","Pending","Failed","Reversed"], n, p=[0.92,0.04,0.02,0.02]),
        "is_flagged":           np.random.choice([False, True], n, p=[0.97, 0.03]),
        "fraud_score":          np.round(np.random.uniform(0, 1, n), 4),
        "reference_number":     [f"REF{random.randint(100000000, 999999999)}" for _ in range(n)],
    })
    df = introduce_quality_issues(df, null_pct=0.025, dup_pct=0.018)
    df.to_csv(os.path.join(OUTPUT_DIR, fname), index=False)
    print(f"  ✓ {fname:55s} {len(df):>6,} rows")

# ══════════════════════════════════════════════════════════════
# CATEGORY 3: BRANCHES (5 files)
# ══════════════════════════════════════════════════════════════
print("\n[3/7] Generating BRANCH datasets...")

branch_files = [
    ("branches_master.csv",             50),
    ("branches_performance_2023.csv",    50),
    ("branches_performance_2024.csv",    50),
    ("branches_staff_2024.csv",         250),
    ("branches_atm_network.csv",        180),
]

for fname, n in branch_files:
    if "staff" in fname:
        df = pd.DataFrame({
            "staff_id":         [f"EMP{str(i).zfill(6)}" for i in range(1,n+1)],
            "branch_id":        np.random.choice(BRANCHES_LIST, n),
            "first_name":       [random.choice(FIRST_NAMES) for _ in range(n)],
            "last_name":        [random.choice(LAST_NAMES) for _ in range(n)],
            "role":             np.random.choice(["Teller","Manager","Loan Officer","Customer Service","Supervisor","Guard"], n),
            "hire_date":        [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2005,1,1), datetime(2024,1,1), n)],
            "salary":           np.round(np.random.uniform(35000, 120000, n), 2),
            "is_active":        np.random.choice([True,False], n, p=[0.95,0.05]),
        })
    elif "atm" in fname:
        df = pd.DataFrame({
            "atm_id":           [f"ATM{str(i).zfill(6)}" for i in range(1,n+1)],
            "branch_id":        np.random.choice(BRANCHES_LIST, n),
            "location":         [f"{random.choice(CITIES)}, {random.choice(STATES)}" for _ in range(n)],
            "atm_type":         np.random.choice(["Cash Dispenser","Full Function","Lobby","Drive-Through","Mobile ATM"], n),
            "manufacturer":     np.random.choice(["NCR","Diebold","Nautilus Hyosung","Hitachi","Triton"], n),
            "install_date":     [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2008,1,1), datetime(2023,1,1), n)],
            "daily_avg_txns":   np.random.randint(50, 500, n),
            "uptime_pct":       np.round(np.random.uniform(94, 99.9, n), 2),
            "last_service_date":[d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2024,1,1), datetime(2024,12,31), n)],
            "is_active":        np.random.choice([True,False], n, p=[0.93,0.07]),
        })
    elif "performance" in fname:
        year = "2023" if "2023" in fname else "2024"
        df = pd.DataFrame({
            "branch_id":            BRANCHES_LIST[:n],
            "branch_name":          [f"Digital Bank {c} Branch" for c in random.choices(CITIES, k=n)],
            "year":                 year,
            "total_transactions":   np.random.randint(5000, 80000, n),
            "total_revenue":        np.round(np.random.uniform(500000, 5000000, n), 2),
            "new_customers":        np.random.randint(100, 2000, n),
            "customer_satisfaction":np.round(np.random.uniform(3.0, 5.0, n), 2),
            "loan_disbursed":       np.round(np.random.uniform(1e6, 50e6, n), 2),
            "deposits_collected":   np.round(np.random.uniform(2e6, 100e6, n), 2),
            "nps_score":            np.random.randint(20, 80, n),
            "headcount":            np.random.randint(5, 60, n),
            "complaints_raised":    np.random.randint(0, 200, n),
            "complaints_resolved":  np.random.randint(0, 200, n),
        })
    else:  # master
        df = pd.DataFrame({
            "branch_id":        BRANCHES_LIST[:n],
            "branch_name":      [f"Digital Bank {c} Branch" for c in random.choices(CITIES, k=n)],
            "branch_type":      np.random.choice(["Full Service","Mini Branch","Digital Branch","Express","Flagship"], n),
            "city":             [random.choice(CITIES) for _ in range(n)],
            "state":            [random.choice(STATES) for _ in range(n)],
            "zip_code":         [str(random.randint(10000,99999)) for _ in range(n)],
            "phone":            [rand_phone() for _ in range(n)],
            "open_date":        [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(1990,1,1), datetime(2020,1,1), n)],
            "is_active":        np.random.choice([True,False], n, p=[0.94,0.06]),
            "has_atm":          np.random.choice([True,False], n, p=[0.85,0.15]),
            "manager_id":       [f"EMP{str(random.randint(1,250)).zfill(6)}" for _ in range(n)],
            "region":           np.random.choice(["Northeast","Southeast","Midwest","Southwest","West"], n),
        })
    df = introduce_quality_issues(df)
    df.to_csv(os.path.join(OUTPUT_DIR, fname), index=False)
    print(f"  ✓ {fname:50s} {len(df):>6,} rows")

# ══════════════════════════════════════════════════════════════
# CATEGORY 4: PRODUCTS (10 files)
# ══════════════════════════════════════════════════════════════
print("\n[4/7] Generating PRODUCT datasets...")

product_files = [
    ("products_master_catalog.csv",       100),
    ("products_savings_accounts.csv",     500),
    ("products_checking_accounts.csv",    600),
    ("products_credit_cards.csv",         800),
    ("products_loans_personal.csv",       400),
    ("products_loans_mortgage.csv",       300),
    ("products_investments.csv",          200),
    ("products_insurance.csv",            250),
    ("products_fixed_deposits.csv",       350),
    ("products_pricing_2024.csv",         100),
]

for fname, n in product_files:
    if "master_catalog" in fname or "pricing" in fname:
        df = pd.DataFrame({
            "product_id":       [f"PROD{str(i).zfill(5)}" for i in range(1,n+1)],
            "product_name":     [f"{random.choice(['Elite','Premier','Standard','Basic','Platinum','Gold','Silver','Diamond'])} {random.choice(PRODUCT_TYPES)}" for _ in range(n)],
            "product_type":     np.random.choice(PRODUCT_TYPES, n),
            "category":         np.random.choice(["Deposit","Credit","Investment","Insurance","Loan"], n),
            "interest_rate":    np.round(np.random.uniform(0.5, 18.5, n), 2),
            "annual_fee":       np.round(np.random.uniform(0, 500, n), 2),
            "min_balance":      np.round(np.random.uniform(0, 10000, n), 2),
            "max_credit_limit": np.round(np.random.choice([0, 5000, 10000, 25000, 50000, 100000], n), 2),
            "tenure_months":    np.random.choice([0, 6, 12, 24, 36, 60, 120, 240, 360], n),
            "is_active":        np.random.choice([True,False], n, p=[0.90,0.10]),
            "launch_date":      [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2005,1,1), datetime(2024,1,1), n)],
            "target_segment":   np.random.choice(SEGMENTS, n),
        })
    elif "credit_cards" in fname:
        df = pd.DataFrame({
            "card_id":          [f"CARD{str(i).zfill(8)}" for i in range(1,n+1)],
            "customer_id":      [f"CUST{str(random.randint(1,10000)).zfill(7)}" for _ in range(n)],
            "product_id":       [f"PROD{str(random.randint(1,100)).zfill(5)}" for _ in range(n)],
            "card_type":        np.random.choice(["Visa","Mastercard","Amex","Discover"], n),
            "credit_limit":     np.round(np.random.choice([1000,2500,5000,10000,25000,50000], n).astype(float), 2),
            "current_balance":  np.round(np.random.uniform(0, 25000, n), 2),
            "available_credit": np.round(np.random.uniform(0, 25000, n), 2),
            "payment_due_date": [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2024,1,1), datetime(2024,12,31), n)],
            "interest_rate":    np.round(np.random.uniform(12.99, 29.99, n), 2),
            "rewards_points":   np.random.randint(0, 100000, n),
            "status":           np.random.choice(["Active","Blocked","Expired","Cancelled"], n, p=[0.85,0.05,0.07,0.03]),
            "issued_date":      [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2018,1,1), datetime(2024,1,1), n)],
            "expiry_date":      [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2025,1,1), datetime(2030,1,1), n)],
        })
    elif "loans_personal" in fname:
        df = pd.DataFrame({
            "loan_id":           [f"LN{str(i).zfill(8)}" for i in range(1,n+1)],
            "customer_id":       [f"CUST{str(random.randint(1,10000)).zfill(7)}" for _ in range(n)],
            "loan_amount":       np.round(np.random.uniform(1000, 100000, n), 2),
            "outstanding_balance":np.round(np.random.uniform(0, 100000, n), 2),
            "interest_rate":     np.round(np.random.uniform(6.5, 24.0, n), 2),
            "tenure_months":     np.random.choice([12,24,36,48,60,84], n),
            "emi_amount":        np.round(np.random.uniform(500, 5000, n), 2),
            "disbursement_date": [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2020,1,1), datetime(2024,1,1), n)],
            "maturity_date":     [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2024,1,1), datetime(2030,1,1), n)],
            "loan_status":       np.random.choice(["Active","Closed","NPA","Written Off"], n, p=[0.70,0.22,0.06,0.02]),
            "purpose":           np.random.choice(["Home Renovation","Education","Medical","Travel","Debt Consolidation","Business"], n),
            "branch_id":         np.random.choice(BRANCHES_LIST, n),
            "credit_score_at_origination": np.random.randint(580, 850, n),
        })
    elif "mortgage" in fname:
        df = pd.DataFrame({
            "mortgage_id":       [f"MG{str(i).zfill(8)}" for i in range(1,n+1)],
            "customer_id":       [f"CUST{str(random.randint(1,10000)).zfill(7)}" for _ in range(n)],
            "property_value":    np.round(np.random.uniform(150000, 2000000, n), 2),
            "loan_amount":       np.round(np.random.uniform(100000, 1500000, n), 2),
            "down_payment":      np.round(np.random.uniform(20000, 400000, n), 2),
            "ltv_ratio":         np.round(np.random.uniform(0.60, 0.97, n), 4),
            "interest_rate":     np.round(np.random.uniform(3.5, 8.5, n), 3),
            "term_years":        np.random.choice([10,15,20,25,30], n),
            "monthly_payment":   np.round(np.random.uniform(800, 12000, n), 2),
            "origination_date":  [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2010,1,1), datetime(2024,1,1), n)],
            "property_city":     [random.choice(CITIES) for _ in range(n)],
            "property_state":    [random.choice(STATES) for _ in range(n)],
            "loan_type":         np.random.choice(["Fixed","ARM","FHA","VA","USDA"], n),
            "status":            np.random.choice(["Active","Paid Off","Foreclosure","Refinanced"], n, p=[0.72,0.20,0.04,0.04]),
        })
    else:  # savings, checking, investments, insurance, fixed_deposits
        category_map = {
            "savings":     "Savings Account",
            "checking":    "Checking Account",
            "investments": "Investment Account",
            "insurance":   "Insurance",
            "fixed":       "Fixed Deposit",
        }
        ptype = next((v for k,v in category_map.items() if k in fname), "Product")
        df = pd.DataFrame({
            "account_id":        [f"ACC{str(i).zfill(9)}" for i in range(1,n+1)],
            "customer_id":       [f"CUST{str(random.randint(1,10000)).zfill(7)}" for _ in range(n)],
            "product_id":        [f"PROD{str(random.randint(1,100)).zfill(5)}" for _ in range(n)],
            "product_type":      ptype,
            "account_number":    [str(random.randint(1000000000, 9999999999)) for _ in range(n)],
            "open_date":         [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2010,1,1), datetime(2024,1,1), n)],
            "current_balance":   np.round(np.random.lognormal(8.5, 1.5, n), 2),
            "interest_rate":     np.round(np.random.uniform(0.01, 8.0, n), 3),
            "currency":          np.random.choice(CURRENCIES, n),
            "branch_id":         np.random.choice(BRANCHES_LIST, n),
            "status":            np.random.choice(["Active","Dormant","Closed","Frozen"], n, p=[0.85,0.08,0.05,0.02]),
            "last_transaction":  [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2024,1,1), datetime(2024,12,31), n)],
        })
    df = introduce_quality_issues(df)
    df.to_csv(os.path.join(OUTPUT_DIR, fname), index=False)
    print(f"  ✓ {fname:50s} {len(df):>6,} rows")

# ══════════════════════════════════════════════════════════════
# CATEGORY 5: DIGITAL CHANNELS (10 files)
# ══════════════════════════════════════════════════════════════
print("\n[5/7] Generating DIGITAL CHANNEL datasets...")

channel_files = [
    ("digital_sessions_mobile_2023.csv",   6000),
    ("digital_sessions_web_2023.csv",      5000),
    ("digital_sessions_mobile_2024.csv",   8000),
    ("digital_sessions_web_2024.csv",      7000),
    ("digital_logins_all_2023.csv",        9000),
    ("digital_logins_all_2024.csv",       10000),
    ("digital_feature_usage_2024.csv",     4000),
    ("digital_errors_log_2024.csv",        2000),
    ("digital_onboarding_2024.csv",        1500),
    ("digital_support_tickets_2024.csv",   3000),
]

for fname, n in channel_files:
    if "sessions" in fname:
        channel = "Mobile App" if "mobile" in fname else "Web Portal"
        df = pd.DataFrame({
            "session_id":        [f"SES{str(i).zfill(10)}" for i in range(1,n+1)],
            "customer_id":       [f"CUST{str(random.randint(1,10000)).zfill(7)}" for _ in range(n)],
            "channel":           channel,
            "device_type":       np.random.choice(["Smartphone","Tablet","Desktop","Laptop"], n),
            "device_os":         np.random.choice(DEVICE_OS, n),
            "app_version":       np.random.choice(["5.1.0","5.2.1","5.3.0","6.0.0","6.1.2"], n),
            "session_start":     [d.strftime("%Y-%m-%d %H:%M:%S") for d in rand_dates(datetime(2024,1,1), datetime(2024,12,31), n)],
            "session_duration_s":np.random.randint(10, 3600, n),
            "pages_visited":     np.random.randint(1, 30, n),
            "transactions_done": np.random.randint(0, 10, n),
            "login_method":      np.random.choice(["Password","Biometric","OTP","PIN","Face ID"], n),
            "location_city":     [random.choice(CITIES) for _ in range(n)],
            "is_authenticated":  np.random.choice([True,False], n, p=[0.97,0.03]),
            "dropped_off":       np.random.choice([True,False], n, p=[0.15,0.85]),
        })
    elif "logins" in fname:
        df = pd.DataFrame({
            "login_id":          [f"LGN{str(i).zfill(10)}" for i in range(1,n+1)],
            "customer_id":       [f"CUST{str(random.randint(1,10000)).zfill(7)}" for _ in range(n)],
            "channel":           np.random.choice(CHANNELS, n),
            "login_timestamp":   [d.strftime("%Y-%m-%d %H:%M:%S") for d in rand_dates(datetime(2024,1,1), datetime(2024,12,31), n)],
            "login_method":      np.random.choice(["Password","Biometric","OTP","PIN","SSO"], n),
            "ip_address":        [f"{random.randint(1,254)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}" for _ in range(n)],
            "status":            np.random.choice(["Success","Failed","Locked","Timeout"], n, p=[0.92,0.05,0.02,0.01]),
            "failure_reason":    np.where(np.random.rand(n)<0.07, np.random.choice(["Wrong password","Account locked","Expired session"],n), None),
            "device_fingerprint":[f"FP{random.randint(1_000_000_000, 9_000_000_000)}" for _ in range(n)],
            "is_suspicious":     np.random.choice([False,True], n, p=[0.97,0.03]),
        })
    elif "feature_usage" in fname:
        df = pd.DataFrame({
            "usage_id":          [f"USG{str(i).zfill(9)}" for i in range(1,n+1)],
            "customer_id":       [f"CUST{str(random.randint(1,10000)).zfill(7)}" for _ in range(n)],
            "feature_name":      np.random.choice(
                ["Balance Check","Fund Transfer","Bill Payment","Statement Download","Loan Apply",
                 "FD Open","Card Block","PIN Change","Chatbot","Investment Buy","Rewards Redeem",
                 "Profile Update","Beneficiary Add","UPI Payment","QR Scan"], n
            ),
            "channel":           np.random.choice(CHANNELS, n),
            "timestamp":         [d.strftime("%Y-%m-%d %H:%M:%S") for d in rand_dates(datetime(2024,1,1), datetime(2024,12,31), n)],
            "completed":         np.random.choice([True,False], n, p=[0.88,0.12]),
            "time_taken_s":      np.random.randint(1, 300, n),
            "error_occurred":    np.random.choice([False,True], n, p=[0.90,0.10]),
        })
    elif "errors" in fname:
        df = pd.DataFrame({
            "error_id":          [f"ERR{str(i).zfill(8)}" for i in range(1,n+1)],
            "session_id":        [f"SES{str(random.randint(1,10000)).zfill(10)}" for _ in range(n)],
            "error_code":        np.random.choice(["404","500","503","401","403","422","408","502"], n),
            "error_message":     np.random.choice(
                ["Page not found","Internal server error","Service unavailable","Unauthorized",
                 "Forbidden","Validation error","Request timeout","Bad gateway"], n
            ),
            "channel":           np.random.choice(CHANNELS, n),
            "timestamp":         [d.strftime("%Y-%m-%d %H:%M:%S") for d in rand_dates(datetime(2024,1,1), datetime(2024,12,31), n)],
            "severity":          np.random.choice(["Critical","High","Medium","Low"], n, p=[0.05,0.20,0.45,0.30]),
            "resolved":          np.random.choice([True,False], n, p=[0.85,0.15]),
            "resolution_time_min":np.random.choice([None, 5, 15, 30, 60, 120, 240], n),
        })
    elif "onboarding" in fname:
        df = pd.DataFrame({
            "application_id":    [f"APP{str(i).zfill(8)}" for i in range(1,n+1)],
            "customer_id":       [f"CUST{str(random.randint(1,10000)).zfill(7)}" for _ in range(n)],
            "channel":           np.random.choice(CHANNELS, n),
            "start_date":        [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2024,1,1), datetime(2024,12,31), n)],
            "product_type":      np.random.choice(PRODUCT_TYPES, n),
            "step_reached":      np.random.choice(["Personal Info","KYC Upload","Video KYC","Review","Completed"], n),
            "is_completed":      np.random.choice([True,False], n, p=[0.68,0.32]),
            "drop_off_reason":   np.where(np.random.rand(n)<0.32, np.random.choice(["KYC failed","User abandoned","Tech error","Wrong info"],n), None),
            "kyc_method":        np.random.choice(["Aadhaar","Passport","Driving License","PAN","Voter ID"], n),
            "processing_time_h": np.round(np.random.uniform(0.1, 72, n), 2),
        })
    else:  # support_tickets
        df = pd.DataFrame({
            "ticket_id":         [f"TKT{str(i).zfill(8)}" for i in range(1,n+1)],
            "customer_id":       [f"CUST{str(random.randint(1,10000)).zfill(7)}" for _ in range(n)],
            "channel":           np.random.choice(CHANNELS, n),
            "created_date":      [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2024,1,1), datetime(2024,12,31), n)],
            "category":          np.random.choice(["Transaction Dispute","Login Issue","Card Block","Loan Query","General Enquiry","Fraud Report","Tech Issue"], n),
            "priority":          np.random.choice(["Low","Medium","High","Critical"], n, p=[0.30,0.45,0.20,0.05]),
            "status":            np.random.choice(["Open","In Progress","Resolved","Closed","Escalated"], n, p=[0.10,0.15,0.60,0.10,0.05]),
            "agent_id":          [f"AGT{str(random.randint(1,200)).zfill(5)}" for _ in range(n)],
            "resolution_hours":  np.round(np.random.lognormal(2, 1, n), 2),
            "satisfaction_score":np.random.choice(range(1,6), n, p=[0.05,0.08,0.15,0.32,0.40]),
            "first_contact_resolved": np.random.choice([True,False], n, p=[0.72,0.28]),
        })
    df = introduce_quality_issues(df)
    df.to_csv(os.path.join(OUTPUT_DIR, fname), index=False)
    print(f"  ✓ {fname:55s} {len(df):>6,} rows")

# ══════════════════════════════════════════════════════════════
# CATEGORY 6: CALENDAR (5 files)
# ══════════════════════════════════════════════════════════════
print("\n[6/7] Generating CALENDAR datasets...")

def build_calendar(start, end, fname):
    dates = pd.date_range(start, end, freq='D')
    df = pd.DataFrame({
        "date":           dates.strftime("%Y-%m-%d"),
        "day_of_week":    dates.day_name(),
        "day_number":     dates.day,
        "week_number":    dates.isocalendar().week.values,
        "month_number":   dates.month,
        "month_name":     dates.month_name(),
        "quarter":        dates.quarter,
        "year":           dates.year,
        "is_weekend":     dates.weekday >= 5,
        "is_bank_holiday":np.random.choice([False, True], len(dates), p=[0.97, 0.03]),
        "fiscal_year":    np.where(dates.month >= 4, dates.year, dates.year - 1),
        "fiscal_quarter": np.select(
            [dates.month.isin([4,5,6]), dates.month.isin([7,8,9]), dates.month.isin([10,11,12])],
            ["Q1","Q2","Q3"], "Q4"
        ),
        "season":         np.select(
            [dates.month.isin([12,1,2]), dates.month.isin([3,4,5]), dates.month.isin([6,7,8])],
            ["Winter","Spring","Summer"], "Fall"
        ),
    })
    df.to_csv(os.path.join(OUTPUT_DIR, fname), index=False)
    print(f"  ✓ {fname:50s} {len(df):>6,} rows")

build_calendar("2020-01-01", "2024-12-31", "calendar_master_2020_2024.csv")
build_calendar("2023-01-01", "2023-12-31", "calendar_2023.csv")
build_calendar("2024-01-01", "2024-12-31", "calendar_2024.csv")
build_calendar("2022-01-01", "2022-12-31", "calendar_2022.csv")
build_calendar("2021-01-01", "2021-12-31", "calendar_2021.csv")

# ══════════════════════════════════════════════════════════════
# CATEGORY 7: LOAN APPLICATIONS & RISK (5 files)
# ══════════════════════════════════════════════════════════════
print("\n[7/7] Generating LOAN / RISK datasets...")

loan_risk_files = [
    ("loan_applications_2023.csv",   1500),
    ("loan_applications_2024.csv",   2000),
    ("risk_credit_scoring_2024.csv", 5000),
    ("risk_fraud_alerts_2024.csv",   1000),
    ("aml_suspicious_activity_2024.csv", 500),
]

for fname, n in loan_risk_files:
    if "applications" in fname:
        df = pd.DataFrame({
            "application_id":   [f"LAPPL{str(i).zfill(8)}" for i in range(1,n+1)],
            "customer_id":      [f"CUST{str(random.randint(1,10000)).zfill(7)}" for _ in range(n)],
            "applied_date":     [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2023,1,1), datetime(2024,12,31), n)],
            "product_type":     np.random.choice(["Personal Loan","Mortgage","Auto Loan","Business Loan","Education Loan"], n),
            "requested_amount": np.round(np.random.uniform(5000, 500000, n), 2),
            "approved_amount":  np.round(np.random.uniform(0, 500000, n), 2),
            "interest_rate_offered": np.round(np.random.uniform(5.0, 24.0, n), 2),
            "tenure_months":    np.random.choice([12,24,36,48,60,84,120,240,360], n),
            "credit_score":     np.random.randint(300, 850, n),
            "debt_to_income":   np.round(np.random.uniform(0.05, 0.65, n), 4),
            "employment_status":np.random.choice(EMPLOYMENT, n),
            "annual_income":    np.round(np.random.lognormal(10.8, 0.6, n), 2),
            "collateral_value": np.round(np.random.uniform(0, 1000000, n), 2),
            "status":           np.random.choice(["Approved","Rejected","Pending","Conditionally Approved","Withdrawn"], n, p=[0.55,0.25,0.10,0.07,0.03]),
            "rejection_reason": np.where(np.random.rand(n)<0.25, np.random.choice(["Low credit score","High DTI","Insufficient income","No collateral","Incomplete docs"],n), None),
            "officer_id":       [f"OFF{str(random.randint(1,50)).zfill(4)}" for _ in range(n)],
            "branch_id":        np.random.choice(BRANCHES_LIST, n),
        })
    elif "credit_scoring" in fname:
        df = pd.DataFrame({
            "score_id":         [f"SCR{str(i).zfill(9)}" for i in range(1,n+1)],
            "customer_id":      [f"CUST{str(random.randint(1,10000)).zfill(7)}" for _ in range(n)],
            "score_date":       [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2024,1,1), datetime(2024,12,31), n)],
            "credit_score":     np.random.randint(300, 850, n),
            "score_band":       np.select(
                [np.random.randint(300,850,n)<580, np.random.randint(300,850,n)<670, np.random.randint(300,850,n)<740, np.random.randint(300,850,n)<800],
                ["Poor","Fair","Good","Very Good"], "Exceptional"
            ),
            "payment_history_score": np.round(np.random.uniform(0,100,n),2),
            "credit_utilization":   np.round(np.random.uniform(0,1,n),4),
            "credit_age_months":    np.random.randint(6,300,n),
            "total_accounts":       np.random.randint(1,20,n),
            "hard_inquiries_6m":    np.random.randint(0,10,n),
            "derogatory_marks":     np.random.randint(0,5,n),
            "model_version":        np.random.choice(["v2.3","v3.0","v3.1"], n),
            "pd_probability":       np.round(np.random.uniform(0,0.5,n),4),
            "lgd_estimate":         np.round(np.random.uniform(0,1,n),4),
        })
    elif "fraud_alerts" in fname:
        df = pd.DataFrame({
            "alert_id":         [f"ALT{str(i).zfill(8)}" for i in range(1,n+1)],
            "transaction_id":   [f"TXN{str(random.randint(1,100000)).zfill(10)}" for _ in range(n)],
            "customer_id":      [f"CUST{str(random.randint(1,10000)).zfill(7)}" for _ in range(n)],
            "alert_date":       [d.strftime("%Y-%m-%d %H:%M:%S") for d in rand_dates(datetime(2024,1,1), datetime(2024,12,31), n)],
            "alert_type":       np.random.choice(["Unusual Location","Large Amount","Multiple Failures","Card Not Present","Velocity Check","ATO Attempt"], n),
            "rule_triggered":   np.random.choice([f"RULE_{str(i).zfill(3)}" for i in range(1,50)], n),
            "fraud_score":      np.round(np.random.uniform(0.5, 1.0, n), 4),
            "amount":           np.round(np.random.uniform(100, 50000, n), 2),
            "is_confirmed_fraud":np.random.choice([False,True], n, p=[0.75,0.25]),
            "status":           np.random.choice(["Open","Investigating","Closed-Fraud","Closed-Legit"], n, p=[0.15,0.20,0.25,0.40]),
            "analyst_id":       [f"ANLST{str(random.randint(1,30)).zfill(4)}" for _ in range(n)],
        })
    else:  # AML
        df = pd.DataFrame({
            "case_id":           [f"AML{str(i).zfill(8)}" for i in range(1,n+1)],
            "customer_id":       [f"CUST{str(random.randint(1,10000)).zfill(7)}" for _ in range(n)],
            "detection_date":    [d.strftime("%Y-%m-%d") for d in rand_dates(datetime(2024,1,1), datetime(2024,12,31), n)],
            "activity_type":     np.random.choice(["Structuring","Layering","Integration","Smurfing","Rapid Movement"], n),
            "total_amount":      np.round(np.random.uniform(10000, 5000000, n), 2),
            "transaction_count": np.random.randint(5, 500, n),
            "risk_rating":       np.random.choice(["High","Very High","Critical"], n, p=[0.50,0.35,0.15]),
            "sar_filed":         np.random.choice([False,True], n, p=[0.60,0.40]),
            "investigation_status": np.random.choice(["Pending","Investigating","Reported","Closed"], n, p=[0.15,0.35,0.30,0.20]),
            "compliance_officer":[f"CO{str(random.randint(1,15)).zfill(3)}" for _ in range(n)],
        })
    df = introduce_quality_issues(df)
    df.to_csv(os.path.join(OUTPUT_DIR, fname), index=False)
    print(f"  ✓ {fname:55s} {len(df):>6,} rows")

# ══════════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════════
all_files = os.listdir(OUTPUT_DIR)
total_rows = 0
for f in sorted(all_files):
    fp = os.path.join(OUTPUT_DIR, f)
    try:
        rows = sum(1 for _ in open(fp)) - 1
        total_rows += rows
    except:
        pass

print("\n" + "=" * 60)
print(f"  GENERATION COMPLETE!")
print(f"  Total datasets : {len(all_files)}")
print(f"  Estimated total rows: ~{total_rows:,}")
print(f"  Output directory: {OUTPUT_DIR}")
print("=" * 60)
