from rest_framework import serializers
from customers.models import Customer
from loans.models import Loan

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["customer_id", "first_name", "last_name", "phone_number", "approved_limit", "monthly_salary"]

class LoanSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)  # 👈 include customer details

    class Meta:
        model = Loan
        fields = "__all__"