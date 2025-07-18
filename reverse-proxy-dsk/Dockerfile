FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY certs/cert.pem /etc/ssl/certs/aleph-cert-dsk.pem
COPY certs/key.pem /etc/ssl/private/aleph-key-dsk.pem

RUN chmod 644 /etc/ssl/certs/aleph-cert-dsk.pem && \
    chmod 600 /etc/ssl/private/aleph-key-dsk.pem
