FROM debian:bookworm
RUN apt-get update
RUN apt-get -y upgrade
RUN apt install -y postgresql-15

COPY conf/pg_hba.conf /etc/postgresql/15/main/pg_hba.conf
COPY conf/postgresql.conf /etc/postgresql/15/main/postgresql.conf
COPY tools/setup_postgresql.sh .

EXPOSE 5432

ENTRYPOINT ["bash", "setup_postgresql.sh"]
# CMD ["tail", "-f", "/dev/null"]
CMD ["su", "postgres", "-c", "postgres"]