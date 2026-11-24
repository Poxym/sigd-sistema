# ---- desarrollo: ng serve con recarga en caliente (docker compose) ----
FROM node:24-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 4200
CMD ["npm", "start"]

# ---- producción: compila y sirve estáticos con nginx ----
FROM dev AS build
RUN npx ng build

FROM nginx:1.29-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
