# Mock Data Generator for MilkandButter Pet Care

This directory contains scripts to generate comprehensive mock data for testing and development of the pet health tracking features with realistic time-based measurements.

## 🐾 Generated Data Overview

The scripts create realistic mock data for **2 cats** with the following specifications:

### Pet Profiles
- **Pet 3**: "Milk" (ID: 3) - 2.6 kg Female White with Gray patches Cat
- **Pet 2**: "Butter" (ID: 2) - 3.8 kg Male Golden Tabby Cat

### Date Range
- **Start**: June 1, 2024
- **End**: June 28, 2025
- **Duration**: ~393 days of continuous data

### Health Tracking Data (Daily with Time-based Measurements)
- **Weight**: Daily measurements with realistic fluctuations around base weight (±10%)
  - Natural seasonal variations and gradual trends over time
  - Realistic measurement times (usually morning 7-10 AM)
  - Shows progression from start to end weight with delta tracking
- **Water Intake**: Based on body weight (~50ml/kg) with variance throughout the day
- **Activity Level**: Minutes of active time (varies by cat size, measured in evenings)
- **Bowel Movements**: 1-3 times per day (realistic distribution, 8 AM - 8 PM)
- **Urination Frequency**: 2-5 times per day (7 AM - 9 PM)
- **Mood**: Normal, Lethargic, Hyperactive, Aggressive, Clingy (observed during awake hours)

### Health Tracking Data (Periodic with Time-based Measurements)
- **Coat Condition**: Every 3 days (Normal, Shedding, Hair Loss, Dry, Dull)
  - Measured during grooming/inspection times (10 AM - 4 PM)
- **Length**: Weekly measurements with gradual changes over time
  - Simulates very slow growth for adult cats
  - Realistic measurement times (during vet visits: 10-11 AM, 2-3 PM)
  - Shows progression from start to end length with delta tracking

### Vaccination Records
- **FVRCP**: Core vaccination with annual boosters
- **Rabies**: Core vaccination with annual boosters  
- **FeLV**: Non-core vaccination (Feline Leukemia)
- **FIV**: Non-core vaccination (Feline Immunodeficiency)

## 🚀 Usage Methods

### Method 1: Django Management Command (Recommended)

```bash
# Navigate to backend directory
cd backend

# Run with default user (ID: 1)
python manage.py generate_mock_data

# Run with specific user ID
python manage.py generate_mock_data --user-id 2
```

### Method 2: Standalone Python Script

```bash
# Navigate to backend directory
cd backend

# Run with default user (ID: 1)
python generate_mock_data.py

# Run with specific user ID
python generate_mock_data.py --user-id 2
```

## 📋 Prerequisites

1. **Django Environment**: Ensure Django is properly configured and database is migrated
2. **User Account**: At least one user must exist in the system
3. **Database Access**: Script needs write access to the database

### Check if User Exists
```bash
# Django shell
python manage.py shell

# Check users
from django.contrib.auth.models import User
print(f"Available users: {list(User.objects.values('id', 'username'))}")
```

### Create User if Needed
```bash
# Create superuser
python manage.py createsuperuser

# Or create regular user via Django shell
python manage.py shell
>>> from django.contrib.auth.models import User
>>> User.objects.create_user('testuser', 'test@example.com', 'password123')
```

## 📊 Expected Output

The script will generate approximately:
- **~2,800 health records** per pet (daily + periodic measurements)
- **~393 weight measurements** per pet (daily tracking)
- **~56 length measurements** per pet (weekly tracking)
- **~8 vaccination records** per pet (completed + pending)
- **Total: ~5,600+ database records** for comprehensive testing

