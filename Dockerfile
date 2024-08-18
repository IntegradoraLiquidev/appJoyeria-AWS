# Usar una imagen base de Node.js
FROM node:18

# Instalar dependencias adicionales como Expo CLI y watchman
RUN apt-get update && apt-get install -y \
    git \
    wget \
    watchman \
    && rm -rf /var/lib/apt/lists/*

# Instalar Expo CLI globalmente
RUN npm install -g expo-cli

# Crear y configurar el directorio de la aplicación
WORKDIR /app

# Instalar dependencias de la aplicación
COPY package*.json ./
RUN npm ci

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto 19000 para el servidor de desarrollo de Expo
EXPOSE 3000

# Comando para iniciar el servidor Expo
CMD ["expo", "start", "--tunnel"]
