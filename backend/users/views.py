from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from .serializers import RegisterSerializer, OrderSerializer
from rest_framework.authtoken.serializers import AuthTokenSerializer
from knox.views import LoginView as KnoxLoginView
from django.contrib.auth import login
import requests
from .models import Order
from datetime import datetime
from django.http import JsonResponse

class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": {
                "username": user.username,
                "email": user.email
            }
        })
    
class LoginAPI(KnoxLoginView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        serializer = AuthTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return super(LoginAPI, self).post(request, format=None)
    
class UserCheckView(APIView):
    permission_classes = [IsAuthenticated]  # Only allow authenticated users

    def get(self, request):
        user = request.user
        return Response({
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        })
    
class CreateOrderView(APIView):
    def post(self, request):
        data = request.data
        serializer = OrderSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
def fetch_orders(request):
    # API key and endpoint
    api_key = '5006320-5022781-0YBPKCB5LX5JX6WFCCD9U9WN12ORNTVRASTWJNXYLUXRJIGI49PQ8G7URZZ1DDKL'
    url = 'https://api.baselinker.com/connector.php'

    # Payload with the method to fetch orders
    payload = {
        'token': api_key,
        'method': 'getOrders',
    }

    # Send POST request to Baselinker API
    response = requests.post(url, data=payload)
    
    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()
        print(data)
        # Loop over each order in the response and save it to the database
        for order_data in data.get('orders', []):
            unix_timestamp = order_data['date_add']

            Order.objects.update_or_create(
            order_id=order_data['order_id'],
            defaults={
                'order_date': datetime.fromtimestamp(unix_timestamp),
                'customer_name': order_data['user_login'],
                'customer_phone': order_data['phone'],
                'customer_email': order_data['email'],
                'shipping_address': order_data['delivery_address'],
                'shipping_city': order_data['delivery_city'],
                'shipping_postcode': order_data['delivery_postcode'],
                'shipping_country': order_data['delivery_country'],
                'payment_method': order_data['payment_method'],
                'total_amount': order_data['payment_done'],
                'currency': order_data['currency'],
                'items': [{
                    'product_id': item['product_id'],
                    'name': item['name'],
                    'price': item['price_brutto'],
                    'quantity': item['quantity'],
                    } for item in order_data['products']]
                }
            )
        
        return JsonResponse({"status": "success", "message": "Orders fetched and saved."})
    
    else:
        return JsonResponse({"status": "error", "message": f"Failed to fetch data: {response.status_code}"}, status=500)
    

def get_all_orders(request):
    orders = Order.objects.all().values()
    return JsonResponse(list(orders), safe=False)