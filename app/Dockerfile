FROM debian:bookworm
RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get install -y postgresql-15
RUN apt-get install -y python3 python3-venv
RUN python3 -m venv env

# nginx
RUN apt-get install -y curl gnupg2 ca-certificates lsb-release debian-archive-keyring
RUN apt-get install -y nginx

WORKDIR /etc/ssl/certs
RUN openssl req -x509 -out server.crt -keyout server.key -newkey rsa:2048 -nodes -sha256 -subj '/C=FR/ST=Paris/O=42-Paris/CN=ft_transcendence'
WORKDIR /

COPY init_app.sh .
COPY transcendence.conf.template /etc/nginx/sites-enabled/transcendence.conf

RUN rm /etc/nginx/sites-enabled/default

EXPOSE 80
EXPOSE 443
EXPOSE 8000
EXPOSE 8080

ENTRYPOINT ["bash", "./init_app.sh"]
# CMD ["tail", "-f", "/dev/null"]
# CMD ["gunicorn", "--env", "DJANGO_SETTINGS_MODULE=config.settings", "config.wsgi", "--bind=0.0.0.0:8000"]
# CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
CMD ["python", "src/manage.py", "runserver", "0.0.0.0:8000"]
# CMD ["daphne", "-u", "/tmp/daphne.sock", "config.asgi:application"]