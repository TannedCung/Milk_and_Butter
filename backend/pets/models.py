from django.db import models
from django.contrib.auth.models import User
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
    vaccinated_at = models.DateField(null=True, blank=True)  # This will be None for upcoming vaccinations
    schedule_at = models.DateField(null=True, blank=True)  # Scheduled date for vaccination
    vaccination_name = models.CharField(max_length=100)
    vaccination_status = models.CharField(max_length=10, choices=[('Completed', 'Completed'), ('Pending', 'Pending'), ('Unknown', 'Unknown')])
    vaccination_notes = models.TextField(null=True, blank=True)
    tag_proof = models.ImageField(upload_to='tag_proof/', null=True, blank=True)

    def save(self, *args, **kwargs):
        # If schedule_at is not provided, set it to vaccinated_at for old vaccinations
        if self.schedule_at is None and self.vaccinated_at is not None:
            self.schedule_at = self.vaccinated_at
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.vaccination_name} for {self.pet.name} on {self.schedule_at}"

class HealthStatus(models.Model):
    ATTRIBUTE_CHOICES = [
        ('Weight', 'Weight (kg)'),
        ('Length', 'Length (cm)'),
        ('Water Intake', 'Water Intake (ml)'),
        ('Activity Level', 'Activity Level (minutes)'),
        ('Mood', 'Mood'),
        ('Bowel Movements', 'Bowel Movements (times)'),
        ('Urination Frequency', 'Urination Frequency (times)'),
        ('Coat Condition', 'Coat Condition')
    ]

    MOOD_CHOICES = [
        ('Normal', 'Normal'),
        ('Lethargic', 'Lethargic'),
        ('Hyperactive', 'Hyperactive'),
        ('Aggressive', 'Aggressive'),
        ('Clingy', 'Clingy')
    ]

    COAT_CONDITION_CHOICES = [
        ('Normal', 'Normal'),
        ('Shedding', 'Shedding'),
        ('Hair Loss', 'Hair Loss'),
        ('Dry', 'Dry'),
        ('Dull', 'Dull')
    ]

    pet = models.ForeignKey(Pet, related_name='health_attributes', on_delete=models.CASCADE)
    attribute_name = models.CharField(max_length=50, choices=ATTRIBUTE_CHOICES)
    value = models.FloatField(null=True, blank=True)  # For attributes with numeric values
    unit = models.CharField(max_length=20, blank=True, null=True)  # Unit of measurement
    created_at = models.DateTimeField(auto_now_add=True)
    measured_at = models.DateTimeField(default=timezone.now)  # Time of measurement

    # Additional fields for categorical data
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES, blank=True, null=True)
    coat_condition = models.CharField(max_length=20, choices=COAT_CONDITION_CHOICES, blank=True, null=True)

    def __str__(self):
        return f"{self.attribute_name} for {self.pet.name} on {self.measured_at.date()}"

    def save(self, *args, **kwargs):
        # Dynamically set the unit based on the attribute_name for numeric values
        if self.attribute_name == 'Weight':
            self.unit = 'kg'
        elif self.attribute_name == 'Water Intake':
            self.unit = 'ml'
        elif self.attribute_name == 'Activity Level':
            self.unit = 'minutes'
        super().save(*args, **kwargs)