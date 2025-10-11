from django.contrib import admin
from django.urls import path
from loans import views
from django.http import JsonResponse
from loans.views import dashboard_view
from customers.views import ingest_data_view

def home(request):
    return JsonResponse({
        "message": "Credit Approval API is running 🚀",
        "available_endpoints": [
            "/register/",
            "/check-eligibility/",
            "/create-loan/",
            "/view-loan/<loan_id>/",
        ]
    })

urlpatterns = [
    path("", home), 
    path("admin/", admin.site.urls),

    path("register/", views.register),
    path("check-eligibility/", views.check_eligibility),
    path("create-loan/", views.create_loan),
    path("view-loan/<int:loan_id>/", views.view_loan),
    path("make-payment/", views.make_payment),                    
    path("loan-history/<int:customer_id>/", views.loan_history),

    # step 5
    path("dashboard/metrics", views.dashboard_metrics),
    path("dashboard/timeseries", views.dashboard_timeseries),

    path("dashboard/", dashboard_view, name="dashboard"),

    path("ingest-data/", ingest_data_view),  

]
