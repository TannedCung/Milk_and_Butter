from django.contrib import admin
from .models import Owner, Pet, HealthStatus

# Make sure to register the Owner model
admin.site.register(Owner)
admin.site.register(Pet)
admin.site.register(HealthStatus)
