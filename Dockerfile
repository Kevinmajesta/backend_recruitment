# Tahap pertama: Pembangunan (Build Stage)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Copy folder prisma agar engine bisa di-generate
COPY prisma ./prisma/ 

RUN npm install

COPY . .

# Generate Prisma Client di tahap builder
RUN npx prisma generate

# Tahap kedua: Produksi (Production Stage)
FROM node:20-alpine

# Instal tzdata dan openssl (Prisma butuh openssl untuk koneksi DB)
RUN apk --no-cache add tzdata openssl

WORKDIR /app

COPY package*.json ./
# Install hanya dependensi produksi
RUN npm install --omit=dev

# Salin folder prisma (penting untuk migrasi)
COPY --from=builder /app/prisma ./prisma
# Salin node_modules yang sudah berisi Prisma Client yang ter-generate
COPY --from=builder /app/node_modules ./node_modules
# Salin seluruh kode aplikasi
COPY --from=builder /app ./ 

ENV TZ=Asia/Jakarta
RUN cp /usr/share/zoneinfo/Asia/Jakarta /etc/localtime && echo "Asia/Jakarta" > /etc/timezone

RUN mkdir -p /app/assets/images && chmod 777 /app/assets/images

# Opsional: Jika kamu ingin menjalankan migrasi otomatis saat container menyala
# Kita buat script startup sederhana
RUN echo 'npx prisma migrate deploy && node cmd/app/index.js' > /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

RUN chown -R node:node /app
USER node

EXPOSE 8080

# Jalankan via entrypoint agar migrasi terpanggil
CMD ["sh", "-c", "npx prisma migrate deploy && node cmd/app/index.js"]