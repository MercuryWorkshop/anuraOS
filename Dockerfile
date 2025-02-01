# Use the official Node.js 16 Alpine image as the base image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy all files from the current directory to the working directory in the container
COPY . .

# Install Node.js dependencies
RUN npm install

# If there are any build steps, such as compiling TypeScript or bundling JavaScript, include them here
# Run the build step to compile TypeScript or bundle JavaScript
RUN npm run build

# Expose the port the application will run on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]