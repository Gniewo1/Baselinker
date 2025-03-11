from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    verified = models.BooleanField(default=False)


class Item:
    def __init__(self, product_id, product_name, price, quantity):
        self.product_id = product_id
        self.product_name = product_name
        self.price = price
        self.quantity = quantity

    def to_dict(self):
        return {
            "product_id": self.product_id,
            "product_name": self.product_name,
            "price": float(self.price),
            "quantity": self.quantity,
            "line_total": float(self.price) * self.quantity,
        }

class Order(models.Model):
    order_id = models.CharField(max_length=50, unique=True)
    order_date = models.DateTimeField()
    order_status = models.CharField(max_length=50)
    
    # Customer information
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Address information
    shipping_address = models.CharField(max_length=255)
    shipping_city = models.CharField(max_length=100)
    shipping_postcode = models.CharField(max_length=20)
    shipping_country = models.CharField(max_length=100)
    
    # Additional information
    payment_status = models.CharField(max_length=50)
    payment_method = models.CharField(max_length=50)
    total_cost_paid = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost= models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10)

    # Store list of items as JSON
    items = models.JSONField()
    
    def __str__(self):
        return f"Order {self.order_id} - {self.customer_name}"

    def add_item(self, item):
        # Adds an item to the order
        if not isinstance(item, Item):
            raise ValueError("item must be an instance of Item")
        
        item_data = item.to_dict()
        if not self.items:
            self.items = [item_data]
        else:
            self.items.append(item_data)
        
        # Update total_amount
        self.total_amount += item_data["line_total"]
        self.save()