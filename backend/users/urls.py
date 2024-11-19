from django.urls import path
from knox import views as knox_views
from .views import RegisterAPI, UserCheckView, LoginAPI, CreateOrderView, fetch_orders, get_all_orders, process_pdf, update_order_status

urlpatterns = [
    path('api/register/', RegisterAPI.as_view(), name='register'),
    path('api/login/', LoginAPI.as_view(), name='login'),
    path('api/logout/', knox_views.LogoutView.as_view(), name='logout'),
    path('api/auth/user/', UserCheckView.as_view(), name='user-check'),
    path('api/orders/', CreateOrderView.as_view(), name='create_order'),
    path('api/fetch-orders/', fetch_orders, name='fetch_orders'),
    path('api/show-orders/', get_all_orders, name='get_all_orders'),
    path('api/process-pdf/', process_pdf, name='process_pdf'),
    path('api/update-order-status/<str:order_id>/', update_order_status, name='update_order_status'),

]