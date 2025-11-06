# Use official node.js runtime
FROM node:22-alpine

WORKDIR /app

# Install required system packages for Prisma engine
RUN apk add --no-cache openssl libc6-compat

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files including schema
COPY . .

# Generate Prisma client at build time
RUN npx prisma generate

# Expose port and start
EXPOSE 5000

CMD ["npm", "run", "dev"]
