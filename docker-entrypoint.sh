#!/bin/sh

# Jalankan migrasi database
echo "Running migrations..."
npx prisma migrate deploy

# Jalankan aplikasi
echo "Starting application..."
node server.js
