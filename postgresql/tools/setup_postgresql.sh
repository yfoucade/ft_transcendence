#! /bin/bash

export PATH=$PATH:/usr/lib/postgresql/15/bin

sed -i "s/<postgres_user>/${POSTGRES_USER}/g" /etc/postgresql/15/main/pg_hba.conf
sed -i "s/<network_name>/${NETWORK_NAME}/g" /etc/postgresql/15/main/pg_hba.conf

chown -R postgres:postgres /var/lib/postgresql/15/main/

service postgresql start

psql -U postgres -c "CREATE ROLE $POSTGRES_USER WITH LOGIN PASSWORD '$POSTGRES_PASSWORD' CREATEDB;"
psql -U postgres -c "CREATE DATABASE $POSTGRES_USER OWNER $POSTGRES_USER;"
psql -U postgres -d $POSTGRES_USER -c	"CREATE TABLE IF NOT EXISTS account (\
											id SERIAL PRIMARY KEY NOT NULL, \
											username VARCHAR(40) UNIQUE NOT NULL \
										);"
psql -U postgres -d $POSTGRES_USER -c	"ALTER TABLE account OWNER TO $POSTGRES_USER;"

export PGUSER=$POSTGRES_USER

service postgresql stop

# su postgres -c "postgres"
exec "$@"