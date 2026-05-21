FROM node:20-alpine

# Install dependencies only when needed
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Build Next.js application
RUN npm run build

# Start production server
EXPOSE 3000
CMD ["npm", "start"]
