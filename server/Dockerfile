# Use official node.js runtime
FROM node:22-alpine

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files including schema
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Expose port and start
EXPOSE 5000
CMD ["npm", "run", "dev"]
