from django.db import models
from customers.models import Customer

class Loan(models.Model):
    loan_id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    loan_amount = models.FloatField()
    tenure = models.IntegerField()  # months
    interest_rate = models.FloatField()
    monthly_repayment = models.FloatField()
    emis_paid_on_time = models.IntegerField(default=0)
    start_date = models.DateField()
    end_date = models.DateField()
    amount_paid = models.FloatField(default=0.0)       # ✅ new
    fully_paid = models.BooleanField(default=False)    # ✅ new

    def __str__(self):
        return f"Loan {self.loan_id} for {self.customer.first_name}"

    @property
    def total_emis(self):
        return self.tenure

    @property
    def payment_ratio(self):
        """Proportion of EMIs paid on time."""
        return round((self.emis_paid_on_time / self.tenure) * 100, 2) if self.tenure else 0
