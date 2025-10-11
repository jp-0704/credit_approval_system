from django.urls import path
from . import views

urlpatterns = [
    path("ingest-data/", views.ingest_data_view, name="ingest-data"),
]
