from django.contrib import admin
from .models import User, Transaction, PaymentMethod

# Register your models here.
admin.site.register(User)
admin.site.register(Transaction)
admin.site.register(PaymentMethod)