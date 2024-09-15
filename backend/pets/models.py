from django.db import models

class Owner(models.Model):
    name = models.CharField(max_length=255)

class Pet(models.Model):
    name = models.CharField(max_length=255)
    avatar = models.ImageField(upload_to='avatars/')
    species = models.CharField(max_length=50)
    owner = models.ForeignKey(Owner, related_name='pets', on_delete=models.CASCADE)

class HealthStatus(models.Model):
    pet = models.ForeignKey(Pet, related_name='health_statuses', on_delete=models.CASCADE)
    attribute = models.CharField(max_length=100)
    value = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
