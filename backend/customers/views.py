# from django.shortcuts import render
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from .tasks import ingest_excel_data as ingest_excel_task
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .tasks import ingest_excel_data
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os

# @api_view(["POST"])
# def ingest_data(request):
#     """
#     Trigger Celery background task to load Excel files.
#     """
#     customer_file = request.data.get("customer_file", "customer_data.xlsx")
#     loan_file = request.data.get("loan_file", "loan_data.xlsx")

#     task = ingest_excel_data.delay(customer_file, loan_file)
#     return Response({"status": "Ingestion started", "task_id": task.id})


@csrf_exempt
def ingest_data_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method allowed"}, status=405)

    customer_file = request.FILES.get("customer_file")
    loan_file = request.FILES.get("loan_file")

    if not customer_file or not loan_file:
        return JsonResponse({"error": "Both files are required"}, status=400)

    # Save uploaded files to /app/data/
    import os
    from django.conf import settings
    os.makedirs("/app/data", exist_ok=True)

    customer_path = os.path.join("/app/data", customer_file.name)
    loan_path = os.path.join("/app/data", loan_file.name)

    with open(customer_path, "wb+") as dest:
        for chunk in customer_file.chunks():
            dest.write(chunk)

    with open(loan_path, "wb+") as dest:
        for chunk in loan_file.chunks():
            dest.write(chunk)

    # Send task to Celery
    ingest_excel_data.delay(customer_path, loan_path)
    return JsonResponse({"message": "Files uploaded and ingestion started."})