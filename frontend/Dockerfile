FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* ถูกฝังลง bundle ตอน build — ส่งค่าจาก docker-compose (build args)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ENV NODE_ENV=production
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
