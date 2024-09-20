###################
# BASE IMAGE
###################

# Define build-time variables (ARG)
ARG NODE_VERSION=18-alpine
ARG USER=node

FROM node:${NODE_VERSION} AS base

# Set the working directory for the application
WORKDIR /usr/src/app

# Install dumb-init and libc6-compat for broader compatibility and signal handling
RUN apk add --no-cache dumb-init libc6-compat

# Set environment variables (ENV)
ENV NODE_ENV=production
ENV USER=${USER}

###################
# DEPENDENCIES
###################

FROM base AS dependencies

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

###################
# BUILD FOR DEVELOPMENT
###################

FROM dependencies AS development

# Override NODE_ENV for development
ENV NODE_ENV=development

# Copy the entire application source code
COPY --chown=${USER}:${USER} . .

# Install development dependencies
RUN npm install --only=development

USER ${USER}

###################
# RUNNING FOR DEVELOPMENT
###################

FROM development AS dev-runner

# Override NODE_ENV for development
ENV NODE_ENV=development

# Use dumb-init to start the application in development mode
ENTRYPOINT ["dumb-init", "npm", "run", "start:dev"]

###################
# BUILD FOR PRODUCTION
###################

FROM dependencies AS build

# Ensure production environment
ENV NODE_ENV=production

# Copy the entire application source code
COPY --chown=${USER}:${USER} . .

# Build the application
RUN npm run build

USER ${USER}

###################
# RUNNING FOR PRODUCTION
###################

FROM base AS production

# Set the final working directory
WORKDIR /usr/src/app

# Set NODE_ENV for the production environment
ENV NODE_ENV=production

# Copy only the necessary files from the build and dependencies stages
COPY --from=build /usr/src/app/dist ./dist
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=dependencies /usr/src/app/package.json ./package.json

# Ensure correct file ownership and permissions
RUN chown -R node:node .

# Use a non-root user to run the application
USER ${USER}

# Use dumb-init to start the application using the npm script
ENTRYPOINT ["dumb-init", "node", "dist/server.js"]
