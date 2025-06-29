FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY certs/cert.pem /etc/ssl/certs/aleph-cert.pem
COPY certs/key.pem /etc/ssl/private/aleph-key.pem

RUN chmod 644 /etc/ssl/certs/aleph-cert.pem && \
    chmod 600 /etc/ssl/private/aleph-key.pem
