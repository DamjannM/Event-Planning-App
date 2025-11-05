# Use official node.js runtime
FROM node:22-alpine

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files including schema
COPY . .

# Expose port and start
EXPOSE 5000

CMD npx prisma generate && npm run dev
