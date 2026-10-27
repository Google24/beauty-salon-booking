# catalog/urls.py
from django.urls import path

from . import views

urlpatterns = [
    path('', views.product_list),
    path('1/', views.product_detail),
    path('2/', views.product_detail),
]