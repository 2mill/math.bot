FROM node:10
WORKDIR /usr/src/app
COPY package.json .
COPY wolfram-alpha-api-1.0.0-rc.1.tgz .
ENV DISCORD_TOKEN=$DISCORD_TOKEN
ENV WOLFRAM_APP_ID=$WOLFRAM_APP_ID
RUN npm install
COPY . .
CMD ["npm", "run", "deploy"]
