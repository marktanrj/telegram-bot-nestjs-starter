# Step 1: Build the application
# Use a Node.js image
FROM node:20.16.0 as build

# Create app directory
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json, pnpm-lock.yaml and other necessary files
# This might vary depending on your project structure
COPY package.json pnpm-lock.yaml ./

# Install app dependencies
RUN pnpm install

# Bundle app source
COPY . .

# Build the NestJS application
RUN pnpm run build

# Step 2: Create the production image
# Use a smaller Node.js image for the production build
FROM node:20.16.0-alpine3.19

# Create app directory
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy built node modules and build artifacts from the previous stage
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Copy other necessary files
COPY package.json pnpm-lock.yaml ./

# App binds to port 4000 by default
EXPOSE 4000
