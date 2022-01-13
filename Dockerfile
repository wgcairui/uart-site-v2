FROM node:16-alpine

ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "/app/"]

# Install app dependencies
# echo https://mirrors.aliyun.com/alpine/v3.6/main/ > /etc/apk/repositories  && apk add autoconf automake libtool 

#RUN  npm install --production
RUN  npm install -g vite

COPY dist /app/dist

EXPOSE 9004

CMD ["npm", "run", "start"]