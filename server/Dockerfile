FROM node:16 AS builder

WORKDIR /usr/builder

COPY ./package* ./
COPY ./tsconfig.json ./
COPY ./src ./src

RUN npm ci
RUN npx tsc

###

FROM alpine:3.15

RUN apk add --no-cache --update nodejs ca-certificates

WORKDIR /usr/src/app

COPY --from=builder /usr/builder/node_modules ./node_modules
COPY --from=builder /usr/builder/dist ./dist

# Remove apk
RUN rm -rf /sbin/apk /etc/apk /lib/apk /usr/share/apk /var/lib/apk

RUN addgroup --gid 10001 --system nonroot \
  && adduser  --uid 10000 --system --ingroup nonroot --home /home/nonroot nonroot

# Use the non-root user to run our application
USER nonroot

EXPOSE 10001

ENV NODE_ENV=production
CMD [ "node", "./dist/api" ]