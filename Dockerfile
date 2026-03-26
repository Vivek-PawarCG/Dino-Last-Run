# Leverage the hyper-optimized Alpine V18 base image
FROM node:18-alpine

# Set the active workspace
WORKDIR /usr/src/app

# Stage dependencies
COPY package*.json ./
RUN npm install

# Load all source files (excluding .dockerignore cache logic)
COPY . .

# Force target React production asset compilation
RUN npm run build

# Force expose default Containerized Cloud Execution routing protocols
EXPOSE 8080

# Spin the monolithic backend logic
CMD [ "npm", "start" ]
