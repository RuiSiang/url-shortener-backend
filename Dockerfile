FROM node:16 AS BUILD_IMAGE
WORKDIR /build
COPY . .
RUN npm ci
RUN npm prune --production
CMD [ "node", "index.js" ]
