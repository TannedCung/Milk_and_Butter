# pagination.py
from rest_framework.pagination import PageNumberPagination

class VaccinationPagination(PageNumberPagination):
    page_size = 5  # Set the default page size
    page_size_query_param = 'page_size'  # Allow the client to control the page size
    max_page_size = 20  # Set the maximum limit for page size

class HealthStatusPagination(PageNumberPagination):
    page_size = 10  # Set the default page size
    page_size_query_param = 'page_size'  # Allow the client to control the page size
    max_page_size = 50  # Set the maximum limit for page size
