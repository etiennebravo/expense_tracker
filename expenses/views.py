import json
from datetime import datetime
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.db.models import Sum
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.urls import reverse

from .models import User, PaymentMethod, Transaction

# Create your views here.
def index(request):
    if request.user.is_authenticated:
        return render(request, "expenses/index.html")
    else:
        return HttpResponseRedirect(reverse("login"))
    

@login_required
def register_method(request):

    """
    Handles the registration of a new payment method for a user.
    Args:
        request: HTTP request object
    Returns:
        JsonResponse indicating success or failure of the registration
    """

    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)
    
    try:
        user = get_object_or_404(User, pk=request.user.id)

        data = json.loads(request.body)
        method_name = data.get('methodName', '')
        method_type = data.get('methodType', '')
        method_processor = data.get('methodProcessor', '')

        method = PaymentMethod(userID=user, name=method_name, type=method_type, processor=method_processor)
        method.save()

        return JsonResponse({"message": "Method registered"}, status=201)
    
    except json.JSONDecodeError:
        return JsonResponse({"error", "Invalid JSON in request body"}, status=400)
    except IntegrityError:
        return JsonResponse({"error", "Payment method already exists"}, status=400)
    except User.DoesNotExist:
        return JsonResponse({"error", "User does not exist"}, status=404)
    

@login_required
def delete_method(request, method_id):
    
    """
    Deletes a payment method from a user's account.
    Args:
        request: HTTP request object
        method_id: ID of the payment method to be deleted
    Returns:
        JsonResponse indicating success or failure of the deletion
    """

    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    try:
        user = get_object_or_404(User, pk=request.user.id)
        method = get_object_or_404(PaymentMethod, pk=method_id)

        method.delete()

        return JsonResponse({"message": "Method deleted"}, status=201)
    
    except json.JSONDecodeError:
        return JsonResponse({"error", "Invalid JSON in request body"}, status=400)
    except User.DoesNotExist:
        return JsonResponse({"error", "User does not exist"}, status=404)
    except PaymentMethod.DoesNotExist:
        return JsonResponse({"error", "Method does not exist"}, status=404)


@login_required
def register_transaction(request):

    """
    Handles the registration of a new transaction for a user.
    Args:
        request: HTTP request object
    Returns:
        JsonResponse indicating success or failure of the registration
    """

    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    try:
        user = get_object_or_404(User, pk=request.user.id)

        data = json.loads(request.body)
        type = data.get('type', '')
        category = data.get('category', '')
        method = data.get('paymentMethod', '')
        amount = data.get('amount', '')
        repetition = data.get('repetition', '')

        paymentMethod = get_object_or_404(PaymentMethod, id=method)

        transaction = Transaction(userID=user, payment_methodID=paymentMethod,
                                transaction_type=type, category=category,
                                amount=amount, repeat_interval=repetition)
        transaction.save()

        return JsonResponse({"message": "Transaction registered"}, status=201)
    
    except json.JSONDecodeError:
        return JsonResponse({"error", "Invalid JSON in request body"}, status=400)
    except PaymentMethod.DoesNotExist:
        return JsonResponse({"error", "Payment method does not exist"}, status=404)
    except User.DoesNotExist:
        return JsonResponse({"error", "User does not exist"}, status=404)
    

@login_required
def delete_transaction(request, transaction_id):
    
    """
    Deletes a transaction from a user's account.
    Args:
        request: HTTP request object
        transaction_id: ID of the transaction to be deleted
    Returns:
        JsonResponse indicating success or failure of the deletion
    """

    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    try:
        user = get_object_or_404(User, pk=request.user.id)
        transaction = get_object_or_404(Transaction, pk=transaction_id)

        transaction.delete()

        return JsonResponse({"message": "Transaction deleted"}, status=201)
    
    except json.JSONDecodeError:
        return JsonResponse({"error", "Invalid JSON in request body"}, status=400)
    except User.DoesNotExist:
        return JsonResponse({"error", "User does not exist"}, status=404)
    except Transaction.DoesNotExist:
        return JsonResponse({"error", "Transaction does not exist"}, status=404)


@login_required
def user_summary(request):
    """
    Retrieves the summary of the user's financial status.
    Args:
        request: HTTP request object
    Returns:
        JsonResponse indicating success or failure of the retrieval of information
    """
    try:
        user = get_object_or_404(User, pk=request.user.id)

        current_date = datetime.now()
        income = Transaction.objects.filter(userID=user, date__year=current_date.year, 
                      date__month=current_date.month, transaction_type='income')
        weekly_expense = Transaction.objects.filter(userID=user, transaction_type='expense',
                                                    repeat_interval='weekly')
        monthly_expense = Transaction.objects.filter(userID=user, transaction_type='expense',
                                                     repeat_interval='monthly')
        variable_expense = Transaction.objects.filter(userID=user, date__year=current_date.year, 
                      date__month=current_date.month, transaction_type='expense', repeat_interval='none')
        
        income_amount = income.aggregate(total=Sum('amount'))['total']
        weekly_expense_amount = weekly_expense.aggregate(total=Sum('amount'))['total']
        monthly_expense_amount = monthly_expense.aggregate(total=Sum('amount'))['total']
        variable_expense_amount = variable_expense.aggregate(total=Sum('amount'))['total']

        if not income_amount:
            income_amount = 0

        if not variable_expense_amount:
            variable_expense_amount = 0
        
        if weekly_expense_amount and monthly_expense_amount:
            fixed_expense_amount = (weekly_expense_amount * 4) + monthly_expense_amount
        elif monthly_expense_amount:
            fixed_expense_amount = monthly_expense_amount
        elif weekly_expense_amount:
            fixed_expense_amount = weekly_expense_amount * 4
        else:
            fixed_expense_amount = 0

        expense_amount = fixed_expense_amount + variable_expense_amount
        
        if income_amount and expense_amount:
            balance = income_amount - expense_amount
        elif expense_amount:
            balance = -expense_amount
        elif income_amount:
            balance = income_amount
        else: 
            balance = 0

        # Calculate balance for each payment method
        payment_methods = PaymentMethod.objects.filter(userID=user)
        payment_method_balances = {}
        for method in payment_methods:
            method_income = Transaction.objects.filter(userID=user, payment_methodID=method, transaction_type='income').aggregate(total=Sum('amount'))['total'] or 0
            method_expense = Transaction.objects.filter(userID=user, payment_methodID=method, transaction_type='expense').aggregate(total=Sum('amount'))['total'] or 0
            payment_method_balances[method.name] = float(method_income - method_expense)

        summary = {
            'balance': float(balance),
            'income_amount': float(income_amount),
            'expense_amount': float(expense_amount),
            'fixed_expense_amount': float(fixed_expense_amount),
            'variable_expense_amount': float(variable_expense_amount),
            'payment_method_balances': payment_method_balances
        }

        return JsonResponse(summary, safe=False)

    except User.DoesNotExist:
        return JsonResponse({"error": "User does not exist"}, status=400)


