from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from customers.models import Customer
from .models import Loan
from .serializers import CustomerSerializer, LoanSerializer
from datetime import timedelta, date
from django.db.models.functions import TruncMonth
from django.db import models
from django.db.models import Avg, Sum, Count
from django.utils.timezone import now
from django.http import JsonResponse


@api_view(["POST"])
def register(request):
    data = request.data

    # Validate required fields
    required = ["first_name", "last_name", "phone_number", "monthly_salary"]
    for field in required:
        if field not in data or data[field] in [None, ""]:
            return Response({"error": f"Missing field: {field}"}, status=400)

    # Auto-generate customer_id
    last_customer = Customer.objects.order_by("-customer_id").first()
    new_customer_id = 1 if not last_customer else last_customer.customer_id + 1

    # Compute approved_limit = 36 × salary (rounded to nearest lakh)
    monthly_salary = float(data["monthly_salary"])
    approved_limit = round((36 * monthly_salary) / 100000) * 100000

    # Save to DB
    customer = Customer.objects.create(
        customer_id=new_customer_id,
        first_name=data["first_name"],
        last_name=data["last_name"],
        phone_number=data["phone_number"],
        monthly_salary=monthly_salary,
        approved_limit=approved_limit,
    )

    serializer = CustomerSerializer(customer)
    return Response(
        {
            "message": "Customer registered successfully",
            "customer": serializer.data,
        },
        status=201,
    )

# ---------- /check-eligibility ----------
@api_view(["POST"])
def check_eligibility(request):
    try:
        cust_id = request.data.get("customer_id")
        amount = float(request.data.get("loan_amount"))
        tenure = int(request.data.get("tenure"))

        customer = Customer.objects.get(customer_id=cust_id)

        # Basic credit score calculation
        on_time_rate = Loan.objects.filter(customer=customer).aggregate(
            avg_rate=models.Avg("emis_paid_on_time")
        )["avg_rate"] or 0

        score = 700  # baseline
        score += min(50, on_time_rate * 0.5)
        score -= min(100, customer.credit_utilization * 0.3)

        if score > 750 and amount <= customer.approved_limit:
            eligibility = True
            interest_rate = 10
        elif score > 650 and amount <= (0.7 * customer.approved_limit):
            eligibility = True
            interest_rate = 12
        else:
            eligibility = False
            interest_rate = 0

        return Response({
            "customer_id": cust_id,
            "eligibility": eligibility,
            "credit_score": round(score, 2),
            "proposed_interest_rate": interest_rate,
        })
    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

# ---------- /create-loan ----------

