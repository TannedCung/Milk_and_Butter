from django.db import models
from django.contrib.auth.models import User

from django.db import models
from django.utils import timezone

class Owner(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  # Link to the User model
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Pet(models.Model):
    name = models.CharField(max_length=255)
    species = models.CharField(max_length=100)  # Allow flexible species names
    avatar = models.ImageField(upload_to='pet_avatars/', null=True, blank=True)
    owner = models.ForeignKey(User, related_name='pets', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} ({self.species})"

class HealthStatus(models.Model):
    pet = models.ForeignKey(Pet, related_name='health_attributes', on_delete=models.CASCADE)
    attribute_name = models.CharField(max_length=100)
    value = models.FloatField()
    unit = models.CharField(max_length=20, blank=True, null=True)  # New unit field
    created_at = models.DateTimeField(auto_now_add=True)
    measured_at = models.DateTimeField(default=timezone.now)  # New measured_at field, defaults to now

    def __str__(self):
        return f"{self.attribute_name} for {self.pet.name}"
