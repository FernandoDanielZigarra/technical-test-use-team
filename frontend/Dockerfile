FROM node:22-alpine

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install

# Copiar código fuente
COPY . .

# Exponer puerto de desarrollo de Vite
EXPOSE 5173

# Comando para desarrollo
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]