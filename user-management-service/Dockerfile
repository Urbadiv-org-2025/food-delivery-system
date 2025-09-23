# Use an Alpine base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies and clean cache
RUN npm install && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user
RUN adduser -D appuser

# Change to non-root user
USER appuser

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/ || exit 1

# Start application
CMD ["npm", "start"]