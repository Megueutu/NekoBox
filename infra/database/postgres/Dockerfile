FROM postgres:16.14-alpine@sha256:57c72fd2a128e416c7fcc499958864df5301e940bca0a56f58fddf30ffc07777

COPY infra/database/postgres/script_bd.sql /opt/nekobox/script_bd.sql
COPY infra/database/postgres/seed-on-start.sh /usr/local/bin/seed-on-start

RUN chmod 0555 /usr/local/bin/seed-on-start

ENTRYPOINT ["seed-on-start"]
CMD ["postgres"]
