FROM debian:bookworm

COPY init_app.sh .
COPY requirements.txt .
COPY transcendence.conf.template /etc/nginx/sites-enabled/transcendence.conf
COPY img/default_profile_picture_32x32.png /var/www/transcendence/media/default_pp.png
COPY img/pongwars-title.png /var/www/transcendence/media/
COPY img/t-icon.ico /var/www/transcendence/media/
COPY assets/VeniteAdoremusStraight.ttf /var/www/transcendence/media/
COPY assets/VeniteAdoremus-rgRBA.ttf /var/www/transcendence/media/

RUN apt-get update
RUN apt-get -y upgrade
# postgresql
RUN apt-get install -y postgresql-15
# python
RUN apt-get install -y python3 python3-venv
RUN python3 -m venv env
RUN /env/bin/python3 -m pip install -r requirements.txt
# nginx
RUN apt-get install -y curl gnupg2 ca-certificates lsb-release debian-archive-keyring
RUN apt-get install -y nginx
# redis
RUN apt-get install -y lsb-release curl gpg
RUN curl -fsSL https://packages.redis.io/gpg | gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/redis.list
RUN apt-get update
RUN apt-get install -y redis

WORKDIR /etc/ssl/certs
RUN openssl req -x509 -out server.crt -keyout server.key -newkey rsa:2048 -nodes -sha256 -subj '/C=FR/ST=Paris/O=42-Paris/CN=ft_transcendence'
WORKDIR /

RUN rm /etc/nginx/sites-enabled/default

EXPOSE 80
EXPOSE 443
EXPOSE 8000
EXPOSE 8080

ENTRYPOINT ["bash", "/init_app.sh"]
# CMD ["tail", "-f", "/dev/null"]
# CMD ["gunicorn", "--env", "DJANGO_SETTINGS_MODULE=config.settings", "config.wsgi", "--bind=0.0.0.0:8000"]
# CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
# CMD ["python", "-u", "manage.py", "runserver", "0.0.0.0:8000"]
CMD ["daphne", "-u", "/tmp/daphne.sock", "config.asgi:application"]