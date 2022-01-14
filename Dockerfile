FROM node:16-alpine

ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_ENV=production

WORKDIR /app

COPY ["express/package.json","express/index.js", "/app/"]

# Install app dependencies
# echo https://mirrors.aliyun.com/alpine/v3.6/main/ > /etc/apk/repositories  && apk add autoconf automake libtool 

#RUN  npm install --production
RUN  npm install --production

COPY dist /app/dist

EXPOSE 9004

CMD ["node", "index.js"]