@api_view(["POST"])
def create_loan(request):
    try:
        cust_id = request.data.get("customer_id")
        amount = float(request.data.get("loan_amount"))
        tenure = int(request.data.get("tenure"))
        rate = float(request.data.get("interest_rate"))

        # ✅ Fetch customer
        customer = Customer.objects.get(customer_id=cust_id)

        # ✅ Calculate EMI
        monthly_interest = rate / 12 / 100
        emi = (amount * monthly_interest * (1 + monthly_interest) ** tenure) / (
            (1 + monthly_interest) ** tenure - 1
        )

        # ✅ Create loan automatically (no manual loan_id)
        loan = Loan.objects.create(
            customer=customer,
            loan_amount=amount,
            tenure=tenure,
            interest_rate=rate,
            monthly_repayment=emi,
            emis_paid_on_time=0,
            start_date=date.today(),
            end_date=date.today().replace(year=date.today().year + tenure // 12),
        )

        # ✅ Update customer debt
        customer.current_debt += amount
        customer.save()

        # ✅ Return serialized response
        return Response({
            "message": "Loan created successfully",
            "loan": LoanSerializer(loan).data
        }, status=201)

    except Customer.DoesNotExist:
        return Response({"error": "Customer not found."}, status=404)

    except Exception as e:
        return Response({"error": str(e)}, status=400)

# ---------- /view-loan/<id> ----------
@api_view(["GET"])
def view_loan(request, loan_id):
    try:
        loan = Loan.objects.get(loan_id=loan_id)
        return Response(LoanSerializer(loan).data)
    except Loan.DoesNotExist:
        return Response({"error": "Loan not found"}, status=404)

@api_view(["POST"])
def make_payment(request):
    try:
        loan_id = request.data.get("loan_id")
        amount = float(request.data.get("amount", 0))

        loan = Loan.objects.get(loan_id=loan_id)
        customer = loan.customer

        # Prevent overpayment
        if loan.fully_paid:
            return Response({"message": "Loan already fully paid."}, status=status.HTTP_400_BAD_REQUEST)

        loan.amount_paid += amount

        # Check if the loan is now fully paid
        if loan.amount_paid >= loan.loan_amount + (loan.loan_amount * loan.interest_rate / 100):
            loan.fully_paid = True
            customer.current_debt -= loan.loan_amount
            customer.save()

        loan.save()
        return Response({
            "message": "Payment recorded successfully.",
            "loan_id": loan_id,
            "amount_paid": loan.amount_paid,
            "fully_paid": loan.fully_paid
        }, status=200)

    except Loan.DoesNotExist:
        return Response({"error": "Loan not found."}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(["GET"])
def loan_history(request, customer_id):
    try:
        loans = Loan.objects.filter(customer_id=customer_id)
        if not loans.exists():
            return Response({"message": "No loans found for this customer."}, status=404)

        serializer = LoanSerializer(loans, many=True)
        total_loan_amount = sum(l.loan_amount for l in loans)
        total_paid = sum(l.amount_paid for l in loans)
        outstanding = total_loan_amount - total_paid

        return Response({
            "customer_id": customer_id,
            "total_loans": loans.count(),
            "total_loan_amount": total_loan_amount,
            "total_paid": total_paid,
            "outstanding": outstanding,
            "loans": serializer.data
        }, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
    
def dashboard_view(request):
    data = {
        "total_customers": Customer.objects.count(),
        "total_loans": Loan.objects.count(),
        "active_loans": Loan.objects.filter(end_date__gte="2025-01-01").count(),
        "average_interest_rate": round(Loan.objects.aggregate(avg=models.Avg("interest_rate"))["avg"] or 0, 2),
    }
    return JsonResponse(data)
    
@api_view(["GET"])
def dashboard_metrics(request):
    total_customers = Customer.objects.count()
    total_loans = Loan.objects.count()
    active_loans = Loan.objects.filter(fully_paid=False).count()
    fully_paid_loans = Loan.objects.filter(fully_paid=True).count()

    totals = Loan.objects.aggregate(
        total_principal_outstanding=Sum("loan_amount") - (Sum("amount_paid")),
        total_amount_paid=Sum("amount_paid"),
        avg_interest_rate=Avg("interest_rate"),
    )
    # avoid None
    for k in ["total_principal_outstanding", "total_amount_paid", "avg_interest_rate"]:
        totals[k] = float(totals[k] or 0)

    # average credit utilization across customers
    customers = Customer.objects.all()
    if customers:
        avg_util = sum(
            (c.current_debt / c.approved_limit) * 100 if c.approved_limit else 0
            for c in customers
        ) / customers.count()
    else:
        avg_util = 0.0

    top = (
        Customer.objects.order_by("-current_debt")
        .values("customer_id", "first_name", "last_name", "current_debt")[:10]
    )
    top_payload = [
        {
            "customer_id": r["customer_id"],
            "name": f'{r["first_name"]} {r["last_name"]}'.strip(),
            "current_debt": float(r["current_debt"] or 0),
        }
        for r in top
    ]

    return Response({
        "total_customers": total_customers,
        "total_loans": total_loans,
        "active_loans": active_loans,
        "fully_paid_loans": fully_paid_loans,
        "total_principal_outstanding": max(0.0, float(totals["total_principal_outstanding"])),
        "total_amount_paid": float(totals["total_amount_paid"]),
        "avg_interest_rate": float(totals["avg_interest_rate"]),
        "avg_credit_utilization": round(avg_util, 2),
        "top_customers_by_debt": top_payload,
    })

@api_view(["GET"])
def dashboard_timeseries(request):
    months = int(request.GET.get("months", 12))
    since = (date.today().replace(day=1) - timedelta(days=months * 31)).replace(day=1)

    qs = (
        Loan.objects.filter(start_date__gte=since)
        .annotate(month=TruncMonth("start_date"))
        .values("month")
        .annotate(
            loans_created=Count("loan_id"),
            amount_approved=Sum("loan_amount"),
        )
        .order_by("month")
    )
    payload = [
        {
            "month": v["month"].strftime("%Y-%m"),
            "loans_created": int(v["loans_created"] or 0),
            "amount_approved": float(v["amount_approved"] or 0),
        }
        for v in qs
    ]
    return Response(payload)

