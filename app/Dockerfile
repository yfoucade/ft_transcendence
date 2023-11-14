FROM debian:bookworm
RUN apt-get update
RUN apt-get -y upgrade
RUN apt install -y postgresql-15

EXPOSE 5432
CMD ["tail", "-f", "/dev/null"]