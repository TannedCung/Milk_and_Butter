# backend/pets/serializers.py

from rest_framework import serializers
from ..models import Vaccination
from rest_framework import serializers
from django.contrib.auth.models import User

from rest_framework import serializers
from django.utils import timezone
from ..models import Owner, Pet, HealthStatus

class HealthStatusSerializer(serializers.ModelSerializer):
    pet_id = serializers.PrimaryKeyRelatedField(queryset=Pet.objects.all(), source='pet')
    measured_at = serializers.DateTimeField(required=False)  # Optional input for measured_at
    
    class Meta:
        model = HealthStatus
        fields = ['id', 'attribute_name', 'value', 'created_at', 'pet_id', 'measured_at', 'coat_condition', 'mood']

    def validate_measured_at(self, value):
        # If measured_at is not provided, default it to the current time
        return value or timezone.now()

class PetSerializer(serializers.ModelSerializer):
    health_attributes = HealthStatusSerializer(many=True, read_only=True)

    class Meta:
        model = Pet
        fields = ['id', 'name', 'species', 'avatar', 'health_attributes', 'microchip_number', 'medical_conditions', 'color', 'gender', 'date_of_birth']

class OwnerSerializer(serializers.ModelSerializer):
    pets = PetSerializer(many=True, read_only=True)

    class Meta:
        model = Owner
        fields = ['id', 'name', 'pets']  # Include necessary fields from User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )
        return user

class VaccinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vaccination
        fields = ['id', 'pet', 'vaccinated_at', 'schedule_at', 'vaccination_name', 'vaccination_status', 'vaccination_notes', 'tag_proof']