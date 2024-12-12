from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API
    path("method", views.register_method, name="method"),
    path("list_methods", views.list_methods, name="list_methods"),
    path("register_transaction", views.register_transaction, name="register_transaction")
]