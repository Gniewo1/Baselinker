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
import re
import fitz
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from django.core.files.storage import default_storage

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
    api_key = '5009759-5035281-KH4J77RDHMWNLIG9FCTTTVUJNYMDTSXE9MXX42SXH978JTPH2DTLWOAN0PV63F4F'
    url = 'https://api.baselinker.com/connector.php'

    # Payload with the method to fetch orders
    payload = {
        'token': api_key,
        'method': 'getOrders',
    }

    # Nowe konto może mieć inne id
    status_mapping = {
        215951: "Nowe zamówienie",
        215952: "Do wysłania",
        215953: "Wysłane",
        215954: "Anulowane",
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
            order_status_id = order_data.get('order_status_id', None)
            order_status = status_mapping.get(order_status_id, "Unknown")
            total_cost = 0

            # Oblicza całość zapłaty
            for item in order_data['products']:
                price = item['price_brutto']*item['quantity']
                total_cost+=price

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
                    'total_cost_paid': order_data['payment_done'],
                    'currency': order_data['currency'],
                    'order_status': order_status, 
                    'items': [{
                        'product_id': item['product_id'],
                        'name': item['name'],
                        'price': item['price_brutto'],
                        'quantity': item['quantity'],
                    } for item in order_data['products']],
                    'total_cost' : total_cost
                }
            )
        
        return JsonResponse({"status": "success", "message": "Orders fetched and saved."})
    
    else:
        return JsonResponse({"status": "error", "message": f"Failed to fetch data: {response.status_code}"}, status=500)
    

def get_all_orders(request):
    orders = Order.objects.all().values()
    return JsonResponse(list(orders), safe=False)


def extract_text_from_pdf(pdf_path):
    with fitz.open(pdf_path) as pdf_file:
        text = ""
        for page_num in range(pdf_file.page_count):
            page = pdf_file[page_num]
            text += page.get_text()
    print(text)
    return text

def extract_DHL(text):
    match = re.search(r"(\d+,\d{2})\s*Razem: PLN:", text)
    match2 = re.search(r"Numer dokumentu:\s*(\S+)", text)
    if match:
        PLN =  match.group(1)
    else:
        PLN = "Not found"
    if match2:
        ID = match2.group(1)
    else:
        ID = "Not found"
    return PLN, ID

def extract_Fedex(text):
    match = re.search(r"(\d+,\d{2})\s*Do zapłaty:", text)
    match2 = re.search(r"Faktura do zestawienia zbiorczego nr\s+(\S+)", text)
    if match:
        PLN =  match.group(1)
    else:
        PLN = "Not found"
    if match2:
        ID = match2.group(1)
    else:
        ID = "Not found"
    return PLN, ID

def extract_GLS(text):
    match = re.search(r"(\d+,\d{2})\s*Kwota należności ogółem:", text)
    match2 = re.search(
    r"oraz numer Klienta widoczny na fakturze\.\s*(\d+)", 
    text
)
    if match:
        PLN =  match.group(1)
    else:
        PLN = "Not found"
    if match2:
        ID = match2.group(1)
    else:
        ID = "Not found"
    return PLN, ID

def extract_UPS(text):
    match = re.search(r"Razem wartość brutto do zapłaty\s+PLN\s+(\d+,\d+)", text)
    match2 = re.search(r"Nr dokumentu:\s*(\d+)", text)
    if match:
        PLN =  match.group(1)
    else:
        PLN = "Not found"
    if match2:
        ID = match2.group(1)
    else:
        ID = "Not found"
    return PLN, ID



@csrf_exempt
def process_pdf(request):
    if request.method == 'POST' and request.FILES.get('pdf'):
        pdf_file = request.FILES['pdf']
        path = default_storage.save('tmp/' + pdf_file.name, pdf_file)
        text = extract_text_from_pdf(path)
        choice = request.POST.get('choice')
        if not choice:
            return JsonResponse({'error': 'Choice parameter is missing'}, status=400)
        match choice:
            case "DHL":
                amount = extract_DHL(text)
            case "Fedex":
                amount = extract_Fedex(text)
            case "GLS":
                amount = extract_GLS(text)
            case "UPS":
                amount = extract_UPS(text)
        
        return JsonResponse({'text': text, 'amount': amount})

    return JsonResponse({'error': 'Invalid request'}, status=400)


@api_view(['PUT'])
def update_order_status(request, order_id):
    api_key = '5009759-5035281-KH4J77RDHMWNLIG9FCTTTVUJNYMDTSXE9MXX42SXH978JTPH2DTLWOAN0PV63F4F'
    url = 'https://api.baselinker.com/connector.php'
    try:
        order = Order.objects.get(order_id=order_id)
        new_status = request.data.get('order_status')

        if new_status:
            order.order_status = new_status
            order.save()

            match new_status:
                case "Nowe zamówienie":
                    status_id = 215951
                case "Do wysłania":
                    status_id = 215952
                case "Wysłane":
                    status_id = 215953
                case "Anulowane":
                    status_id = 215954
            headers = {
                    "X-BLToken": api_key
                }
                # Use data instead of json for form data
            payload = {
                    "method": "setOrderStatus",
                    "parameters": f'{{"order_id": "{order_id}", "status_id": "{status_id}"}}'
            }

            response = requests.post(url, headers=headers, data=payload)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'SUCCESS':
                    print(f"Order status updated successfully for order ID: {order_id}")
                else:
                    print(f"Failed to update order status. Error: {data.get('error_message')}")
            else:
                print(f"HTTP Error: {response.status_code}")
            return Response({'message': 'Order status updated successfully.'}, status=200)
        else:
            return Response({'error': 'Order status not provided.'}, status=400)

    except Order.DoesNotExist:
        return Response({'error': 'Order not found.'}, status=404)