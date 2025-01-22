from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API
    path("summary", views.user_summary, name="summary"),
    path("method", views.register_method, name="method"),
    path("list_methods", views.list_methods, name="list_methods"),
    path("list_months", views.list_months, name="list_months"),
    path("list_all_transactions", views.list_all_transactions, name="list_all_transactions"),
    path("register_transaction", views.register_transaction, name="register_transaction"),
    path("edit_transaction/<int:transaction_id>", views.edit_transaction, name="edit_transaction"),
    path("delete_transaction/<int:transaction_id>", views.delete_transaction, name="delete_transaction"),
    path("edit_method/<int:method_id>", views.edit_method, name="edit_method"),
    path("delete_method/<int:method_id>", views.delete_method, name="delete_method")
]