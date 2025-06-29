#!/usr/bin/env python3
"""
Standalone Mock Data Generator for MilkandButter Pet Care App

This script generates comprehensive mock data for 2 cats (Pet IDs 1 & 2) 
from June 1, 2024 to June 28, 2025.

Usage:
1. As Django management command: python manage.py generate_mock_data
2. As standalone script: python generate_mock_data.py
3. With custom user: python manage.py generate_mock_data --user-id 2

Generated Data:
- Pet 1: "Milk" (2.6 kg cat)
- Pet 2: "Butter" (3.8 kg cat)
- Daily health tracking: weight, water intake, activity, mood, etc.
- Time-based weight and length measurements with realistic variance
- Vaccination records with completed and pending entries
- Realistic variance in all measurements over time
"""

import os
import sys
import random
from datetime import datetime, timedelta

# Add Django project to path if running standalone
if __name__ == '__main__':
    # Assuming this script is in the backend directory
    project_root = os.path.dirname(os.path.abspath(__file__))
    sys.path.append(project_root)
    
    # Setup Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    import django
    django.setup()

from django.contrib.auth.models import User
from django.utils import timezone
from pets.models import Pet, HealthStatus, Vaccination


class MockDataGenerator:
    """Generate realistic mock data for pet health tracking with time-based measurements"""
    
    def __init__(self, user_id=1):
        self.user_id = user_id
        self.start_date = datetime(2024, 6, 1).date()
        self.end_date = datetime(2025, 6, 28).date()
        
        # Pet configurations (matching the app name "MilkandButter")
        self.pets_config = [
            {
                'id': 3,
                'name': 'Milk',
                'weight': 2.6,
                'species': 'Cat',
                'gender': 'Female',
                'color': 'White with Gray patches',
                'microchip': 'CAT000001'
            },
            {
                'id': 2,
                'name': 'Butter',
                'weight': 3.8,
                'species': 'Cat',
                'gender': 'Male',
                'color': 'Golden Tabby',
                'microchip': 'CAT000002'
            }
        ]
    
    def run(self):
        """Main execution method"""
        print(f"🐾 Generating mock data from {self.start_date} to {self.end_date}")
        
        # Verify user exists
        try:
            user = User.objects.get(id=self.user_id)
            print(f"✅ Using user: {user.username} (ID: {user.id})")
        except User.DoesNotExist:
            print(f"❌ User with ID {self.user_id} not found!")
            print("Create a user first or specify a different user ID")
            return False
        
        pets = []
        for config in self.pets_config:
            pet = self.create_or_get_pet(user, config)
            pets.append(pet)
            
        # Generate data for each pet
        for pet, config in zip(pets, self.pets_config):
            print(f"\n📊 Generating time-based health data for {pet.name}...")
            self.generate_health_data(pet, config['weight'])
            
            print(f"💉 Generating vaccination data for {pet.name}...")
            self.generate_vaccination_data(pet)
        
        print(f"\n🎉 Successfully generated mock data for {len(pets)} pets!")
        self.print_summary(pets)
        return True
    
    def create_or_get_pet(self, user, config):
        """Create or update a pet with the given configuration"""
        pet, created = Pet.objects.get_or_create(
            id=config['id'],
            defaults={
                'name': config['name'],
                'species': config['species'],
                'owner': user,
                'date_of_birth': datetime(2021, 3, 15).date(),  # ~3 years old
                'gender': config['gender'],
                'color': config['color'],
                'medical_conditions': 'None',
                'microchip_number': config['microchip']
            }
        )
        
        if created:
            print(f"✨ Created new pet: {pet.name} (ID: {pet.id})")
        else:
            print(f"🔄 Using existing pet: {pet.name} (ID: {pet.id})")
            
        return pet
    
    def generate_health_data(self, pet, base_weight):
        """Generate comprehensive health tracking data with time-based weight and length measurements"""
        # Clear ALL existing health data for this pet (not just date range)
        deleted_count = HealthStatus.objects.filter(pet=pet).delete()[0]
        
        if deleted_count > 0:
            print(f"🧹 Cleared {deleted_count} existing health records")
        
        # Initialize tracking variables for time-based measurements
        current_date = self.start_date
        current_weight = base_weight
        weight_variance = base_weight * 0.1  # 10% variance allowed
        base_length = 48 + (base_weight - 2.5) * 3  # Larger cats are longer
        current_length = base_length
        
        records_created = 0
        weight_records = 0
        length_records = 0
        
        print(f"   📈 Starting weight: {current_weight:.2f} kg")
        print(f"   📏 Starting length: {current_length:.1f} cm")
        
        while current_date <= self.end_date:
            # === DAILY TIME-BASED MEASUREMENTS ===
            
            # Weight (daily with gradual realistic changes over time)
            # Simulate natural weight fluctuations - slight trends and daily variance
            seasonal_factor = 0.02 * random.sin((current_date - self.start_date).days * 0.017)  # ~yearly cycle
            daily_change = random.uniform(-0.03, 0.03)  # Small daily changes
            trend_change = seasonal_factor  # Seasonal weight changes
            
            current_weight += daily_change + trend_change
            current_weight = max(base_weight - weight_variance, 
                               min(base_weight + weight_variance, current_weight))
            
            # Random time of day for weight measurement (morning is most common)
            weight_hour = random.choices([7, 8, 9, 10, 18, 19], weights=[0.3, 0.4, 0.2, 0.05, 0.03, 0.02])[0]
            weight_minute = random.randint(0, 59)
            
            self.create_health_record_with_time(pet, current_date, 'Weight', 
                                              round(current_weight, 2), 'kg', 
                                              weight_hour, weight_minute)
            weight_records += 1
            
            # Water intake (cats need ~50ml per kg body weight)
            base_water = int(base_weight * 50)  # ml per day
            water_intake = random.randint(base_water - 30, base_water + 80)
            water_hour = random.randint(6, 22)  # Throughout the day
            self.create_health_record_with_time(pet, current_date, 'Water Intake', 
                                              water_intake, 'ml', water_hour, random.randint(0, 59))
            
            # Activity level (cats sleep 12-16 hours, active 2-4 hours)
            base_activity = int(120 + (base_weight - 2.5) * 10)  # Larger cats more active
            activity_level = random.randint(base_activity - 40, base_activity + 60)
            activity_hour = random.randint(18, 23)  # Cats more active at night
            self.create_health_record_with_time(pet, current_date, 'Activity Level', 
                                              activity_level, 'minutes', activity_hour, random.randint(0, 59))
            
            # Bowel movements (healthy cats: 1-2 times daily)
            bowel_movements = random.choices([1, 2, 3], weights=[0.4, 0.5, 0.1])[0]
            bowel_hour = random.randint(8, 20)
            self.create_health_record_with_time(pet, current_date, 'Bowel Movements', 
                                              bowel_movements, 'times', bowel_hour, random.randint(0, 59))
            
            # Urination frequency (healthy cats: 2-4 times daily)
            urination = random.choices([2, 3, 4, 5], weights=[0.3, 0.4, 0.25, 0.05])[0]
            urination_hour = random.randint(7, 21)
            self.create_health_record_with_time(pet, current_date, 'Urination Frequency', 
                                              urination, 'times', urination_hour, random.randint(0, 59))
            
            # Mood (daily tracking)
            mood_choices = ['Normal', 'Lethargic', 'Hyperactive', 'Aggressive', 'Clingy']
            mood_weights = [0.75, 0.1, 0.08, 0.03, 0.04]  # Mostly normal
            mood = random.choices(mood_choices, weights=mood_weights)[0]
            
            mood_hour = random.randint(9, 21)  # Observed during awake hours
            HealthStatus.objects.create(
                pet=pet,
                attribute_name='Mood',
                measured_at=timezone.make_aware(
                    datetime.combine(current_date, datetime.min.time().replace(
                        hour=mood_hour, minute=random.randint(0, 59)
                    ))
                ),
                mood=mood
            )
            
            records_created += 6  # 5 numeric + 1 mood
            
            # === PERIODIC TIME-BASED MEASUREMENTS ===
            
            # Coat condition (every 3 days)
            if (current_date - self.start_date).days % 3 == 0:
                coat_choices = ['Normal', 'Shedding', 'Hair Loss', 'Dry', 'Dull']
                coat_weights = [0.65, 0.25, 0.03, 0.04, 0.03]
                coat = random.choices(coat_choices, weights=coat_weights)[0]
                
                coat_hour = random.randint(10, 16)  # During grooming/inspection time
                HealthStatus.objects.create(
                    pet=pet,
                    attribute_name='Coat Condition',
                    measured_at=timezone.make_aware(
                        datetime.combine(current_date, datetime.min.time().replace(
                            hour=coat_hour, minute=random.randint(0, 59)
                        ))
                    ),
                    coat_condition=coat
                )
                records_created += 1
            
            # Length measurement (weekly with gradual growth/changes over time)
            if (current_date - self.start_date).days % 7 == 0:
                # Simulate very gradual length changes over time (cats grow slowly)
                age_factor = (current_date - self.start_date).days / 365.0  # Years passed
                growth_factor = age_factor * 0.5  # Very slow growth for adult cats
                length_variance = random.uniform(-1.0, 1.0)  # Weekly measurement variance
                
                current_length = base_length + growth_factor + length_variance
                current_length = max(base_length - 3, min(base_length + 5, current_length))
                
                # Length measurements typically done during vet visits or careful measurements
                length_hour = random.choices([10, 11, 14, 15], weights=[0.3, 0.3, 0.2, 0.2])[0]
                length_minute = random.choices([0, 15, 30, 45], weights=[0.4, 0.2, 0.2, 0.2])[0]
                
                self.create_health_record_with_time(pet, current_date, 'Length', 
                                                  round(current_length, 1), 'cm', 
                                                  length_hour, length_minute)
                length_records += 1
                records_created += 1
            
            current_date += timedelta(days=1)
        
        print(f"📈 Created {records_created} health records for {pet.name}")
        print(f"   ⚖️  Weight measurements: {weight_records} (daily)")
        print(f"   📏 Length measurements: {length_records} (weekly)")
        print(f"   📊 Final weight: {current_weight:.2f} kg (Δ {current_weight-base_weight:+.2f})")
        print(f"   📐 Final length: {current_length:.1f} cm (Δ {current_length-base_length:+.1f})")
    
    def create_health_record_with_time(self, pet, date, attribute, value, unit, hour, minute):
        """Helper to create a health status record with specific time"""
        HealthStatus.objects.create(
            pet=pet,
            attribute_name=attribute,
            value=value,
            unit=unit,
            measured_at=timezone.make_aware(
                datetime.combine(date, datetime.min.time().replace(hour=hour, minute=minute))
            )
        )
    
    def create_health_record(self, pet, date, attribute, value, unit):
        """Helper to create a health status record with default time"""
        HealthStatus.objects.create(
            pet=pet,
            attribute_name=attribute,
            value=value,
            unit=unit,
            measured_at=timezone.make_aware(
                datetime.combine(date, datetime.min.time())
            )
        )
    
    def generate_vaccination_data(self, pet):
        """Generate realistic vaccination records"""
        # Clear ALL existing vaccination records for this pet
        deleted_count = Vaccination.objects.filter(pet=pet).delete()[0]
        if deleted_count > 0:
            print(f"🧹 Cleared {deleted_count} existing vaccination records for {pet.name}")
        
        # Common cat vaccinations with realistic schedules
        vaccinations = [
            {
                'code': 'FVRCP',
                'name': 'Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia',
                'interval_days': 365,
                'priority': 'Core'
            },
            {
                'code': 'Rabies',
                'name': 'Rabies Vaccine',
                'interval_days': 365,
                'priority': 'Core'
            },
            {
                'code': 'FeLV',
                'name': 'Feline Leukemia Virus',
                'interval_days': 365,
                'priority': 'Non-core'
            },
            {
                'code': 'FIV',
                'name': 'Feline Immunodeficiency Virus',
                'interval_days': 365,
                'priority': 'Non-core'
            }
        ]
        
        vaccine_count = 0
        
        for vaccine in vaccinations:
            # Past vaccination (completed)
            past_date = self.start_date + timedelta(
                days=random.randint(30, 180)
            )
            
            Vaccination.objects.create(
                pet=pet,
                vaccination_name=vaccine['name'],
                vaccinated_at=past_date,
                schedule_at=past_date,
                vaccination_status='Completed',
                vaccination_notes=f"{vaccine['priority']} vaccination - {vaccine['code']} completed successfully. Next due in 12 months."
            )
            vaccine_count += 1
            
            # Future booster (pending)
            future_date = past_date + timedelta(days=vaccine['interval_days'])
            if future_date <= self.end_date:
                Vaccination.objects.create(
                    pet=pet,
                    vaccination_name=f"{vaccine['name']} (Annual Booster)",
                    schedule_at=future_date,
                    vaccination_status='Pending',
                    vaccination_notes=f"Annual booster for {vaccine['code']} - {vaccine['priority']} vaccination due for renewal."
                )
                vaccine_count += 1
        
        print(f"💉 Created {vaccine_count} vaccination records for {pet.name}")
    
    def print_summary(self, pets):
        """Print a summary of generated data"""
        print("\n" + "="*50)
        print("📋 MOCK DATA GENERATION SUMMARY")
        print("="*50)
        
        total_days = (self.end_date - self.start_date).days + 1
        
        for pet in pets:
            print(f"\n🐱 {pet.name} (ID: {pet.id})")
            print(f"   Species: {pet.species}")
            print(f"   Color: {pet.color}")
            print(f"   Gender: {pet.gender}")
            print(f"   Microchip: {pet.microchip_number}")
            
            # Count health records by type
            health_count = HealthStatus.objects.filter(
                pet=pet,
                measured_at__date__gte=self.start_date,
                measured_at__date__lte=self.end_date
            ).count()
            
            weight_count = HealthStatus.objects.filter(
                pet=pet,
                attribute_name='Weight',
                measured_at__date__gte=self.start_date,
                measured_at__date__lte=self.end_date
            ).count()
            
            length_count = HealthStatus.objects.filter(
                pet=pet,
                attribute_name='Length',
                measured_at__date__gte=self.start_date,
                measured_at__date__lte=self.end_date
            ).count()
            
            # Count vaccinations
            vaccine_count = Vaccination.objects.filter(pet=pet).count()
            
            print(f"   📊 Total Health Records: {health_count}")
            print(f"   ⚖️  Weight Records: {weight_count} (daily)")
            print(f"   📏 Length Records: {length_count} (weekly)")
            print(f"   💉 Vaccinations: {vaccine_count}")
        
        print(f"\n📅 Date Range: {self.start_date} to {self.end_date}")
        print(f"🗓️  Total Days: {total_days}")
        print(f"🐾 Total Pets: {len(pets)}")
        
        total_health = sum(HealthStatus.objects.filter(
            pet=pet,
            measured_at__date__gte=self.start_date,
            measured_at__date__lte=self.end_date
        ).count() for pet in pets)
        
        total_weight = sum(HealthStatus.objects.filter(
            pet=pet,
            attribute_name='Weight',
            measured_at__date__gte=self.start_date,
            measured_at__date__lte=self.end_date
        ).count() for pet in pets)
        
        total_length = sum(HealthStatus.objects.filter(
            pet=pet,
            attribute_name='Length',
            measured_at__date__gte=self.start_date,
            measured_at__date__lte=self.end_date
        ).count() for pet in pets)
        
        total_vaccines = sum(Vaccination.objects.filter(pet=pet).count() for pet in pets)
        
        print(f"📈 Total Health Records: {total_health}")
        print(f"⚖️  Total Weight Records: {total_weight}")
        print(f"📏 Total Length Records: {total_length}")
        print(f"💉 Total Vaccinations: {total_vaccines}")
        print("\n🎯 TIME-BASED DATA FEATURES:")
        print("   • Weight tracked daily with realistic fluctuations")
        print("   • Length measured weekly with gradual changes")
        print("   • All measurements include realistic timestamps")
        print("   • Natural variance and trends over 13+ months")
        print("="*50)


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate mock data for pet health tracking with time-based measurements')
    parser.add_argument('--user-id', type=int, default=1,
                       help='User ID to assign pets to (default: 1)')
    
    args = parser.parse_args()
    
    generator = MockDataGenerator(user_id=args.user_id)
    success = generator.run()
    
    if success:
        print("\n✅ Mock data generation completed successfully!")
        print("🕐 Weight and length data generated with realistic time progression!")
    else:
        print("\n❌ Mock data generation failed!")
        sys.exit(1) 