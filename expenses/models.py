from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.
class User(AbstractUser):
    pass


class PaymentMethod(models.Model):
    METHOD_TYPES = [
        ('cash', 'Cash'),
        ('credit', 'Credit'),
        ('debit', 'Debit')
    ]

    CARD_PROCESSORS = [
        ('none', 'None'),
        ('visa', 'VISA'),
        ('mastercard', 'Mastercard'),
        ('am', 'American Express'),
        ('discovery', 'Discovery')
    ]

    userID = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50, choices=METHOD_TYPES)
    processor = models.CharField(max_length=100, choices=CARD_PROCESSORS)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['userID', 'name'], name='unique_payment_method_per_user')
        ]

    def __str__(self):
        return self.name
    
    def serialize(self):
        return {
            'id': self.id,
            'name' : self.name
        }
    

@receiver(post_save, sender=User) 
def create_default_payment_method(sender, instance, created, **kwargs):
    if created:
        PaymentMethod.objects.create( userID=instance,
                                      name='Cash',
                                      type='cash',
                                      processor='none')


class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    CATEGORIES = [
        ('groceries', 'Groceries'),
        ('entertainment', 'Entertainment'),
        ('gas', 'Gas'),
        ('other', 'Other')
        # Add more categories as needed
    ]
    
    TIME_INTERVALS = [
        ('none', 'One Time'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly')
    ]

    userID = models.ForeignKey(User, on_delete=models.CASCADE)
    payment_methodID = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True, blank=True)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    category = models.CharField(max_length=50, choices=CATEGORIES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    repeat_interval = models.CharField(max_length=10, choices=TIME_INTERVALS, default='none')

    def __str__(self):
        return f'{self.transaction_type} - {self.amount} USD'

    def serialize(self):
        return {
            "userID": self.userID,
            "methodID": self.payment_methodID,
            "type": self.transaction_type,
            "category": self.category,
            "amount": self.amount,
            "date": self.date,
            "repeat_interval": self.repeat_interval
        }
