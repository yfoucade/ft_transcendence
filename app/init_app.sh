#! /bin/bash

# use pip freeze > requirements.txt
# pip install -r requirements.txt
source /env/bin/activate
pip install --upgrade pip
# pip install Django==4.2.7
pip install Django
pip install psycopg
pip install channels
pip install daphne
pip install Pillow
pip install channels_redis

cd src/
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc"  -delete
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser --noinput
# cd /

redis-server --daemonize yes
nginx
exec "$@"