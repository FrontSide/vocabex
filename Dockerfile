FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

RUN mkdir db

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"] 
