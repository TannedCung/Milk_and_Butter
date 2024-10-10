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
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Unknown', 'Unknown')])
    color = models.CharField(max_length=100, null=True, blank=True)
    medical_conditions = models.TextField(null=True, blank=True)
    microchip_number = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.species})"

class Vaccination(models.Model):
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE)
    vaccinated_at = models.DateField()
    vaccination_name = models.CharField(max_length=100)
    vaccination_status = models.CharField(max_length=10, choices=[('Completed', 'Completed'), ('Pending', 'Pending'), ('Unknown', 'Unknown')])
    vaccination_notes = models.TextField(null=True, blank=True)
    tag_proof = models.ImageField(upload_to='tag_proof/', null=True, blank=True)


class HealthStatus(models.Model):
    pet = models.ForeignKey(Pet, related_name='health_attributes', on_delete=models.CASCADE)
    attribute_name = models.CharField(max_length=100)
    value = models.FloatField()
    unit = models.CharField(max_length=20, blank=True, null=True)  # New unit field
    created_at = models.DateTimeField(auto_now_add=True)
    measured_at = models.DateTimeField(default=timezone.now)  # New measured_at field, defaults to now

    def __str__(self):
        return f"{self.attribute_name} for {self.pet.name}"
