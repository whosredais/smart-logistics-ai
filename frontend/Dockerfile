FROM node:20-alpine

WORKDIR /app

# Installation des dépendances
COPY package.json package-lock.json ./
RUN npm install

# Copie du reste du projet
COPY . .

# Exposition du port
EXPOSE 3000

# Lancement en mode dev (pour garder le hot-reload si besoin)
CMD ["npm", "run", "dev"]