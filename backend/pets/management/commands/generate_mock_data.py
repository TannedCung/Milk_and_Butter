import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from pets.models import Pet, HealthStatus, Vaccination


class Command(BaseCommand):
    help = 'Generate mock data for pets with health tracking from 01/06/2024 to 28/06/2025'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-id',
            type=int,
            default=1,
            help='User ID to assign pets to (default: 1)'
        )

    def handle(self, *args, **options):
        user_id = options['user_id']
        
        # Check if user exists
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User with ID {user_id} does not exist. Please create a user first.')
            )
            return

        # Date range
        start_date = datetime(2024, 6, 1).date()
        end_date = datetime(2025, 6, 28).date()
        
        self.stdout.write(f'Generating mock data from {start_date} to {end_date}')
        
        # Create or get pets
        pet1 = self.create_or_get_pet(user, 3, "Milk", 2.6)
        pet2 = self.create_or_get_pet(user, 2, "Butter", 3.8)
        
        # Generate health data for both pets
        self.generate_health_data(pet1, start_date, end_date, base_weight=2.6)
        self.generate_health_data(pet2, start_date, end_date, base_weight=3.8)
        
        # Generate vaccination data
        self.generate_vaccination_data(pet1, start_date, end_date)
        self.generate_vaccination_data(pet2, start_date, end_date)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully generated mock data for pets {pet1.name} and {pet2.name}'
            )
        )

    def create_or_get_pet(self, user, pet_id, name, weight):
        """Create or get a pet with the specified ID"""
        pet, created = Pet.objects.get_or_create(
            id=pet_id,
            defaults={
                'name': name,
                'species': 'Cat',
                'owner': user,
                'date_of_birth': datetime(2021, 3, 15).date(),  # 3 years old
                'gender': random.choice(['Male', 'Female']),
                'color': random.choice(['Orange', 'Black', 'White', 'Gray', 'Tabby', 'Calico']),
                'medical_conditions': 'None',
                'microchip_number': f'CAT{pet_id:06d}'
            }
        )
        
        if created:
            self.stdout.write(f'Created pet: {pet.name} (ID: {pet.id})')
        else:
            self.stdout.write(f'Using existing pet: {pet.name} (ID: {pet.id})')
            
        return pet

    def generate_health_data(self, pet, start_date, end_date, base_weight):
        """Generate realistic health data for a pet"""
        current_date = start_date
        
        # Clear ALL existing health data for this pet (not just date range)
        deleted_count = HealthStatus.objects.filter(pet=pet).delete()[0]
        if deleted_count > 0:
            self.stdout.write(f'Cleared {deleted_count} existing health records for {pet.name}')
        
        # Weight tracking (varies slightly around base weight)
        weight_variance = base_weight * 0.1  # 10% variance
        current_weight = base_weight
        
        while current_date <= end_date:
            # Weight (daily, with gradual changes)
            weight_change = random.uniform(-0.05, 0.05)  # Daily change
            current_weight += weight_change
            current_weight = max(base_weight - weight_variance, 
                               min(base_weight + weight_variance, current_weight))
            
            self.create_health_record(pet, current_date, 'Weight', round(current_weight, 2), 'kg')
            
            # Water intake (daily)
            base_water = 200 if base_weight > 3.0 else 150  # ml per day
            water_intake = random.randint(base_water - 50, base_water + 100)
            self.create_health_record(pet, current_date, 'Water Intake', water_intake, 'ml')
            
            # Activity level (daily)
            # Cats are more active in evening/night
            base_activity = 120 if base_weight > 3.0 else 90  # minutes per day
            activity_level = random.randint(base_activity - 30, base_activity + 60)
            self.create_health_record(pet, current_date, 'Activity Level', activity_level, 'minutes')
            
            # Bowel movements (daily)
            bowel_movements = random.randint(1, 3)
            self.create_health_record(pet, current_date, 'Bowel Movements', bowel_movements, 'times')
            
            # Urination frequency (daily)
            urination = random.randint(2, 5)
            self.create_health_record(pet, current_date, 'Urination Frequency', urination, 'times')
            
            # Mood (daily)
            mood_choices = ['Normal', 'Lethargic', 'Hyperactive', 'Aggressive', 'Clingy']
            mood_weights = [0.7, 0.1, 0.1, 0.05, 0.05]  # Normal is most common
            mood = random.choices(mood_choices, weights=mood_weights)[0]
            
            HealthStatus.objects.create(
                pet=pet,
                attribute_name='Mood',
                measured_at=timezone.make_aware(
                    datetime.combine(current_date, datetime.min.time())
                ),
                mood=mood
            )
            
            # Coat condition (every 3 days)
            if (current_date - start_date).days % 3 == 0:
                coat_choices = ['Normal', 'Shedding', 'Hair Loss', 'Dry', 'Dull']
                coat_weights = [0.6, 0.25, 0.05, 0.05, 0.05]
                coat = random.choices(coat_choices, weights=coat_weights)[0]
                
                HealthStatus.objects.create(
                    pet=pet,
                    attribute_name='Coat Condition',
                    measured_at=timezone.make_aware(
                        datetime.combine(current_date, datetime.min.time())
                    ),
                    coat_condition=coat
                )
            
            # Length measurement (once a week)
            if (current_date - start_date).days % 7 == 0:
                base_length = 50 if base_weight > 3.0 else 45  # cm
                length_variance = random.uniform(-2, 2)
                length = round(base_length + length_variance, 1)
                self.create_health_record(pet, current_date, 'Length', length, 'cm')
            
            current_date += timedelta(days=1)
        
        self.stdout.write(f'Generated health data for {pet.name}')

    def create_health_record(self, pet, date, attribute, value, unit):
        """Helper method to create a health record"""
        HealthStatus.objects.create(
            pet=pet,
            attribute_name=attribute,
            value=value,
            unit=unit,
            measured_at=timezone.make_aware(
                datetime.combine(date, datetime.min.time())
            )
        )

    def generate_vaccination_data(self, pet, start_date, end_date):
        """Generate vaccination records for a pet"""
        # Clear ALL existing vaccination data for this pet
        deleted_count = Vaccination.objects.filter(pet=pet).delete()[0]
        if deleted_count > 0:
            self.stdout.write(f'Cleared {deleted_count} existing vaccination records for {pet.name}')
        
        # Common cat vaccinations
        vaccinations = [
            ('FVRCP', 'Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia'),
            ('Rabies', 'Rabies vaccine'),
            ('FeLV', 'Feline Leukemia'),
            ('FIV', 'Feline Immunodeficiency Virus'),
        ]
        
        for vaccine_code, vaccine_name in vaccinations:
            # Past vaccination (completed)
            past_date = start_date + timedelta(days=random.randint(30, 180))
            Vaccination.objects.create(
                pet=pet,
                vaccination_name=vaccine_name,
                vaccinated_at=past_date,
                schedule_at=past_date,
                vaccination_status='Completed',
                vaccination_notes=f'Annual {vaccine_code} vaccination completed successfully'
            )
            
            # Future vaccination (pending) - annual booster
            future_date = past_date + timedelta(days=365)
            if future_date <= end_date:
                Vaccination.objects.create(
                    pet=pet,
                    vaccination_name=f'{vaccine_name} (Booster)',
                    schedule_at=future_date,
                    vaccination_status='Pending',
                    vaccination_notes=f'Annual booster for {vaccine_code} due'
                )
        
        self.stdout.write(f'Generated vaccination data for {pet.name}') 