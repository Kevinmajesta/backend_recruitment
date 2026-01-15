# Tahap pertama: Pembangunan (Build Stage)
FROM node:20-alpine AS builder

# Set lingkungan kerja
WORKDIR /app

# Mengcopy package.json dan package-lock.json (untuk caching layer)
COPY package*.json ./

# Menginstall semua dependensi (termasuk devDependencies untuk build/typescript)
RUN npm install

# Mengcopy seluruh kode sumber
COPY . .

# Jika kamu menggunakan TypeScript, jalankan perintah build di sini:
# RUN npm run build

# Tahap kedua: Produksi (Production Stage)
FROM node:20-alpine

# Instal tzdata untuk dukungan zona waktu
RUN apk --no-cache add tzdata

WORKDIR /app

# Salin package.json dan install hanya dependensi produksi (lebih ringan & aman)
COPY package*.json ./
RUN npm install --omit=dev

# Mengcopy hasil dari builder
# Jika menggunakan TS, ganti '.' dengan folder dist: COPY --from=builder /app/dist ./dist
COPY --from=builder /app ./ 

# Konfigurasi zona waktu
ENV TZ=Asia/Jakarta
RUN cp /usr/share/zoneinfo/Asia/Jakarta /etc/localtime && echo "Asia/Jakarta" > /etc/timezone

# Membuat direktori /assets/images dan mengatur izin
RUN mkdir -p /app/assets/images && chmod 777 /app/assets/images

# Menjalankan aplikasi sebagai user non-root (Keamanan tambahan)
# Node image sudah menyediakan user 'node'
RUN chown -R node:node /app
USER node

# Port yang dibuka
EXPOSE 8080

# Jalankan aplikasi (sesuaikan dengan script di package.json)
CMD ["node", "index.js"]