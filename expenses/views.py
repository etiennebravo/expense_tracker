import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
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
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    user = get_object_or_404(User, pk=request.user.id)

    data = json.loads(request.body)
    method_name = data.get('name', '')
    method_type = data.get('type', '')
    method_processor = data.get('processor', '')

    method = PaymentMethod(userID=user, name=method_name, type=method_type, processor=method_processor)
    method.save()

    return JsonResponse({"message": "Method registered"}, status=201)


@login_required
def register_transaction(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    user = get_object_or_404(User, pk=request.user.id)

    data = json.loads(request.body)
    type = data.get('type', '')
    category = data.get('category', '')
    method = data.get('paymentMethod', '')
    amount = data.get('amount', '')
    repetition = data.get('repetition', '')

    paymentMethod = PaymentMethod.objects.get(id=method)

    transaction = Transaction(userID=user, payment_methodID=paymentMethod,
                              transaction_type=type, category=category,
                              amount=amount, repeat_interval=repetition)
    transaction.save()

    return JsonResponse({"message": "Method registered"}, status=201)


@login_required
def list_methods(request):
    user = get_object_or_404(User, pk=request.user.id)

    method_list = PaymentMethod.objects.filter(userID=user)

    serialized_list = []
    for method in method_list:
        serialized_method = method.serialize()
        serialized_list.append(serialized_method)

    return JsonResponse(serialized_list, safe=False)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
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

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
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
