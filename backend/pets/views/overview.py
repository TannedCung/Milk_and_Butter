from django.utils.timezone import now, timedelta
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import Pet, HealthStatus
from ..serializers.overview import HealthStatusOverviewSerializer

class DashboardOverviewView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, user):
        return HealthStatus.objects.filter(pet__owner=user)

    def get(self, request, *args, **kwargs):
        # Get the filter option from the query parameters
        filter_option = request.query_params.get('filter', 'all')  # default to 'all'
        
        # Fetch health status of user's pets
        queryset = self.get_queryset(request.user).order_by("measured_at")

        if filter_option == 'last7':
            queryset = queryset.filter(created_at__gte=now() - timedelta(days=7))
        elif filter_option == 'last30':
            queryset = queryset.filter(created_at__gte=now() - timedelta(days=30))

        grouped_data = {}
        
        # Group by pet and attribute_name
        for status in queryset:
            pet_id = status.pet.id
            if pet_id not in grouped_data:
                grouped_data[pet_id] = {"pet_name": status.pet.name}
            
            if status.attribute_name not in grouped_data[pet_id]:
                grouped_data[pet_id][status.attribute_name] = []

            grouped_data[pet_id][status.attribute_name].append({
                'id': status.id,
                'value': status.value,
                'created_at': status.created_at,
                'measured_at': status.measured_at,

            })

        return Response(grouped_data)

