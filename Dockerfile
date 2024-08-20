FROM bitnami/node:18

WORKDIR /app
COPY package*.json /app/

RUN npm install -g npm@9
RUN npm install --omit=dev --unsafe-perm=true 

COPY qa.env /app/.env
COPY ./ /app/

RUN npm run build

ENV NODE_OPTIONS='--max-http-header-size=80000'

EXPOSE 3000
CMD npm run start
