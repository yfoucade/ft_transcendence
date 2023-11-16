FROM debian:bookworm
RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get install -y postgresql-15
RUN apt-get install -y python3 python3-venv
RUN python3 -m venv env

COPY init_app.sh .

EXPOSE 8000

ENTRYPOINT ["bash", "./init_app.sh"]
# CMD ["tail", "-f", "/dev/null"]
CMD ["python", "src/manage.py", "runserver", "0.0.0.0:8000"]