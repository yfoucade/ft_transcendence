#! /bin/bash

# use pip freeze > requirements.txt
# pip install -r requirements.txt
source /env/bin/activate
pip install --upgrade pip
# pip install Django==4.2.7
pip install Django
pip install psycopg
pip install daphne

cd src/
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser --noinput
cd /

nginx
exec "$@"