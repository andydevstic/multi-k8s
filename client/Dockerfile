FROM node:alpine AS builder

WORKDIR "/app"

COPY ./package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------------------------

FROM nginx

# Expose port 3000 to serve static front-end contents to local containers of AWS EB.
# EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html