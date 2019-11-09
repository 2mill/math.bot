FROM node:6.11.5
WORKDIR /usr/src/app
COPY package.json .
COPY wolfram-alpha-api-1.0.0-rc.1.tgz .
COPY ".env" . 
RUN npm install
COPY . .
CMD ["npm", "run", "watch"]
