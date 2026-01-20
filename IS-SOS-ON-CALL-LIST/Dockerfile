FROM node:18-alpine AS node

FROM nginx:stable-alpine

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

COPY ./ /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

RUN npm install --force && npm run build

RUN echo "#!/bin/sh" >> /init.sh &&\
    echo "cd /usr/share/nginx/html" >> /init.sh &&\
    echo "npx @import-meta-env/cli -x .env -e .env -p dist/index.html" >> /init.sh &&\
    echo "nginx -g 'daemon off;'" >> /init.sh &&\
    chmod +x /init.sh

CMD ["/init.sh"]
