from rest_framework import serializers
from ..models import HealthStatus

class HealthStatusOverviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthStatus
        fields = ['attribute_name', 'value', 'created_at']
