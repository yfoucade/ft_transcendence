#! /bin/bash

source /env/bin/activate
pip install --upgrade pip
pip install Django==4.2.7

exec "$@"