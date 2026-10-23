FROM node:22.23.4
WORKDIR /app
COPY app/package.json .
RUN npm install