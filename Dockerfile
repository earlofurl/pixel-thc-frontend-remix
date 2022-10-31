###################
# BUILD FOR LOCAL DEVELOPMENT
###################

# stage build
FROM node:18-alpine AS development

# set working directory
WORKDIR /app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package*.json ./

# Install app dependencies using the `npm ci` command instead of `npm install` for clean install
RUN npm ci

# Set NODE_ENV environment variable
ENV NODE_ENV development

# Bundle app source
COPY --chown=node:node . .

# remove potential security issues
RUN npm audit fix

# build SvelteKit app
RUN npm run build

# Use the node user from the image (instead of the root user)
USER node
