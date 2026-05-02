# Stage 1: Build the Vite application
FROM node:22-alpine as builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application files
# Note: Ensure the .env file with Firebase variables is copied during the build
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run sets the PORT environment variable to 8080 by default. 
# Our custom nginx.conf listens on 8080.
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
