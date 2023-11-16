#! /bin/bash

# use pip freeze > requirements.txt
# pip install -r requirements.txt
source /env/bin/activate
pip install --upgrade pip
pip install Django==4.2.7
pip install psycopg

exec "$@"