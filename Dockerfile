
FROM node:18 AS builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:18

WORKDIR /app

COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/dist ./dist

RUN yarn install --production --frozen-lockfile

ARG JSON_PLACEHOLDER_URL
RUN test -n "$JSON_PLACEHOLDER_URL" || (echo "JSON_PLACEHOLDER_URL is not set" && exit 1)
ENV JSON_PLACEHOLDER_URL=${JSON_PLACEHOLDER_URL}

EXPOSE 3000

CMD ["node", "dist/main.js"]
