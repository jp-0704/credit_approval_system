from celery import shared_task
import pandas as pd
from datetime import datetime
from .models import Customer
from loans.models import Loan


@shared_task
def ingest_excel_data(customer_file_path, loan_file_path):
    """Background task to load Excel files into DB with flexible header mapping."""
    try:
        # Read Excel files
        customer_df = pd.read_excel(customer_file_path)
        loan_df = pd.read_excel(loan_file_path)

        # Normalize column names for matching
        customer_df.columns = customer_df.columns.str.strip().str.lower().str.replace(" ", "_")
        loan_df.columns = loan_df.columns.str.strip().str.lower().str.replace(" ", "_")

        # --- Debug: Print normalized columns ---
        print("Customer columns:", list(customer_df.columns))
        print("Loan columns:", list(loan_df.columns))

        # ✅ Ingest Customers
        for _, row in customer_df.iterrows():
            Customer.objects.update_or_create(
                customer_id=int(row["customer_id"]),
                defaults={
                    "first_name": str(row.get("first_name", "")),
                    "last_name": str(row.get("last_name", "")),
                    "phone_number": str(row.get("phone_number", "")),
                    "monthly_salary": float(row.get("monthly_salary", 0.0)),
                    "approved_limit": float(row.get("approved_limit", 0.0)),
                    
                },
            )

        # ✅ Ingest Loans
        for _, row in loan_df.iterrows():
            cust_id = int(row["customer_id"])
            loan_id = int(row["loan_id"])

            customer = Customer.objects.get(customer_id=cust_id)

            Loan.objects.update_or_create(
                loan_id=loan_id,
                defaults={
                    "customer": customer,
                    "loan_amount": float(row.get("loan_amount", 0.0)),
                    "tenure": int(row.get("tenure", 0)),
                    "interest_rate": float(row.get("interest_rate", 0.0)),
                    "monthly_repayment": float(row.get("monthly_payment", 0.0)),  # ✅ Fixed key
                    "emis_paid_on_time": int(row.get("emis_paid_on_time", 0)),
                    "start_date": pd.to_datetime(
                        row.get("date_of_approval", datetime.now())
                    ).date(),
                    "end_date": pd.to_datetime(
                        row.get("end_date", datetime.now())
                    ).date(),
                },
            )

        return "Data ingestion completed successfully."

    except Exception as e:
        return f"Data ingestion failed: {str(e)}"
