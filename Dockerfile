# Multi-stage build for React/Vite application
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=http://125.99.241.72:3000
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

RUN apk add --no-cache curl

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

USER nginx

EXPOSE 5175

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5175/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
