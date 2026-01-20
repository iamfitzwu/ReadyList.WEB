FROM node:20-alpine AS node

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
    echo "echo '=== Checking .env file ==='" >> /init.sh &&\
    echo "if [ -f .env ]; then" >> /init.sh &&\
    echo "  echo '.env file exists'" >> /init.sh &&\
    echo "  cat .env" >> /init.sh &&\
    echo "else" >> /init.sh &&\
    echo "  echo '.env file NOT found!'" >> /init.sh &&\
    echo "fi" >> /init.sh &&\
    echo "echo '=== Running import-meta-env ==='" >> /init.sh &&\
    echo "npx @import-meta-env/cli -x .env -e .env -p dist/index.html" >> /init.sh &&\
    echo "echo '=== Checking injected HTML ==='" >> /init.sh &&\
    echo "grep 'import_meta_env' dist/index.html || echo 'No import_meta_env found'" >> /init.sh &&\
    echo "nginx -g 'daemon off;'" >> /init.sh &&\
    chmod +x /init.sh

CMD ["/init.sh"]
