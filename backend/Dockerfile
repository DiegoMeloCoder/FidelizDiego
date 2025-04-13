# ---- Base Node ----
# Use a specific LTS version for reproducibility
FROM node:18 AS base
WORKDIR /usr/src/app
# Install dependencies first, in a separate step to take advantage of Docker caching
COPY package*.json ./
# Install only production dependencies for the final stage if needed later
# RUN npm ci --only=production
# For build stage, install all dependencies
RUN npm ci

# ---- Build Stage ----
# (If you had a build step like TypeScript compilation, it would go here)
# FROM base AS build
# WORKDIR /usr/src/app
# COPY . .
# RUN npm run build

# ---- Production Stage ----
# Use a slim Node image for the final image
FROM node:18-alpine AS production
WORKDIR /usr/src/app

# Copy built artifacts and production dependencies from the base stage
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/package*.json ./
# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE ${PORT:-5000}

# Set environment variables (optional, can be overridden)
ENV NODE_ENV=production
# ENV PORT=5000 # Already exposed, but can be set here too

# Command to run the application
# Use node directly for better signal handling than npm start
CMD [ "node", "server.js" ]
