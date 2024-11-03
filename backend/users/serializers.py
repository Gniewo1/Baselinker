from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Order

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['order_id', 'order_date', 'order_status', 'customer_name', 'customer_email', 
                  'customer_phone', 'shipping_address', 'shipping_city', 'shipping_postcode', 
                  'shipping_country', 'payment_status', 'payment_method', 'total_amount', 
                  'currency', 'items']