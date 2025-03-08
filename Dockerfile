# Use the official Node.js image from the Docker Hub
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Clean npm cache and install dependencies
RUN npm cache clean --force && \
    npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Use the PORT environment variable
ARG APP_PORT=4002 # Default port if APP_PORT is not provided
ENV APP_PORT=${APP_PORT}

# Expose the port your app runs on
EXPOSE ${PORT}

# Start the application
CMD ["npm", "run", "start:dev"]