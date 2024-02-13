#! /bin/bash

source /env/bin/activate

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