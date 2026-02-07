#!/bin/sh
set -e  # Detiene el script si algún comando falla

echo "🔄 Ejecutando migraciones de Prisma..."
npm run prisma:deploy

echo "✅ Migraciones completadas"
echo "🚀 Iniciando aplicación..."
npm run start:prod