from rest_framework import serializers

from .models import Pet, HealthStatus, Owner


from rest_framework import serializers
from .models import Owner, Pet, HealthStatus

class HealthStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthStatus
        fields = ['id', 'attribute_name', 'value', 'created_at']

class PetSerializer(serializers.ModelSerializer):
    health_attributes = HealthStatusSerializer(many=True, read_only=True)

    class Meta:
        model = Pet
        fields = ['id', 'name', 'species', 'avatar', 'health_attributes']

class OwnerSerializer(serializers.ModelSerializer):
    pets = PetSerializer(many=True, read_only=True)

    class Meta:
        model = Owner
        fields = ['id', 'name', 'pets']  # Include necessary fields from User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Owner
        fields = ['username', 'password', 'email']

    def create(self, validated_data):
        user = Owner.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )
        return user


