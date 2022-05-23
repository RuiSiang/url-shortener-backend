FROM node:16 AS BUILD_IMAGE
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin
WORKDIR /build
COPY . .
RUN npm ci
RUN npm prune --production
RUN /usr/local/bin/node-prune
CMD [ "node", "index.js" ]
