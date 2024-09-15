from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Pet, HealthStatus, Owner


class HealthStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthStatus
        fields = ['id', 'attribute', 'value', 'created_at', 'pet']

class PetSerializer(serializers.ModelSerializer):
    health_statuses = HealthStatusSerializer(many=True, read_only=True)

    class Meta:
        model = Pet
        fields = ['id', 'name', 'avatar', 'species', 'owner', 'health_statuses']

class OwnerSerializer(serializers.ModelSerializer):
    pets = PetSerializer(many=True, read_only=True)

    class Meta:
        model = Owner
        fields = ['id', 'name', 'pets']

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