### Sample Output
```
🐾 Generating mock data from 2024-06-01 to 2025-06-28
✅ Using user: admin (ID: 1)
✨ Created new pet: Milk (ID: 3)
✨ Created new pet: Butter (ID: 2)

📊 Generating time-based health data for Milk...
   📈 Starting weight: 2.60 kg
   📏 Starting length: 47.5 cm
🧹 Cleared 0 existing health records
📈 Created 2847 health records for Milk
   ⚖️  Weight measurements: 393 (daily)
   📏 Length measurements: 56 (weekly)
   📊 Final weight: 2.68 kg (Δ +0.08)
   📐 Final length: 48.2 cm (Δ +0.7)

💉 Generating vaccination data for Milk...
💉 Created 8 vaccination records for Milk

📊 Generating time-based health data for Butter...
   📈 Starting weight: 3.80 kg
   📏 Starting length: 51.9 cm
📈 Created 2847 health records for Butter
   ⚖️  Weight measurements: 393 (daily)
   📏 Length measurements: 56 (weekly)
   📊 Final weight: 3.72 kg (Δ -0.08)
   📐 Final length: 52.4 cm (Δ +0.5)

💉 Generating vaccination data for Butter...
💉 Created 8 vaccination records for Butter

🎉 Successfully generated mock data for 2 pets!

==================================================
📋 MOCK DATA GENERATION SUMMARY
==================================================

🐱 Milk (ID: 3)
   Species: Cat
   Color: White with Gray patches
   Gender: Female
   Microchip: CAT000001
   📊 Total Health Records: 2847
   ⚖️  Weight Records: 393 (daily)
   📏 Length Records: 56 (weekly)
   💉 Vaccinations: 8

🐱 Butter (ID: 2)
   Species: Cat
   Color: Golden Tabby
   Gender: Male
   Microchip: CAT000002
   📊 Total Health Records: 2847
   ⚖️  Weight Records: 393 (daily)
   📏 Length Records: 56 (weekly)
   💉 Vaccinations: 8

📅 Date Range: 2024-06-01 to 2025-06-28
🗓️  Total Days: 393
🐾 Total Pets: 2
📈 Total Health Records: 5694
⚖️  Total Weight Records: 786
📏 Total Length Records: 112
💉 Total Vaccinations: 16

🎯 TIME-BASED DATA FEATURES:
   • Weight tracked daily with realistic fluctuations
   • Length measured weekly with gradual changes
   • All measurements include realistic timestamps
   • Natural variance and trends over 13+ months
==================================================

✅ Mock data generation completed successfully!
🕐 Weight and length data generated with realistic time progression!
```

## 🔧 Customization

### Modifying Pet Data
Edit the `pets_config` in the script to change:
- Pet names, weights, colors
- Species, gender, microchip numbers
- Date of birth and medical conditions

### Adjusting Health Parameters
Modify the health data generation logic to:
- Change measurement frequencies (daily/weekly/monthly)
- Adjust realistic value ranges and variance
- Add new health attributes
- Modify probability distributions
- Change time-of-day measurement patterns

### Time-based Data Features
The enhanced time-based data includes:
- **Seasonal weight variations**: Subtle yearly cycles
- **Measurement timing**: Realistic times based on attribute type
- **Gradual trends**: Weight and length changes over 13+ months
- **Natural variance**: Random but bounded fluctuations
- **Growth simulation**: Very slow growth for adult cats

### Adding More Pets
Extend the `pets_config` array with additional pet configurations.

## 🧹 Data Cleanup

The scripts automatically clear existing data for the specified pets and date range before generating new data. This prevents duplicates and ensures clean test datasets.

## ⚠️ Important Notes

1. **Data Overwrites**: The script will delete existing health and vaccination data for pets with IDs 2 and 3
2. **Performance**: Generating ~6,000 records may take 30-60 seconds depending on database performance
3. **User Assignment**: All pets will be assigned to the specified user ID
4. **Realistic Variance**: Data includes natural fluctuations to simulate real pet health monitoring
5. **Time-based Accuracy**: All measurements include realistic timestamps for proper temporal analysis
6. **Progressive Changes**: Weight and length show realistic progression over the 13+ month period

## 🐛 Troubleshooting

### Common Issues

**"User with ID X not found"**
- Create a user first or specify an existing user ID
- Check available users: `User.objects.all()`

**"Permission denied"**
- Ensure database write permissions
- Check Django settings and database configuration

**"Module not found"**
- Run from the correct directory (backend/)
- Ensure Django environment is properly set up

**"Database locked"**
- Close any database admin tools
- Check for other running Django processes

### Getting Help

For issues with the mock data generation:
1. Check the Django logs for detailed error messages
2. Verify database connectivity and permissions
3. Ensure all required Django models are properly migrated
4. Test with a smaller date range first if performance is an issue

## 🎯 Key Features of Time-based Data

### Weight Tracking
- **Daily measurements** from June 2024 to June 2025
- **Realistic fluctuations** around base weight (±10% max)
- **Seasonal variations** with subtle yearly cycles
- **Gradual trends** showing natural weight changes over time
- **Morning measurement times** (7-10 AM most common)
- **Delta tracking** showing total change from start to finish

### Length Tracking  
- **Weekly measurements** (every 7 days)
- **Very gradual growth** for adult cats (~0.5 cm/year)
- **Measurement variance** simulating real-world accuracy issues
- **Realistic timing** during vet visits or careful measurements
- **Professional scheduling** (10-11 AM, 2-3 PM intervals)
- **Progression tracking** with clear start/end comparisons

### Time Accuracy
- **Attribute-specific timing**: Different health metrics measured at appropriate times
- **Natural patterns**: Weight in morning, activity at night, etc.  
- **Random variance**: Realistic measurement scheduling
- **Professional contexts**: Length during vet visits, coat during grooming
- **Full timestamp support**: Compatible with time-series analysis and charting 