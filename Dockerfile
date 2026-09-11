FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY index.html login.html register.html /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css/
COPY js /usr/share/nginx/html/js/
COPY image /usr/share/nginx/html/image/

COPY docker-entrypoint-config.sh /docker-entrypoint.d/40-generate-config.sh

EXPOSE 80