@login_required
def list_all_transactions(request):
    
    """
    Lists all transactions from a user. This is used to provide options for the
    transaction form.
    Args:
        request: HTTP request object
    Returns:
        JsonResponse indicating success or failure of the retreival of information
    """

    try:
        user = get_object_or_404(User, pk=request.user.id)

        transaction_list = Transaction.objects.filter(userID=user).order_by('-date')

        serialized_list = []
        for transaction in transaction_list:
            serialized_transaction = transaction.serialize()
            serialized_list.append(serialized_transaction)

        return JsonResponse(serialized_list, safe=False)

    except json.JSONDecodeError:
        return JsonResponse({"error", "Invalid JSON in request body"}, status=400)
    except IntegrityError:
        return JsonResponse({"error", "Payment method already exists"}, status=400)
    except User.DoesNotExist:
        return JsonResponse({"error", "User does not exist"}, status=404)


@login_required
def list_methods(request):

    """
    Lists all payment methods from a user. This is used to provide options for the
    transaction form.
    Args:
        request: HTTP request object
    Returns:
        JsonResponse indicating success or failure of the retreival of information
    """

    try: 
        user = get_object_or_404(User, pk=request.user.id)

        method_list = PaymentMethod.objects.filter(userID=user)

        serialized_list = []
        for method in method_list:
            serialized_method = method.serialize()
            serialized_list.append(serialized_method)

        return JsonResponse(serialized_list, safe=False)
    
    except json.JSONDecodeError:
        return JsonResponse({"error", "Invalid JSON in request body"}, status=400)
    except User.DoesNotExist:
        return JsonResponse({"error", "User does not exist"}, status=404)
    

@login_required
def list_months(request):

    """
    Lists all months in which the user has transactions.
    Args:
        request: HTTP request object
    Returns:
        JsonResponse indicating success or failure of the retreival of information
    """
    
    try:
        user = get_object_or_404(User, pk=request.user.id)

        transaction_list = Transaction.objects.filter(userID=user).order_by('-date')

        months = []
        for transaction in transaction_list:
            month_year = {
                "month": transaction.date.strftime("%B"),
                "year": transaction.date.year
            }
            transaction.date.strftime("%B %Y")
            if month_year not in months:
                months.append(month_year)

        return JsonResponse(months, safe=False)

    except json.JSONDecodeError:
        return JsonResponse({"error", "Invalid JSON in request body"}, status=400)
    except User.DoesNotExist:
        return JsonResponse({"error", "User does not exist"}, status=404)
    

@login_required
def edit_transaction(request, transaction_id):
    
    """
    Edits an existing transaction.
    Args:
        request: HTTP request object
        transaction_id: ID of the transaction to be edited
    Returns:
        JsonResponse indicating success or failure of the edit
    """

    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    try:
        user = get_object_or_404(User, pk=request.user.id)
        transaction = get_object_or_404(Transaction, pk=transaction_id)

        data = json.loads(request.body)
        methodID = data.get('methodID', '')
        type = data.get('type', '')
        repeat_interval = data.get('repeat_interval', '')
        category = data.get('category', '')
        amount = data.get('amount', '')

        paymentMethod = get_object_or_404(PaymentMethod, id=methodID)

        transaction.transaction_type = type
        transaction.category = category
        transaction.payment_methodID = paymentMethod
        transaction.amount = amount
        transaction.repeat_interval = repeat_interval
        transaction.save()

        return JsonResponse({"message": "Transaction edited"}, status=201)
    
    except json.JSONDecodeError:
        return JsonResponse({"error", "Invalid JSON in request body"}, status=400)
    except PaymentMethod.DoesNotExist:
        return JsonResponse({"error", "Payment method does not exist"}, status=400)
    except User.DoesNotExist:
        return JsonResponse({"error", "User does not exist"}, status=404)
    except Transaction.DoesNotExist:
        return JsonResponse({"error", "Transaction does not exist"}, status=404)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]

         # Ensure the user filled form
        if username == '' or password == '':
            return render(request, "expenses/login.html", {
            "message": "Must fill all boxes."
        })

        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "expenses/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "expenses/login.html")
    

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]

        # Ensure the user filled form
        if username == '' or email == '' or password == '' or confirmation == '':
            return render(request, "expenses/register.html", {
            "message": "Must fill all boxes."
        })

        # Ensure password matches confirmation
        if password != confirmation:
            return render(request, "expenses/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "expenses/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "expenses/register.html")
