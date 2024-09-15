# BE

```
conda create -n milk_and_butter python=3.10
conda activate milk_and_butter
pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate

python manage.py runserver
```