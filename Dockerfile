# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install backend dependencies
COPY package*.json ./
RUN npm install

# Copy backend files
COPY server ./server

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server/index.js"]
