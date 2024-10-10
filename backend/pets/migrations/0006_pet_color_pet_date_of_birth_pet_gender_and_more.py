# Generated by Django 4.2.4 on 2024-10-10 17:23

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('pets', '0005_alter_healthstatus_value'),
    ]

    operations = [
        migrations.AddField(
            model_name='pet',
            name='color',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='pet',
            name='date_of_birth',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='pet',
            name='gender',
            field=models.CharField(choices=[('Male', 'Male'), ('Female', 'Female'), ('Unknown', 'Unknown')], default='Male', max_length=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='pet',
            name='medical_conditions',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='pet',
            name='microchip_number',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.CreateModel(
            name='Vaccination',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('vaccinated_at', models.DateField()),
                ('vaccination_name', models.CharField(max_length=100)),
                ('vaccination_status', models.CharField(choices=[('Completed', 'Completed'), ('Pending', 'Pending'), ('Unknown', 'Unknown')], max_length=10)),
                ('vaccination_notes', models.TextField(blank=True, null=True)),
                ('tag_proof', models.ImageField(blank=True, null=True, upload_to='tag_proof/')),
                ('pet', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pets.pet')),
            ],
        ),
    ]