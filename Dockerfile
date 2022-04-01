FROM node:16-alpine

ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_ENV=production

WORKDIR /app

COPY ["express/package.json", "express/index.js", "express/xt.config.js", "/app/"]

RUN mkdir /app/xprofiler_output
# Install app dependencies
# echo https://mirrors.aliyun.com/alpine/v3.6/main/ > /etc/apk/repositories  && apk add autoconf automake libtool 

RUN  npm install --production

ENV NODE_Docker=docker

COPY dist /app/dist
#COPY express/node_modules dist/node_modules

EXPOSE 9004

CMD ["node", "index.js"]